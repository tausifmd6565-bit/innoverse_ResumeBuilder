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

// Multer — store uploaded PDF in memory (no disk write)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'));
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
                    console.log('Groq returned error response status:', groqResponse.status);
                }
            } catch (aiError) {
                console.log('AI generation failed, using fallback:', aiError.message);
            }
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
            return res.status(503).json({ error: 'AI service not configured. Please set GROQ_API_KEY.' });
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
                    { role: 'system', content: 'You are a professional resume writer and ATS optimization expert. Write concise, impactful, ATS-friendly content. Use strong action verbs. Be realistic and do not invent fake information.' },
                    { role: 'user', content: context }
                ],
                temperature: 0.7,
                max_tokens: field === 'fullResume' || field === 'fullEnhance' ? 3000 : 800
            })
        });

        if (!response.ok) throw new Error('Groq API error');

        const data = await response.json();
        res.json({ success: true, content: data.choices[0].message.content.trim() });

    } catch (error) {
        res.status(500).json({ error: 'AI generation failed', message: error.message });
    }
});

// ============================================
// PDF EXTRACTION — 11-Stage Python Engine with pdf-parse Fallback
// ============================================
app.post('/api/extract-pdf', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No PDF file received.' });

        const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5001';

        // ── Strategy 1: Forward to Python 11-Stage Resume Intelligence Engine ──
        try {
            const formData = new FormData();
            const pdfBlob = new Blob([req.file.buffer], { type: req.file.mimetype || 'application/pdf' });
            formData.append('file', pdfBlob, req.file.originalname || 'resume.pdf');

            const pythonResp = await fetch(`${PYTHON_SERVICE_URL}/parse-pdf`, {
                method: 'POST',
                body: formData
            });

            if (pythonResp.ok) {
                const pyData = await pythonResp.json();
                if (pyData.status === 'success' && pyData.raw_extracted_text && pyData.raw_extracted_text.trim().length > 30) {
                    console.log(`[ResumeParser] Parsed successfully via ${pyData.parser_used} (Confidence: ${pyData.confidence_score}%)`);
                    return res.json({
                        success: true,
                        text: pyData.raw_extracted_text.trim(),
                        resume_json: pyData.resume_json,
                        parser: pyData.parser_used,
                        confidence: pyData.confidence_score,
                        pages: pyData.page_count
                    });
                }
            }
        } catch (pyErr) {
            console.warn('[ResumeParser] Python microservice parse attempt failed, falling back to pdf-parse:', pyErr.message);
        }

        // ── Strategy 2: Fallback to Node pdf-parse ──
        let text = '';
        let numpages = 1;
        try {
            const parseFn = typeof pdfParse === 'function' ? pdfParse : (pdfParse && pdfParse.default) || (pdfParse && pdfParse.pdfParse);
            if (parseFn) {
                const data = await parseFn(req.file.buffer);
                text = data.text || '';
                numpages = data.numpages || 1;
            }
        } catch (pdfErr) {
            console.warn('[ResumeParser] Node pdf-parse fallback error:', pdfErr.message);
        }

        if (!text.trim()) return res.status(422).json({ error: 'PDF has no extractable text (may be password-protected or image-only).' });
        res.json({ success: true, text: text.trim(), pages: numpages, parser: 'pdf-parse (Fallback)' });
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
});

module.exports = app;
