require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.static(path.join(__dirname)));

// Multer — store uploaded PDF in memory (up to 30MB, relaxed PDF mime filter)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        if (ext === '.pdf' || (file.mimetype && (file.mimetype.includes('pdf') || file.mimetype === 'application/octet-stream'))) {
            cb(null, true);
        } else {
            cb(null, true); // Allow upload and let python validation inspect magic bytes
        }
    }
});

// ============================================
// AI PROMPT BUILDER - CONTEXT-AWARE
// ============================================

function buildPrompt(data) {
    const { personalDetails, purpose, experienceLevel, targetRole, skills, categoryFields } = data;

    let prompt = `You are an expert resume writer specializing in ${purpose.toLowerCase()} resumes. Create a polished, ATS-friendly resume based ONLY on the following user-provided information. Do NOT invent any information. Improve grammar, structure, and presentation.\n\n`;

    prompt += `PURPOSE: ${purpose}\n`;
    prompt += `EXPERIENCE LEVEL: ${experienceLevel}\n`;
    prompt += `TARGET ROLE: ${targetRole || 'Not specified'}\n\n`;

    prompt += `PERSONAL DETAILS:\n`;
    prompt += `- Name: ${personalDetails.fullName}\n`;
    prompt += `- Email: ${personalDetails.email}\n`;
    prompt += `- Phone: ${personalDetails.phone}\n`;
    prompt += `- Location: ${personalDetails.location}\n`;
    if (personalDetails.dob) prompt += `- Date of Birth: ${personalDetails.dob}\n`;
    if (personalDetails.additionalInfo) prompt += `- Additional Info: ${personalDetails.additionalInfo}\n`;
    if (personalDetails.linkedin) prompt += `- LinkedIn: ${personalDetails.linkedin}\n`;
    if (personalDetails.github) prompt += `- GitHub: ${personalDetails.github}\n`;
    if (personalDetails.languages) prompt += `- Languages: ${personalDetails.languages}\n`;

    prompt += `\nEDUCATION DETAILS:\n`;
    if (personalDetails.college) {
        prompt += `- Undergraduate: ${personalDetails.college}, ${personalDetails.degree}, Grad Year: ${personalDetails.gradYear}`;
        if (personalDetails.undergradGpa) prompt += `, GPA/CGPA: ${personalDetails.undergradGpa}`;
        prompt += `\n`;
    }
    if (personalDetails.interSchool) {
        prompt += `- Intermediate (Class XII): ${personalDetails.interSchool}, Board: ${personalDetails.interBoard}, Year: ${personalDetails.interYear}, Percentage/GPA: ${personalDetails.interGpa}\n`;
    }
    if (personalDetails.highSchool) {
        prompt += `- Matriculation (Class X): ${personalDetails.highSchool}, Board: ${personalDetails.highBoard}, Year: ${personalDetails.highYear}, Percentage/GPA: ${personalDetails.highGpa}\n`;
    }

    prompt += `\nSKILLS: ${skills.join(', ')}\n`;

    prompt += `\nCATEGORY-SPECIFIC INFORMATION:\n`;
    Object.entries(categoryFields).forEach(([key, value]) => {
        if (value) prompt += `- ${key}: ${value}\n`;
    });

    // Section instructions based on purpose
    if (purpose === 'Campus Club') {
        prompt += `\n\nGenerate a resume with these sections (use the exact section names):\n`;
        prompt += `1. NAME\n2. CONTACT\n3. ABOUT ME\n4. EDUCATION\n5. WHY I WANT TO JOIN\n6. SKILLS\n7. PROJECTS\n8. ACHIEVEMENTS\n9. LANGUAGES\n`;
        prompt += `\nTone: Enthusiastic, genuine, student-friendly. Highlight motivation and campus involvement.\n`;
    } else if (purpose === 'Internship' || purpose === 'Job' || purpose === 'Freelance') {
        prompt += `\n\nGenerate a resume with these sections (use the exact section names):\n`;
        prompt += `1. NAME\n2. CONTACT\n3. PROFESSIONAL SUMMARY\n4. EDUCATION\n5. SKILLS\n6. PROJECTS\n7. EXPERIENCE\n8. CERTIFICATIONS\n9. ACHIEVEMENTS\n10. REFERENCES\n`;
        prompt += `\nTone: Professional, concise, ATS-optimized. Use action verbs and quantifiable results where possible.\n`;
    } else if (purpose === 'Academic') {
        prompt += `\n\nGenerate a resume with these sections (use the exact section names):\n`;
        prompt += `1. NAME\n2. CONTACT\n3. ACADEMIC PROFILE\n4. EDUCATION\n5. COURSEWORK\n6. RESEARCH\n7. PROJECTS\n8. SKILLS\n9. ACHIEVEMENTS\n`;
        prompt += `\nTone: Formal, academic, research-oriented. Highlight scholarly achievements and intellectual curiosity.\n`;
    }

    prompt += `\n\nFORMAT: Use plain text with section headers in ALL CAPS followed by a blank line, then the content. Keep it professional, concise, and ATS-friendly. Each section should be 3-8 lines.\n`;
    prompt += `\nIMPORTANT: Only use information provided by the user. Do not add fake companies, fake projects, or fake achievements.\n`;
    prompt += `\nLENGTH BALANCING (important for layout): This resume will be rendered into a fixed one-page template with two columns, so section length matters as much as content.\n`;
    prompt += `- If the user gave you a LOT of raw detail for a section, do NOT drop any point, achievement, or credential — instead compress it: shorter sentences, tighter phrasing, merge related points, cut filler words. Every fact the user provided must still appear, just written more concisely.\n`;
    prompt += `- If the user gave very little detail for a section, expand it slightly using ONLY what they told you — describe the same facts in fuller, more complete sentences (impact, context, tools used) rather than inventing new accomplishments. Do not pad with generic filler that adds no real information.\n`;
    prompt += `- Aim for each major section (Experience, Projects, Skills, Education, etc.) to be roughly similar in visual weight so no column of the final layout ends up mostly empty while another overflows.\n`;

    return prompt;
}

function generateResumeFallback(data) {
    const { personalDetails, purpose, experienceLevel, targetRole, skills, categoryFields } = data;
    let text = '';

    text += `NAME\n${personalDetails.fullName}\n\n`;
    text += `CONTACT\n`;
    text += `Email: ${personalDetails.email}\n`;
    text += `Phone: ${personalDetails.phone}\n`;
    text += `Location: ${personalDetails.location}\n`;
    if (personalDetails.dob) text += `Date of Birth: ${personalDetails.dob}\n`;
    if (personalDetails.linkedin) text += `LinkedIn: ${personalDetails.linkedin}\n`;
    if (personalDetails.github) text += `GitHub: ${personalDetails.github}\n`;
    if (personalDetails.languages) text += `Languages: ${personalDetails.languages}\n`;
    if (personalDetails.additionalInfo) text += `Additional Info: ${personalDetails.additionalInfo}\n`;
    text += `\n`;

    if (purpose === 'Campus Club') {
        text += `ABOUT ME\n`;
        text += `I am a ${experienceLevel.toLowerCase()} ${personalDetails.degree} student at ${personalDetails.college}, passionate about contributing to campus activities. `;
        text += `With a strong foundation in ${skills.slice(0, 3).join(', ') || 'relevant skills'}, I am eager to bring fresh ideas and dedication to the team.\n\n`;
        
        text += `EDUCATION\n`;
        if (personalDetails.highSchool) text += `Matriculation (Class X): ${personalDetails.highSchool} | ${personalDetails.highGpa} (${personalDetails.highYear})\n`;
        if (personalDetails.interSchool) text += `Intermediate (Class XII): ${personalDetails.interSchool} | ${personalDetails.interGpa} (${personalDetails.interYear})\n`;
        if (personalDetails.college) text += `Undergraduate: ${personalDetails.college} | ${personalDetails.undergradGpa || ''} | ${personalDetails.degree} (${personalDetails.gradYear})\n`;
        text += `\n`;

        if (categoryFields.motivation) text += `WHY I WANT TO JOIN\n${categoryFields.motivation}\n\n`;
        if (skills.length > 0) text += `SKILLS\n${skills.join(', ')}\n\n`;
        if (categoryFields.relevantProjects) text += `PROJECTS\n${categoryFields.relevantProjects}\n\n`;
        if (categoryFields.achievements) text += `ACHIEVEMENTS\n${categoryFields.achievements}\n\n`;
        if (categoryFields.campusInvolvement) text += `CAMPUS INVOLVEMENT\n${categoryFields.campusInvolvement}\n\n`;
        if (personalDetails.languages) text += `LANGUAGES\n${personalDetails.languages}\n\n`;
    } else if (purpose === 'Internship' || purpose === 'Job' || purpose === 'Freelance') {
        text += `PROFESSIONAL SUMMARY\n`;
        text += `${experienceLevel} ${personalDetails.degree} student at ${personalDetails.college} with expertise in ${skills.slice(0, 4).join(', ') || 'relevant technologies'}. `;
        text += `Seeking ${purpose.toLowerCase()} opportunities to apply technical skills and contribute to impactful projects.\n\n`;
        
        text += `EDUCATION\n`;
        if (personalDetails.college) text += `Undergraduate: ${personalDetails.college} | ${personalDetails.undergradGpa || ''} | ${personalDetails.degree} (${personalDetails.gradYear})\n`;
        if (personalDetails.interSchool) text += `Intermediate (Class XII): ${personalDetails.interSchool} | ${personalDetails.interGpa} (${personalDetails.interYear})\n`;
        if (personalDetails.highSchool) text += `Matriculation (Class X): ${personalDetails.highSchool} | ${personalDetails.highGpa} (${personalDetails.highYear})\n`;
        text += `\n`;

        if (skills.length > 0) text += `SKILLS\n${skills.join(', ')}\n\n`;
        if (categoryFields.projects) text += `PROJECTS\n${categoryFields.projects}\n\n`;
        if (categoryFields.workExperience) text += `EXPERIENCE\n${categoryFields.workExperience}\n\n`;
        if (categoryFields.certifications) text += `CERTIFICATIONS\n${categoryFields.certifications}\n\n`;
        if (categoryFields.achievements) text += `ACHIEVEMENTS\n${categoryFields.achievements}\n\n`;
        if (categoryFields.references) text += `REFERENCES\n${categoryFields.references}\n\n`;
    } else if (purpose === 'Academic') {
        text += `ACADEMIC PROFILE\n`;
        text += `${personalDetails.degree} student at ${personalDetails.college} with a strong academic record. `;
        if (personalDetails.undergradGpa) text += `Current GPA: ${personalDetails.undergradGpa}. `;
        text += `Passionate about research and academic excellence in ${skills.slice(0, 3).join(', ') || 'the field'}.\n\n`;
        
        text += `EDUCATION\n`;
        if (personalDetails.college) text += `Undergraduate: ${personalDetails.college} | ${personalDetails.undergradGpa || ''} | ${personalDetails.degree} (${personalDetails.gradYear})\n`;
        if (personalDetails.interSchool) text += `Intermediate (Class XII): ${personalDetails.interSchool} | ${personalDetails.interGpa} (${personalDetails.interYear})\n`;
        if (personalDetails.highSchool) text += `Matriculation (Class X): ${personalDetails.highSchool} | ${personalDetails.highGpa} (${personalDetails.highYear})\n`;
        text += `\n`;

        if (categoryFields.coursework) text += `COURSEWORK\n${categoryFields.coursework}\n\n`;
        if (categoryFields.researchWork) text += `RESEARCH\n${categoryFields.researchWork}\n\n`;
        if (categoryFields.academicProjects) text += `PROJECTS\n${categoryFields.academicProjects}\n\n`;
        if (skills.length > 0) text += `SKILLS\n${skills.join(', ')}\n\n`;
        if (categoryFields.achievements) text += `ACHIEVEMENTS\n${categoryFields.achievements}\n\n`;
    }

    return text;
}

function parseResumeText(text) {
    const data = {};
    const lines = text.split('\n');
    let currentSection = '';
    let currentContent = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        if (/^[A-Z][A-Z\s\(\)\d]+$/.test(trimmed)) {
            if (currentSection) data[currentSection.toLowerCase().replace(/\s+/g, '')] = currentContent.join('\n');
            currentSection = trimmed;
            currentContent = [];
        } else {
            currentContent.push(trimmed);
        }
    });
    if (currentSection) data[currentSection.toLowerCase().replace(/\s+/g, '')] = currentContent.join('\n');
    return data;
}

// ============================================
// API ENDPOINTS
// ============================================

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AI Resume Builder API is running', version: '2.0' });
});

app.post('/api/generate-resume', async (req, res) => {
    try {
        const { personalDetails, purpose, experienceLevel, targetRole, skills, categoryFields, selectedTemplate } = req.body;

        if (!personalDetails || !personalDetails.fullName || !personalDetails.email) {
            return res.status(400).json({ error: 'Missing required personal details' });
        }
        if (!purpose || !experienceLevel) {
            return res.status(400).json({ error: 'Missing purpose or experience level' });
        }

        const prompt = buildPrompt({ personalDetails, purpose, experienceLevel, targetRole, skills, categoryFields });

        let resumeText = '';
        let aiGenerated = false;

        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (GROQ_API_KEY) {
            try {
                const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            { role: 'system', content: 'You are a professional resume writer. Create polished, ATS-friendly resumes.' },
                            { role: 'user', content: prompt }
                        ],
                        temperature: 0.7,
                        max_tokens: 2000
                    })
                });

                if (groqResponse.ok) {
                    const groqData = await groqResponse.json();
                    resumeText = groqData.choices[0].message.content;
                    aiGenerated = true;
                } else {
                    let detail = `HTTP ${groqResponse.status}`;
                    try {
                        const errBody = await groqResponse.json();
                        detail = errBody?.error?.message || detail;
                    } catch (_) { /* not JSON */ }
                    console.log('Groq returned error response:', detail);
                }
            } catch (aiError) {
                console.log('AI generation failed, using fallback:', aiError.message);
            }
        } else {
            console.log('GROQ_API_KEY is not set — falling back to local resume generation.');
        }

        if (!resumeText) {
            resumeText = generateResumeFallback({ personalDetails, purpose, experienceLevel, targetRole, skills, categoryFields });
        }

        const structuredData = parseResumeText(resumeText);

        res.json({
            success: true,
            resumeText,
            structuredResumeData: structuredData,
            aiGenerated,
            template: selectedTemplate
        });

    } catch (error) {
        console.error('Resume generation error:', error);
        res.status(500).json({ error: 'Failed to generate resume', message: error.message });
    }
});

// AI Write endpoint for individual fields
app.post('/api/ai-write', async (req, res) => {
    try {
        const { field, context } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            return res.status(503).json({ error: 'AI service not configured. Please set GROQ_API_KEY in your .env file.' });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { 
                        role: 'system', 
                        content: `You are an elite AI Content Optimization Engine for a professional, ATS-compatible resume builder.

RULES:
1. NEVER invent false facts, unheld degrees, non-existent work experience, or fake metrics/companies.
2. Maintain professional, high-impact language with strong action verbs.
3. IN EXPAND MODE (Insufficient Content / Empty Spaces):
   - Expand brief profile summaries (<40 words) into rich 70-90 word career summaries.
   - Expand single-line project or experience descriptions into 3-5 quantifiable achievement bullet points.
   - Categorize raw skill lists into clean groups (e.g. Programming Languages, Frameworks & Libraries, Developer Tools, Databases, Professional Skills).
   - Elaborate existing technical facts naturally without inventing false credentials.
4. IN COMPRESS MODE (Content Overflow):
   - Remove redundant words and filler phrases while preserving 100% of factual achievements, metrics, languages, and titles.
   - Merge repetitive bullet points. Use punchy, concise phrasing.
5. Always return clean, formatted resume text.` 
                    },
                    { role: 'user', content: context }
                ],
                temperature: 0.7,
                max_tokens: ['fullResume', 'fullEnhance', 'constraintOptimization', 'contentOptimization'].includes(field) ? 3000 : 800
            })
        });

        if (!response.ok) {
            // Surface the real reason (invalid key, rate limit, deprecated model, etc.)
            // instead of a generic message, so failures are actually diagnosable.
            let detail = `Groq API error (HTTP ${response.status})`;
            try {
                const errBody = await response.json();
                detail = errBody?.error?.message || detail;
            } catch (_) { /* body wasn't JSON, keep generic detail */ }
            console.error('Groq API request failed:', detail);
            return res.status(502).json({ error: 'AI generation failed', message: detail });
        }

        const data = await response.json();
        res.json({ success: true, content: data.choices[0].message.content.trim() });

    } catch (error) {
        console.error('AI write handler error:', error);
        res.status(500).json({ error: 'AI generation failed', message: error.message });
    }
});

// ============================================
// ============================================
// ROLE SKILLS — AI-backed, for roles not in the
// client's hardcoded map (e.g. "Video Editor",
// "Wedding Videographer", any non-tech role).
// ============================================
app.post('/api/role-skills', async (req, res) => {
    try {
        const { role } = req.body;
        if (!role || !role.trim()) return res.status(400).json({ error: 'Missing role' });

        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) {
            return res.status(503).json({ error: 'AI service not configured.' });
        }

        const prompt = `List the 8-10 most essential, concrete, hireable skills for the job role "${role}". This may be a technical role, a creative role (e.g. video editing, design, photography), or a business/marketing role — infer the correct domain from the role itself and stay strictly within it. Return ONLY a raw JSON array of short skill name strings, nothing else. No explanation, no markdown, no code fences. Example format: ["Skill One", "Skill Two"]`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You output only valid raw JSON arrays of strings. No prose, no markdown fences.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.4,
                max_tokens: 300
            })
        });

        if (!response.ok) {
            return res.status(502).json({ error: 'AI generation failed' });
        }

        const data = await response.json();
        let raw = (data.choices?.[0]?.message?.content || '').trim();
        raw = raw.replace(/^```json\s*|```$/g, '').trim();

        let skills = [];
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) skills = parsed.filter(s => typeof s === 'string' && s.trim()).slice(0, 10);
        } catch (_) {
            // Fallback: pull quoted strings out of a malformed response
            const matches = raw.match(/"([^"]+)"/g);
            if (matches) skills = matches.map(m => m.replace(/"/g, '')).slice(0, 10);
        }

        if (skills.length === 0) return res.status(502).json({ error: 'Could not determine skills for this role' });
        res.json({ success: true, role, skills });

    } catch (error) {
        console.error('Role-skills error:', error.message);
        res.status(500).json({ error: 'Failed to fetch role skills', message: error.message });
    }
});

// ============================================
// AUTO-SPAWN PYTHON MICROSERVICE IF NEEDED
// ============================================
const PYTHON_SERVICE_URL = process.env.PYTHON_PARSER_URL || 'http://127.0.0.1:5001';

async function checkOrStartPythonService() {
    try {
        const res = await fetch(`${PYTHON_SERVICE_URL}/`, { signal: AbortSignal.timeout(1500) });
        if (res.ok) {
            console.log(`[PythonService] Connected to Resume Intelligence Engine at ${PYTHON_SERVICE_URL}`);
            return;
        }
    } catch (e) {
        if (process.env.DISABLE_PYTHON_SPAWN !== 'true') {
            console.log(`[PythonService] Starting Python microservice on port 5001...`);
            const { spawn } = require('child_process');
            const pyProc = spawn('python', ['parser_service.py'], { stdio: 'inherit' });
            pyProc.on('error', (err) => console.warn('[PythonService] Could not auto-spawn Python:', err.message));
        }
    }
}

// ============================================
// PDF EXTRACTION — Resume Intelligence Engine
// Calls Python microservice (PyMuPDF, pdfplumber, OpenCV OCR, Layout Reconstruction)
// ============================================
app.post('/api/extract-pdf', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'No PDF file uploaded.' });
        }

        // 1. Try calling the Python Resume Intelligence Engine
        try {
            const formData = new FormData();
            const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'application/pdf' });
            formData.append('file', blob, req.file.originalname || 'resume.pdf');

            const pyResponse = await fetch(`${PYTHON_SERVICE_URL}/parse-pdf`, {
                method: 'POST',
                body: formData
            });

            if (pyResponse.ok) {
                const pyData = await pyResponse.json();
                console.log(`[ResumeParser] Parsed successfully via ${pyData.parser_used} (Confidence: ${pyData.confidence_score}%)`);
                return res.json({
                    success: true,
                    text: pyData.raw_extracted_text,
                    pages: pyData.page_count,
                    parserUsed: pyData.parser_used,
                    documentType: pyData.document_type,
                    confidenceScore: pyData.confidence_score,
                    fieldConfidence: pyData.field_confidence,
                    resumeJson: pyData.resume_json
                });
            }
        } catch (pyErr) {
            console.warn('[ResumeParser] Python service notice:', pyErr.message);
        }

        // 2. Fallback to node pdf-parse
        const parseFn = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse.pdfParse);
        const data = await parseFn(req.file.buffer);
        const text = data.text || '';

        if (!text.trim()) return res.status(422).json({ error: 'PDF has no extractable text (may be image-based or scanned).' });

        res.json({
            success: true,
            text: text.trim(),
            pages: data.numpages,
            parserUsed: 'pdf-parse (Fallback)',
            documentType: 'DIGITAL',
            confidenceScore: 85,
            fieldConfidence: { name: 90, email: 95, phone: 90, education: 85, experience: 85, skills: 88 }
        });
    } catch (err) {
        console.error('PDF extract error:', err.message);
        res.status(500).json({ error: 'Failed to extract PDF text.', message: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 AI Resume Builder v2.0 running on http://localhost:${PORT}`);
    console.log(`📄 Open http://localhost:${PORT} in your browser\n`);
    checkOrStartPythonService();
});

module.exports = app;
