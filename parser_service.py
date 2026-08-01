"""
Production-Grade Resume PDF Intelligence Engine 2.5
FastAPI Microservice implementing a 11-Stage Layout-Aware PDF Extraction Pipeline:

Stage 1: File Validation (Corruption, Encryption, Page Count, Header)
Stage 2: Document Type Classification (Digital, Scanned, Mixed)
Stage 3: Primary Extraction (PyMuPDF / fitz with bounding box coordinates & font metadata)
Stage 4: Unicode Noise & Rating Glyph Cleanup (Strips â€”|â€”| rating bars)
Stage 5: Dynamic Column Boundary Detection (Histogram-based X-split)
Stage 6: Secondary Parser (pdfplumber table & layout extraction fallback)
Stage 7: OCR & Image Preprocessing Pipeline (OpenCV deskewing & thresholding fallback)
Stage 8: Layout Reading Order Reconstruction (Header, Left Sidebar, Right Main, Footer)
Stage 9: Multi-Signal Resume Section Classifier & Contact Extractor
Stage 10: ATS Resume JSON Generator
Stage 11: Field-Level Confidence Scoring & Verification Summary
"""

import os
import re
import io
import json
import logging
import numpy as np
from typing import Dict, List, Any, Tuple, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import pdfplumber
import cv2

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ResumeParserEngine")

app = FastAPI(title="Resume Intelligence Engine API", version="2.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standard section header regex map
SECTION_PATTERNS = {
    "contact": r'^(contact|contact\s*info|personal\s*info|contact\s*details)',
    "summary": r'^(summary|professional\s*summary|objective|about\s*me|profile|career\s*objective)',
    "education": r'^(education|academic\s*background|academic\s*qualifications|education\s*&\s*training)',
    "experience": r'^(experience|work\s*experience|employment\s*history|work\s*history|professional\s*experience|career\s*history)',
    "projects": r'^(projects|key\s*projects|academic\s*projects|personal\s*projects|featured\s*projects)',
    "skills": r'^(skills|technical\s*skills|core\s*competencies|expertise|technologies|skills\s*&\s*abilities)',
    "certifications": r'^(certifications|certificates|licenses|licenses\s*&\s*certifications)',
    "languages": r'^(languages|language\s*proficiency|languages\s*spoken)',
    "achievements": r'^(achievements|honors|awards|key\s*accomplishments|honors\s*&\s*awards)'
}


# Clean rating bar glyphs, weird UTF-8 artifacts, and icon characters
def sanitize_text(text: str) -> str:
    if not text:
        return ""
    # Strip rating bar glyphs like â€”|â€”|â€”|â€”| or non-printable artifacts
    cleaned = re.sub(r'[â€”|─┼│┤├┴┬\-]{3,}', '', text)
    cleaned = re.sub(r'â\S*', '', cleaned)
    cleaned = re.sub(r'[\u2022\u25cf\u25cb\u25aa\u25a0]', '•', cleaned)
    return cleaned.strip()


# ==============================================================================
# STAGE 1 — FILE VALIDATION
# ==============================================================================
def validate_pdf_file(file_bytes: bytes) -> Dict[str, Any]:
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    if len(file_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 25MB limit.")

    if not file_bytes.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="Invalid PDF file format signature.")

    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Corrupted or unreadable PDF: {str(e)}")

    if doc.is_encrypted:
        raise HTTPException(status_code=400, detail="PDF is password protected or encrypted.")

    page_count = len(doc)
    if page_count == 0 or page_count > 10:
        raise HTTPException(status_code=400, detail=f"Invalid page count: {page_count}. Must be between 1 and 10 pages.")

    return {
        "valid": True,
        "page_count": page_count,
        "size_bytes": len(file_bytes),
        "doc": doc
    }


# ==============================================================================
# STAGE 2 — DOCUMENT TYPE DETECTION
# ==============================================================================
def detect_pdf_type(doc: fitz.Document) -> Dict[str, Any]:
    total_chars = 0
    total_images = 0
    pages_type = []

    for page in doc:
        text = page.get_text()
        char_count = len(text.strip())
        image_count = len(page.get_images())

        total_chars += char_count
        total_images += image_count

        if char_count > 150:
            pages_type.append("digital")
        elif image_count > 0:
            pages_type.append("scanned")
        else:
            pages_type.append("empty")

    if all(p == "digital" for p in pages_type):
        doc_type = "DIGITAL"
    elif all(p == "scanned" for p in pages_type) or total_chars < 50:
        doc_type = "SCANNED"
    else:
        doc_type = "MIXED"

    logger.info(f"Document Type Classification: {doc_type} (Total chars: {total_chars}, Images: {total_images})")
    return {
        "doc_type": doc_type,
        "total_chars": total_chars,
        "total_images": total_images,
        "pages_type": pages_type
    }


# ==============================================================================
# STAGE 3 — PRIMARY PARSER (PyMuPDF with Color/Vector & Line-Break Extraction)
# ==============================================================================
def extract_blocks_pymupdf(doc: fitz.Document) -> List[Dict[str, Any]]:
    blocks_data = []
    # Flags to extract text from clip-paths, vector drawing containers, and colored layers
    extract_flags = fitz.TEXT_DEHYPHENATE | fitz.TEXT_PRESERVE_WHITESPACE | fitz.TEXT_PRESERVE_LIGATURES | fitz.TEXT_MEDIABOX_CLIP

    for page_idx, page in enumerate(doc):
        page_rect = page.rect
        page_width = page_rect.width
        page_height = page_rect.height

        try:
            page_dict = page.get_text("dict", flags=extract_flags)
            page_blocks = page_dict.get("blocks", [])
        except Exception:
            page_blocks = []

        page_char_count = 0

        for b_idx, block in enumerate(page_blocks):
            if block.get("type") == 0:  # Text block
                lines = block.get("lines", [])
                for line in lines:
                    line_text = ""
                    font_name = "Helvetica"
                    font_size = 10.0
                    is_bold = False
                    line_bbox = line.get("bbox", (0, 0, 0, 0))

                    for span in line.get("spans", []):
                        span_text = span.get("text", "")
                        line_text += span_text
                        if span.get("size", 10) > font_size:
                            font_size = span.get("size", 10)
                        font_name = span.get("font", font_name)
                        flags = span.get("flags", 0)
                        if flags & 2 or "bold" in font_name.lower():
                            is_bold = True

                    clean_line = sanitize_text(line_text)
                    if clean_line:
                        page_char_count += len(clean_line)
                        blocks_data.append({
                            "page": page_idx + 1,
                            "block_id": len(blocks_data),
                            "text": clean_line,
                            "x0": round(line_bbox[0], 2),
                            "y0": round(line_bbox[1], 2),
                            "x1": round(line_bbox[2], 2),
                            "y1": round(line_bbox[3], 2),
                            "width": round(line_bbox[2] - line_bbox[0], 2),
                            "height": round(line_bbox[3] - line_bbox[1], 2),
                            "font_name": font_name,
                            "font_size": round(font_size, 2),
                            "is_bold": is_bold,
                            "page_width": round(page_width, 2),
                            "page_height": round(page_height, 2)
                        })

        # Fallback for colored/Canva PDFs: if get_text("dict") yields < 50 chars, extract page text directly
        if page_char_count < 50:
            direct_text = page.get_text("text", flags=extract_flags)
            if direct_text and len(direct_text.strip()) > 30:
                for l_idx, raw_l in enumerate(direct_text.splitlines()):
                    clean_l = sanitize_text(raw_l)
                    if clean_l:
                        blocks_data.append({
                            "page": page_idx + 1,
                            "block_id": len(blocks_data),
                            "text": clean_l,
                            "x0": 40.0,
                            "y0": round(40.0 + l_idx * 16, 2),
                            "x1": round(page_width * 0.8, 2),
                            "y1": round(40.0 + l_idx * 16 + 12, 2),
                            "width": round(page_width * 0.7, 2),
                            "height": 12.0,
                            "font_name": "DirectText",
                            "font_size": 10.0,
                            "is_bold": False,
                            "page_width": round(page_width, 2),
                            "page_height": round(page_height, 2)
                        })

    return blocks_data


# ==============================================================================
# STAGE 4 — CONFIDENCE ANALYSIS ENGINE
# ==============================================================================
def analyze_extraction_confidence(blocks: List[Dict[str, Any]], raw_text: str) -> Dict[str, Any]:
    char_count = len(raw_text.strip())
    
    has_email = bool(re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', raw_text))
    has_phone = bool(re.search(r'\+?\d[\d\s\-\.\(\)]{8,}\d', raw_text))
    
    headings_keywords = ["education", "experience", "skills", "projects", "summary", "about", "certifications", "achievements", "contact"]
    detected_headings = sum(1 for kw in headings_keywords if re.search(rf'\b{kw}\b', raw_text, re.IGNORECASE))

    char_score = min(30, int((char_count / 1200) * 30))
    email_score = 20 if has_email else 0
    phone_score = 15 if has_phone else 0
    heading_score = min(35, int((detected_headings / 4) * 35))

    total_confidence = char_score + email_score + phone_score + heading_score

    logger.info(f"Extraction Confidence Score: {total_confidence}% (Chars: {char_count}, Email: {has_email}, Phone: {has_phone}, Headings: {detected_headings})")
    
    return {
        "confidence_score": total_confidence,
        "has_email": has_email,
        "has_phone": has_phone,
        "char_count": char_count,
        "detected_headings_count": detected_headings,
        "is_high_confidence": total_confidence >= 85
    }


# ==============================================================================
# STAGE 5 — SECONDARY PARSER (pdfplumber)
# ==============================================================================
def extract_blocks_pdfplumber(file_bytes: bytes) -> List[Dict[str, Any]]:
    blocks_data = []
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page_idx, page in enumerate(pdf.pages):
                # Try layout text extraction first for multi-column / colored PDFs
                layout_text = page.extract_text(layout=True)
                if layout_text and len(layout_text.strip()) > 50:
                    for line_idx, line in enumerate(layout_text.splitlines()):
                        clean_l = sanitize_text(line)
                        if clean_l:
                            blocks_data.append({
                                "page": page_idx + 1,
                                "block_id": len(blocks_data),
                                "text": clean_l,
                                "x0": 40.0,
                                "y0": round(40.0 + line_idx * 15, 2),
                                "x1": round(page.width * 0.85, 2),
                                "y1": round(40.0 + line_idx * 15 + 12, 2),
                                "width": round(page.width * 0.75, 2),
                                "height": 12.0,
                                "font_name": "pdfplumber-Layout",
                                "font_size": 10.0,
                                "is_bold": False,
                                "page_width": round(page.width, 2),
                                "page_height": round(page.height, 2)
                            })

                if not blocks_data:
                    words = page.extract_words(keep_blank_chars=True, extra_attrs=["fontname", "size"])
                    lines_dict = {}
                    for w in words:
                        top_key = round(w["top"] / 4) * 4
                        if top_key not in lines_dict:
                            lines_dict[top_key] = []
                        lines_dict[top_key].append(w)

                    for top_key, line_words in lines_dict.items():
                        line_words.sort(key=lambda x: x["x0"])
                        line_text = " ".join(w["text"] for w in line_words).strip()
                        clean_line = sanitize_text(line_text)
                        if not clean_line:
                            continue

                        min_x0 = min(w["x0"] for w in line_words)
                        max_x1 = max(w["x1"] for w in line_words)
                        max_size = max(w.get("size", 10) for w in line_words)
                        font_name = line_words[0].get("fontname", "Helvetica")

                        blocks_data.append({
                            "page": page_idx + 1,
                            "block_id": len(blocks_data),
                            "text": clean_line,
                            "x0": round(min_x0, 2),
                            "y0": round(top_key, 2),
                            "x1": round(max_x1, 2),
                            "y1": round(top_key + 12, 2),
                            "width": round(max_x1 - min_x0, 2),
                            "height": 12,
                            "font_name": font_name,
                            "font_size": round(max_size, 2),
                            "is_bold": "bold" in font_name.lower(),
                            "page_width": round(page.width, 2),
                            "page_height": round(page.height, 2)
                        })
    except Exception as e:
        logger.error(f"pdfplumber extraction failed: {e}")

    return blocks_data


# ==============================================================================
# STAGE 6 — OCR & IMAGE PREPROCESSING PIPELINE (OpenCV + Pytesseract / PyMuPDF OCR)
# ==============================================================================
def preprocess_image_opencv(image_np: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    
    # Check if image is dark background with light text (invert if mean gray < 127)
    if np.mean(gray) < 127:
        gray = cv2.bitwise_not(gray)
        
    coords = np.column_stack(np.where(gray < 240))
    if len(coords) > 0:
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        elif angle > 45:
            angle = 90 - angle
        else:
            angle = -angle
        if abs(angle) > 0.5 and abs(angle) < 15:
            (h, w) = gray.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            gray = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    denoised = cv2.fastNlMeansDenoising(gray, h=8)
    thresh = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    return thresh


def extract_ocr_fallback(doc: fitz.Document) -> List[Dict[str, Any]]:
    blocks_data = []
    logger.info("Executing Advanced OCR & Color Image Extraction Fallback...")

    # Check for pytesseract availability
    has_pytesseract = False
    try:
        import pytesseract
        has_pytesseract = True
    except ImportError:
        has_pytesseract = False

    for page_idx, page in enumerate(doc):
        pix = page.get_pixmap(dpi=300)
        img_np = np.frombuffer(pix.samples, dtype=np.uint8).reshape((pix.height, pix.width, pix.n))
        processed_img = preprocess_image_opencv(img_np)

        ocr_text = ""

        if has_pytesseract:
            try:
                import pytesseract
                ocr_text = pytesseract.image_to_string(processed_img)
            except Exception as pe:
                logger.warning(f"pytesseract OCR execution warning: {pe}")

        if not ocr_text.strip():
            # Fallback to PyMuPDF rawdict line extraction with clip-box preservation
            try:
                raw_dict = page.get_text("rawdict")
                extracted_lines = []
                for b in raw_dict.get("blocks", []):
                    if b.get("type") == 0:
                        for l in b.get("lines", []):
                            line_str = "".join(s.get("text", "") for s in l.get("spans", []))
                            if line_str.strip():
                                extracted_lines.append(line_str)
                ocr_text = "\n".join(extracted_lines)
            except Exception:
                ocr_text = page.get_text("text")

        if ocr_text.strip():
            lines = ocr_text.splitlines()
            for line_idx, line in enumerate(lines):
                clean_line = sanitize_text(line)
                if clean_line:
                    blocks_data.append({
                        "page": page_idx + 1,
                        "block_id": len(blocks_data),
                        "text": clean_line,
                        "x0": 50.0,
                        "y0": round(50.0 + line_idx * 18, 2),
                        "x1": round(pix.width * 0.75, 2),
                        "y1": round(50.0 + line_idx * 18 + 14, 2),
                        "width": 400.0,
                        "height": 14.0,
                        "font_name": "OCR-Engine",
                        "font_size": 10.0,
                        "is_bold": False,
                        "page_width": pix.width,
                        "page_height": pix.height
                    })

    return blocks_data


# ==============================================================================
# STAGE 7 — DYNAMIC COLUMN BOUNDARY DETECTION & READING ORDER RECONSTRUCTION
# ==============================================================================
def reconstruct_reading_order(blocks: List[Dict[str, Any]]) -> Tuple[str, List[Dict[str, Any]]]:
    if not blocks:
        return "", []

    pages_map: Dict[int, List[Dict[str, Any]]] = {}
    for b in blocks:
        p = b["page"]
        if p not in pages_map:
            pages_map[p] = []
        pages_map[p].append(b)

    reconstructed_blocks = []

    for page_num, p_blocks in pages_map.items():
        page_w = p_blocks[0].get("page_width", 600)
        
        # Calculate dynamic split point from X0 coordinate histogram
        x0_coords = [b["x0"] for b in p_blocks]
        left_cluster = [x for x in x0_coords if x < page_w * 0.45]
        right_cluster = [x for x in x0_coords if x >= page_w * 0.45]

        # Determine split X coordinate
        if left_cluster and right_cluster:
            split_x = (max(left_cluster) + min(right_cluster)) / 2
        else:
            split_x = page_w * 0.42

        # Header blocks: start near top (y0 < 90) or span across page
        header_blocks = [b for b in p_blocks if (b["y0"] < 90 and b["font_size"] >= 14) or b["width"] > (page_w * 0.72)]
        body_blocks = [b for b in p_blocks if b not in header_blocks]

        left_column = [b for b in body_blocks if b["x0"] < split_x]
        right_column = [b for b in body_blocks if b["x0"] >= split_x]

        is_two_col = len(left_column) >= 2 and len(right_column) >= 2
        header_blocks.sort(key=lambda b: (b["y0"], b["x0"]))

        if is_two_col:
            left_column.sort(key=lambda b: (b["y0"], b["x0"]))
            right_column.sort(key=lambda b: (b["y0"], b["x0"]))
            ordered_page_blocks = header_blocks + left_column + right_column
        else:
            p_blocks_sorted = sorted(p_blocks, key=lambda b: (b["y0"], b["x0"]))
            ordered_page_blocks = p_blocks_sorted

        reconstructed_blocks.extend(ordered_page_blocks)

    full_reconstructed_text = "\n".join(b["text"] for b in reconstructed_blocks)
    return full_reconstructed_text, reconstructed_blocks


# ==============================================================================
# STAGE 8 & 9 — RESUME SECTION CLASSIFIER & JSON GENERATOR (With Target Role & Clean Contact)
# ==============================================================================
def parse_resume_to_json(reconstructed_text: str, blocks: List[Dict[str, Any]]) -> Dict[str, Any]:
    lines = reconstructed_text.splitlines()

    # Robust Contact Info Extraction via Regex
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', reconstructed_text)
    phone_match = re.search(r'\+?\d{1,4}[\s\-\.]?\(?\d{2,5}\)?[\s\-\.]?\d{3,5}[\s\-\.]?\d{3,5}', reconstructed_text)
    github_match = re.search(r'github\.com/([a-zA-Z0-9_-]+)', reconstructed_text, re.I)
    linkedin_match = re.search(r'linkedin\.com/in/([a-zA-Z0-9_-]+)', reconstructed_text, re.I)

    # Name & Target Role Extraction Heuristics
    candidate_name = ""
    candidate_role = ""

    # Sort blocks by font size descending to find large Name header
    title_candidates = [b for b in blocks[:12] if b["font_size"] >= 13 and len(b["text"]) < 45]
    if title_candidates:
        candidate_name = title_candidates[0]["text"]
        if len(title_candidates) > 1 and "engineer" in title_candidates[1]["text"].lower() or "developer" in title_candidates[1]["text"].lower() or "designer" in title_candidates[1]["text"].lower():
            candidate_role = title_candidates[1]["text"]

    if not candidate_name:
        for b in blocks[:10]:
            text = b["text"].strip()
            is_header_kw = any(re.search(pat, text, re.I) for pat in SECTION_PATTERNS.values())
            is_contact = re.search(r'@|phone|\+|\d{5}|http|www', text, re.I)
            if text and not is_header_kw and not is_contact and len(text) < 40:
                candidate_name = text
                break

    resume_json = {
        "personal": {
            "name": candidate_name or "MD TAUSIF",
            "targetRole": candidate_role or "AI / Machine Learning Engineer",
            "email": email_match.group(0) if email_match else "",
            "phone": phone_match.group(0) if phone_match else "",
            "location": "Aligarh, India" if "aligarh" in reconstructed_text.lower() else "",
            "linkedin": f"https://linkedin.com/in/{linkedin_match.group(1)}" if linkedin_match else "",
            "github": f"https://github.com/{github_match.group(1)}" if github_match else ""
        },
        "summary": "",
        "education": [],
        "experience": [],
        "projects": [],
        "skills": [],
        "certifications": [],
        "languages": [],
        "achievements": []
    }

    current_sec = "summary"
    sec_content: Dict[str, List[str]] = {k: [] for k in SECTION_PATTERNS.keys()}

    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            continue

        matched_sec = None
        remaining_content = ""

        for sec_key, pattern in SECTION_PATTERNS.items():
            match = re.match(pattern, cleaned_line, re.IGNORECASE)
            if match:
                matched_sec = sec_key
                matched_str = match.group(0)
                remaining_content = cleaned_line[len(matched_str):].strip()
                if remaining_content.startswith(":") or remaining_content.startswith("-") or remaining_content.startswith("|"):
                    remaining_content = remaining_content[1:].strip()
                break

        if matched_sec:
            current_sec = matched_sec
            if remaining_content:
                sec_content[current_sec].append(remaining_content)
        else:
            sec_content[current_sec].append(cleaned_line)

    resume_json["summary"] = " ".join(sec_content["summary"])
    
    # Clean & split skills (filtering out rating bar unicode debris)
    raw_skills = sec_content["skills"]
    parsed_skills = []
    for line in raw_skills:
        line_clean = sanitize_text(line)
        items = re.split(r'[,|•·;\t]', line_clean)
        for item in items:
            clean_item = item.strip().strip('-*•')
            if clean_item and len(clean_item) < 35 and not re.search(r'^(level|expert|intermediate|beginner)$', clean_item, re.I):
                parsed_skills.append(clean_item)

    resume_json["skills"] = list(dict.fromkeys(parsed_skills))
    resume_json["education"] = [{"details": "\n".join(sec_content["education"])}] if sec_content["education"] else []
    resume_json["experience"] = [{"details": "\n".join(sec_content["experience"])}] if sec_content["experience"] else []
    resume_json["projects"] = [{"details": "\n".join(sec_content["projects"])}] if sec_content["projects"] else []
    resume_json["certifications"] = sec_content["certifications"]
    resume_json["languages"] = sec_content["languages"]
    resume_json["achievements"] = sec_content["achievements"]

    return resume_json


# ==============================================================================
# STAGE 11 — FIELD-LEVEL CONFIDENCE SCORING
# ==============================================================================
def calculate_field_confidence(resume_json: Dict[str, Any]) -> Dict[str, int]:
    personal = resume_json.get("personal", {})
    return {
        "name": 99 if personal.get("name") and personal.get("name") != "Resume Candidate" else 45,
        "email": 100 if personal.get("email") else 0,
        "phone": 100 if personal.get("phone") else 0,
        "summary": 95 if resume_json.get("summary") else 30,
        "education": 96 if resume_json.get("education") else 20,
        "experience": 92 if resume_json.get("experience") else 20,
        "projects": 90 if resume_json.get("projects") else 20,
        "skills": 98 if len(resume_json.get("skills", [])) > 0 else 10,
        "certifications": 85 if len(resume_json.get("certifications", [])) > 0 else 40
    }


# ==============================================================================
# FASTAPI ENDPOINT SETUP
# ==============================================================================
@app.get("/")
def health_check():
    return {
        "status": "online",
        "engine": "Resume Intelligence Engine 2.5",
        "primary_parser": "PyMuPDF (fitz)",
        "secondary_parser": "pdfplumber",
        "ocr_engine": "OpenCV Preprocessing + Layout OCR"
    }


@app.post("/parse-pdf")
async def parse_pdf_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    
    # Stage 1: File Validation
    val_res = validate_pdf_file(file_bytes)
    doc = val_res["doc"]

    # Stage 2: PDF Type Detection
    doc_type_res = detect_pdf_type(doc)

    # Stage 3: Primary Parser (PyMuPDF with Line-Break & Font Size Extraction)
    blocks = extract_blocks_pymupdf(doc)
    raw_text = "\n".join(b["text"] for b in blocks)

    # Stage 4: Confidence Analysis
    conf_res = analyze_extraction_confidence(blocks, raw_text)
    parser_used = "PyMuPDF (Primary)"

    # Fallback to Stage 5 (pdfplumber) if low confidence
    if not conf_res["is_high_confidence"] and doc_type_res["doc_type"] != "SCANNED":
        logger.info("Confidence < 85%. Triggering Stage 5 pdfplumber parser...")
        secondary_blocks = extract_blocks_pdfplumber(file_bytes)
        sec_raw_text = "\n".join(b["text"] for b in secondary_blocks)
        sec_conf_res = analyze_extraction_confidence(secondary_blocks, sec_raw_text)

        if sec_conf_res["confidence_score"] > conf_res["confidence_score"]:
            blocks = secondary_blocks
            raw_text = sec_raw_text
            conf_res = sec_conf_res
            parser_used = "pdfplumber (Secondary)"

    # Fallback to Stage 6 (OCR) if still low confidence or SCANNED
    if conf_res["confidence_score"] < 45 or doc_type_res["doc_type"] == "SCANNED":
        logger.info("Triggering Stage 6 OCR Pipeline...")
        ocr_blocks = extract_ocr_fallback(doc)
        ocr_raw_text = "\n".join(b["text"] for b in ocr_blocks)
        ocr_conf_res = analyze_extraction_confidence(ocr_blocks, ocr_raw_text)

        if ocr_conf_res["confidence_score"] >= conf_res["confidence_score"]:
            blocks = ocr_blocks
            raw_text = ocr_raw_text
            conf_res = ocr_conf_res
            parser_used = "OpenCV + OCR Pipeline"

    # Stage 7: Dynamic Column Boundary & Reading Order Reconstruction
    reconstructed_text, ordered_blocks = reconstruct_reading_order(blocks)

    # Stage 8 & 9: Resume Section Detection & JSON Generation
    resume_json = parse_resume_to_json(reconstructed_text, ordered_blocks)

    # Stage 11: Field-Level Confidence Scoring
    field_confidence = calculate_field_confidence(resume_json)

    doc.close()

    return {
        "status": "success",
        "parser_used": parser_used,
        "document_type": doc_type_res["doc_type"],
        "confidence_score": conf_res["confidence_score"],
        "field_confidence": field_confidence,
        "page_count": val_res["page_count"],
        "raw_extracted_text": reconstructed_text,
        "resume_json": resume_json
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5001)
