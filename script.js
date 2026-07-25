/* ============================================
   AI RESUME BUILDER v2.0 - JAVASCRIPT
   By Innoverse AMU | 2025
   ============================================ */

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    currentStep: 1,
    totalSteps: 4,  // 4-step scratch flow: Q->
    flow: 'scratch', // 'scratch' or 'upload'
    formData: {
        year: '',
        purpose: '',
        experienceLevel: '',
        clubCategory: '',
        clubName: '',
        personalDetails: {},
        targetRole: '',
        skills: [],
        categoryFields: {},
        selectedTemplate: 'modern'
    },
    resumeText: '',
    generatedHTML: '',
    zoom: 1,
    enhZoom: 0.8,
    modalZoom: 1,
    photoDataUrl: '',
    groqApiKey: localStorage.getItem('groqApiKey') || ''
};

// ============================================
// TEMPLATE DEFINITIONS - CATEGORIZED (12 + 1 TEMPLATES)
// ============================================
const templateCategories = {
    campus: {
        icon: 'fa-university',
        color: 'campus',
        title: '<i class="fas fa-university"></i> Campus & Club',
        desc: 'For club & society interviews',
        templates: [
            { id: 'campusClub', name: 'Campus Club Profile', class: 'cc', color: '#222B38' },
            { id: 'campusMinimal', name: 'Campus Minimal', class: 'cm', color: '#B55308' },
            { id: 'campusAchiever', name: 'Campus Achiever Club Edition', class: 'ca', color: '#8B2332' },
            { id: 'starter', name: 'Starter / Fresher', class: 'st', color: '#6366f1' },
            { id: 'classic', name: 'Classic Clean', class: 'cl', color: '#1a1a1a' }
        ]
    },
    internship: {
        icon: 'fa-briefcase',
        color: 'internship',
        title: '<i class="fas fa-briefcase"></i> Internship & Job',
        desc: 'For internships, jobs & freelance',
        templates: [
            { id: 'modern', name: 'Modern Clean', class: 'mc', color: '#071A2F' },
            { id: 'creative', name: 'Creative Executive Sidebar', class: 'cr', color: '#081A3A' },
            { id: 'minimalPro', name: 'Minimal Professional', class: 'mp', color: '#072B57' },
            { id: 'elegantBeige', name: 'Elegant Beige', class: 'eb', color: '#8B6B4A' },
            { id: 'diagonal', name: 'Modern Diagonal Sidebar', class: 'dg', color: '#255B64' },
            { id: 'dualPanel', name: 'Modern Dual Panel Premium', class: 'dp', color: '#012D1D' },
            { id: 'boldBlue', name: 'Executive Sidebar / Creative Blue', class: 'bb', color: '#0D47A1' },
            { id: 'classic', name: 'Classic Clean', class: 'cl', color: '#1a1a1a' },
            { id: 'starter', name: 'Starter / Fresher', class: 'st', color: '#6366f1' },
            { id: 'technical', name: 'Technical Layout', class: 'tc', color: '#0ea5e9' }
        ]
    },
    academic: {
        icon: 'fa-graduation-cap',
        color: 'academic',
        title: '<i class="fas fa-graduation-cap"></i> Academic & Research',
        desc: 'For scholarships, research & academia',
        templates: [
            { id: 'classic', name: 'Classic Clean', class: 'cl', color: '#1a1a1a' },
            { id: 'modern', name: 'Modern Clean', class: 'mc', color: '#071A2F' },
            { id: 'minimalPro', name: 'Minimal Professional', class: 'mp', color: '#072B57' }
        ]
    }
};

// Flatten for easy lookup
const allTemplates = [];
Object.values(templateCategories).forEach(cat => {
    cat.templates.forEach(t => {
        if (!allTemplates.find(x => x.id === t.id)) {
            allTemplates.push(t);
        }
    });
});

// ============================================
// SAMPLE DATA FOR PREVIEWS
// ============================================
const sampleData = {
    fullName: 'MD TAUSIF',
    targetRole: 'AI / Machine Learning Engineer',
    email: 'md.tausif@zhcet.amu.ac.in',
    phone: '+91 98765 43210',
    location: 'Aligarh, India',
    college: 'ZHCET, Aligarh Muslim University',
    degree: 'B.Tech in Artificial Intelligence',
    gradYear: '2027',
    undergradGpa: '9.2/10',
    interSchool: 'Delhi Public School, Aligarh',
    interGpa: '95.4%',
    interBoard: 'CBSE',
    interYear: '2023',
    highSchool: 'Delhi Public School, Aligarh',
    highGpa: '96.2%',
    highBoard: 'CBSE',
    highYear: '2021',
    dob: '2004-08-12',
    additionalInfo: 'Open to AI/ML Research Internships, Open source contributor',
    linkedin: 'linkedin.com/in/mdtausif',
    github: 'github.com/mdtausif',
    languages: 'English, Urdu, Hindi',
    skills: ['Python', 'Numpy', 'Pandas', 'Frontend Development', 'Machine Learning', 'Deep Learning', 'SQL', 'Git'],
    summary: 'AI student at ZHCET AMU with a passion for machine learning, data science, and modern frontend development. Experienced in building full-stack applications and analytical models.',
    education: 'ZHCET, Aligarh Muslim University\nB.Tech in Artificial Intelligence\nExpected Graduation: 2027',
    experience: 'Innoverse AMU | AI Research Intern | May 2025 - Present\n- Developed machine learning models using Python, NumPy, and Pandas\n- Designed and implemented clean frontend interfaces for AI tools\n- Collaborated with student developers to deploy local AI architectures',
    projects: 'AI Resume Builder | HTML, CSS, JavaScript, Express, Groq API\n- Engineered a highly responsive resume builder platform\n- Designed 12 premium CSS templates with dynamic density-balancing\n- Integrated AI restyling and automated skill suggestion features',
    certifications: 'Machine Learning Specialization | DeepLearning.AI | 2025\nFrontend Developer Certificate | Meta | 2025',
    achievements: 'Hackathon Winner - Innoverse AMU Tech Fest 2025\nAcademic Excellence Award - ZHCET 2025',
    motivation: 'I am passionate about artificial intelligence and want to contribute to the AI/ML Society community on campus.',
    campusInvolvement: 'Core Member of AI/ML Society, ZHCET AMU\nTechnical Volunteer at University Tech Fest',
    relevantProjects: 'Student Portal Redesign | React, CSS\nCampus Bot | NLP, Python',
    gpa: '9.2/10',
    researchWork: 'Published research paper on Neural Networks in ZHCET Journal\nAssistant at AMU AI Lab',
    coursework: 'Machine Learning, Deep Learning, Data Structures, Algorithms, Frontend Architectures',
    academicProjects: 'Smart Attendance System | Python, OpenCV\nZHCET Chatbot | NLP, Python',
    academicAchievements: 'University Merit Scholarship\nBest AI Project Award - ZHCET AMU',
    references: 'Dr. Jane Doe | Professor, CS Dept ZHCET AMU | jane.doe@amu.ac.in\nMr. Alex Smith | Technical Lead, Innoverse AMU | alex@innoverse.com'
};

// ============================================
// DOM ELEMENTS
// ============================================
const els = {};

function cacheElements() {
    els.stepLine = document.getElementById('stepLine');
    els.stepItems = document.querySelectorAll('.step-item');
    els.wizardSteps = document.querySelectorAll('.wizard-step');
    els.yearGrid = document.getElementById('yearGrid');
    els.purposeGrid = document.getElementById('purposeGrid');
    els.expGrid = document.getElementById('expGrid');
    els.campusClubFields = document.getElementById('campusClubFields');
    els.clubCategory = document.getElementById('clubCategory');
    els.clubCategoryGrid = document.getElementById('clubCategoryGrid');
    els.clubName = document.getElementById('clubName');
    els.templatesContainer = document.getElementById('templatesContainer');
    els.photoInput = document.getElementById('photoInput');
    els.photoBtn = document.getElementById('photoBtn');
    els.photoPreview = document.getElementById('photoPreview');
    els.photoInitials = document.getElementById('photoInitials');
    els.photoImg = document.getElementById('photoImg');
    els.skillsInput = document.getElementById('skillsInput');
    els.skillsTags = document.getElementById('skillsTags');
    els.dynamicFields = {
        campus: document.getElementById('campusFields'),
        job: document.getElementById('jobFields'),
        academic: document.getElementById('academicFields')
    };
    els.resumeSheet = document.getElementById('resumeSheet');
    els.editTextarea = document.getElementById('editTextarea');
    els.previewContainer = document.getElementById('previewContainer');
    els.zoomLevel = document.getElementById('zoomLevel');
    els.loadingOverlay = document.getElementById('loadingOverlay');
    els.templateModal = document.getElementById('templateModal');
    els.modalResume = document.getElementById('modalResume');
    els.modalTitle = document.getElementById('modalTitle');
    els.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    els.mobileMenu = document.getElementById('mobileMenu');
    els.aiGeneratingPopup = document.getElementById('aiGeneratingPopup');
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    try { initEntryFlow(); } catch(e) { console.error('initEntryFlow crashed:', e); }
    try { cacheElements(); } catch(e) { console.error('cacheElements crashed:', e); }
    try { initStepper(); } catch(e) { console.error('initStepper crashed:', e); }
    try { initQuizOptions(); } catch(e) { console.error('initQuizOptions crashed:', e); }
    try { initPhotoUpload(); } catch(e) { console.error('initPhotoUpload crashed:', e); }
    try { initSkillsInput(); } catch(e) { console.error('initSkillsInput crashed:', e); }
    try { initTemplateGrid(); } catch(e) { console.error('initTemplateGrid crashed:', e); }
    try { initNavigation(); } catch(e) { console.error('initNavigation crashed:', e); }
    try { initZoomControls(); } catch(e) { console.error('initZoomControls crashed:', e); }
    try { initDownloadButtons(); } catch(e) { console.error('initDownloadButtons crashed:', e); }
    try { initModal(); } catch(e) { console.error('initModal crashed:', e); }
    try { initMobileMenu(); } catch(e) { console.error('initMobileMenu crashed:', e); }
    try { initAIWriteButtons(); } catch(e) { console.error('initAIWriteButtons crashed:', e); }
    try { initNavbarScroll(); } catch(e) { console.error('initNavbarScroll crashed:', e); }
    try { initAIEnhance(); } catch(e) { console.error('initAIEnhance crashed:', e); }
    try { initSkillGap(); } catch(e) { console.error('initSkillGap crashed:', e); }
    try { initEnhanceSection(); } catch(e) { console.error('initEnhanceSection crashed:', e); }
});

// ============================================
// STEPPER
// ============================================
function initStepper() { updateStepper(); }

function updateStepper() {
    els.stepItems.forEach((item, idx) => {
        const step = idx + 1;
        item.classList.remove('active', 'completed');
        if (step < state.currentStep) item.classList.add('completed');
        else if (step === state.currentStep) item.classList.add('active');
    });
    const progress = ((state.currentStep - 1) / (state.totalSteps - 1)) * 100;
    els.stepLine.style.width = progress + '%';
}

function goToStep(step) {
    if (step < 1 || step > state.totalSteps) return;
    if (step > state.currentStep && !validateStep(state.currentStep)) return;
    state.currentStep = step;
    updateStepper();
    els.wizardSteps.forEach((el, idx) => {
        const isCurrent = (idx + 1 === step);
        el.classList.toggle('active', isCurrent);
        el.classList.toggle('hidden', !isCurrent);
    });
    window.scrollTo({ top: document.getElementById('builder').offsetTop - 100, behavior: 'smooth' });
    if (step === 4) {
        const uploadArea = document.getElementById('enhanceUploadArea');
        if (uploadArea) {
            uploadArea.style.display = (state.flow === 'scratch') ? 'none' : 'flex';
        }
        setTimeout(autoFitZoom, 50);
        // Pre-fill skill gap role input when reaching preview step
        const roleEl = document.getElementById('gapRoleInput');
        if (roleEl && !roleEl.value) {
            roleEl.value = state.formData.targetRole || '';
        }
    }
}

function validateStep(step) {
    if (step === 1) {
        if (!state.formData.year) { showToast('Please select your year of study'); return false; }
        if (!state.formData.purpose) { showToast('Please select a purpose'); return false; }
        if (!state.formData.experienceLevel) { showToast('Please select your experience level'); return false; }
        if (state.formData.purpose === 'Campus Club') {
            if (!els.clubCategory.value) { showToast('Please select a club category'); return false; }
            if (!els.clubName.value.trim()) { showToast('Please enter a club name'); return false; }
        }
    }
    if (step === 2) {
        const required = ['fullName', 'email', 'phone', 'location', 'college', 'degree', 'gradYear'];
        for (const field of required) {
            const el = document.getElementById(field);
            if (!el || !el.value.trim()) {
                showToast('Please fill in all required fields');
                if (el) {
                    el.classList.add('input-error');
                    el.focus();
                }
                return false;
            } else {
                if (el) el.classList.remove('input-error');
            }
        }
        const email = document.getElementById('email').value;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Please enter a valid email address');
            const emailEl = document.getElementById('email');
            if (emailEl) emailEl.focus();
            return false;
        }
    }
    if (step === 3) {
        if (!state.formData.selectedTemplate) { showToast('Please select a template'); return false; }
    }
    return true;
}

// ============================================
// QUIZ OPTIONS
// ============================================
function initQuizOptions() {
    els.yearGrid.querySelectorAll('.quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            els.yearGrid.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.formData.year = btn.dataset.value;
        });
    });
    els.purposeGrid.querySelectorAll('.quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            els.purposeGrid.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.formData.purpose = btn.dataset.value;
            handlePurposeChange();
        });
    });
    els.expGrid.querySelectorAll('.quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            els.expGrid.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.formData.experienceLevel = btn.dataset.value;
        });
    });
    if (els.clubCategoryGrid) {
        els.clubCategoryGrid.querySelectorAll('.quiz-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                els.clubCategoryGrid.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                els.clubCategory.value = btn.dataset.value;
                state.formData.clubCategory = btn.dataset.value;
            });
        });
    }
}

function handlePurposeChange() {
    const purpose = state.formData.purpose;
    els.campusClubFields.classList.toggle('hidden', purpose !== 'Campus Club');
    Object.values(els.dynamicFields).forEach(el => el.classList.add('hidden'));
    if (purpose === 'Campus Club') els.dynamicFields.campus.classList.remove('hidden');
    else if (purpose === 'Internship' || purpose === 'Job' || purpose === 'Freelance') els.dynamicFields.job.classList.remove('hidden');
    else if (purpose === 'Academic') els.dynamicFields.academic.classList.remove('hidden');

    // Re-render templates based on purpose
    initTemplateGrid();
}

// ============================================
// PHOTO UPLOAD
// ============================================
function initPhotoUpload() {
    els.photoBtn.addEventListener('click', () => els.photoInput.click());
    els.photoInput.addEventListener('change', handlePhotoUpload);
}

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Photo must be less than 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
        state.photoDataUrl = event.target.result;
        els.photoImg.src = state.photoDataUrl;
        els.photoImg.style.display = 'block';
        els.photoInitials.style.display = 'none';
        updateInitials();
    };
    reader.readAsDataURL(file);
}

function updateInitials() {
    const name = document.getElementById('fullName')?.value || '';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (!state.photoDataUrl) {
        els.photoInitials.textContent = initials || '?';
        els.photoInitials.style.display = 'flex';
        els.photoImg.style.display = 'none';
    }
}
document.getElementById('fullName')?.addEventListener('input', updateInitials);

// ============================================
// SKILLS INPUT
// ============================================
function initSkillsInput() {
    els.skillsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const skill = els.skillsInput.value.trim();
            if (skill && !state.formData.skills.includes(skill)) {
                state.formData.skills.push(skill);
                renderSkills();
                els.skillsInput.value = '';
            }
        }
    });
}

function renderSkills() {
    els.skillsTags.innerHTML = state.formData.skills.map(skill => `
        <span class="skill-tag">${skill}<span class="remove-skill" data-skill="${skill}"><i class="fas fa-times"></i></span></span>
    `).join('');
    els.skillsTags.querySelectorAll('.remove-skill').forEach(btn => {
        btn.addEventListener('click', () => {
            state.formData.skills = state.formData.skills.filter(s => s !== btn.dataset.skill);
            renderSkills();
        });
    });
}

// ============================================
// TEMPLATE GRID - CATEGORIZED
// ============================================
function initTemplateGrid() {
    const purpose = state.formData.purpose || 'Internship';
    let categoryKey = 'internship';
    if (purpose === 'Campus Club') categoryKey = 'campus';
    else if (purpose === 'Academic') categoryKey = 'academic';

    const cat = templateCategories[categoryKey];

    let html = '';

    // Show the relevant category first
    html += renderCategorySection(cat, true);

    // Show other categories collapsed or as alternatives
    Object.entries(templateCategories).forEach(([key, otherCat]) => {
        if (key !== categoryKey) {
            html += renderCategorySection(otherCat, false);
        }
    });

    const container = els.templatesContainer || document.getElementById('templatesContainer');
    if (!container) return;
    container.innerHTML = html;

    // Event listeners
    container.querySelectorAll('.tmpl-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.tmpl-btn-preview')) return;
            selectTemplate(card.dataset.template);
        });
    });
    container.querySelectorAll('.tmpl-btn-preview').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            openTemplatePreview(btn.dataset.template);
        });
    });
}

function renderCategorySection(cat, isPrimary) {
    const opacity = isPrimary ? '' : 'opacity:0.7;';
    const label = isPrimary ? '' : '<span style="font-size:0.75rem;color:var(--gray);margin-left:8px;">(Also Available)</span>';

    return `
        <div class="tmpl-category" style="${opacity}">
            <div class="tmpl-category-header">
                <div class="tmpl-category-icon ${cat.color}"><i class="fas ${cat.icon}"></i></div>
                <div>
                    <div class="tmpl-category-title">${cat.title} ${label}</div>
                    <div class="tmpl-category-desc">${cat.desc}</div>
                </div>
            </div>
            <div class="templates-grid">
                ${cat.templates.map(t => `
                    <div class="tmpl-card ${t.id === state.formData.selectedTemplate ? 'active' : ''}" data-template="${t.id}">
                        <div class="tmpl-preview" style="background: linear-gradient(135deg, ${t.color}12, ${t.color}06);">
                            <div class="tmpl-preview-inner">
                                ${buildResumeHTML(sampleData, t.id, true)}
                            </div>
                        </div>
                        <div class="tmpl-name">${t.name}</div>
                        <div class="tmpl-actions">
                            <button class="tmpl-btn tmpl-btn-preview" data-template="${t.id}"><i class="fas fa-eye"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function selectTemplate(templateId) {
    state.formData.selectedTemplate = templateId;
    document.querySelectorAll('.tmpl-card').forEach(card => {
        card.classList.toggle('active', card.dataset.template === templateId);
    });
}

// ============================================
// AI WRITE BUTTONS
// ============================================
function initAIWriteButtons() {
    document.querySelectorAll('.btn-ai-write').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const field = btn.dataset.field;
            await generateAIContent(field, btn);
        });
    });
}

async function generateAIContent(field, btn) {
    btn.classList.add('generating');
    btn.innerHTML = '<i class="fas fa-spinner"></i>';
    els.aiGeneratingPopup.classList.add('active');

    const targetEl = document.getElementById(field);
    // For skillsInput, the actual skills are in state.formData.skills (tags), not the input value
    const existingVal = field === 'skillsInput'
        ? state.formData.skills.join(', ')
        : (targetEl ? targetEl.value.trim() : '');

    let prompt = '';
    if (field === 'skillsInput') {
        const role = document.getElementById('targetRole')?.value || 'Software Engineer';
        if (existingVal) {
            prompt = `Suggest a list of 8-10 optimized, professional technical and soft skills for a resume targeting the role: "${role}". Incorporate and expand upon the user's existing skills: "${existingVal}". Return the suggested skills as a single comma-separated list of values only (e.g. "React, Node.js, Git, Communication"). Do not include any other text, numbers, formatting, or introduction.`;
        } else {
            prompt = `Suggest a list of 8-10 optimized, professional technical and soft skills for a resume targeting the role: "${role}". Return the suggested skills as a single comma-separated list of values only (e.g. "React, Node.js, Git, Communication"). Do not include any other text, numbers, formatting, or introduction.`;
        }
    } else if (field === 'targetRole') {
        // targetRole is a short single-line job title - special handling
        if (existingVal) {
            prompt = `You are a professional resume writer. The user has written this job title/target role: "${existingVal}". Rewrite it as a clean, professional, ATS-optimized job title. Return ONLY the improved job title as a short phrase (3-5 words maximum). No explanations, no punctuation at the end, no quotes.`;
        } else {
            const skills = state.formData.skills.join(', ');
            prompt = `Suggest a professional job title for a resume based on these skills: "${skills || 'Software Development'}". Return ONLY a clean job title (3-5 words). No explanations or quotes.`;
        }
    } else if (existingVal) {
        prompt = `You are an expert resume writer. The user has written the following content for their resume field "${field}":\n"${existingVal}"\n\nPlease rewrite, restyle, and improve the English, grammar, professional tone, and ATS compatibility of this content. Do NOT invent any new accomplishments, projects, or credentials. Keep the core facts exactly the same, but present them in a highly polished, professional, and ATS-friendly manner. If the content is long, tighten and compress the wording without dropping any point - every fact must remain, just stated more concisely. If the content is very short, write it out in fuller, more complete sentences using only the facts given, without inventing anything new. Return ONLY the improved text, with no headers, introductions, conversational filler, or formatting quotes.`;
    } else {
        prompt = buildAIPrompt(field);
    }

    try {
        const response = await fetch('/api/ai-write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: field, context: prompt })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'API request failed');
        }

        const data = await response.json();
        const generatedText = data.content || data.choices?.[0]?.message?.content?.trim();

        if (field === 'skillsInput') {
            const skillsArray = generatedText.split(/[,\n]+/).map(s => s.replace(/^[-\d\.\*\s]+/, '').trim()).filter(s => s);
            state.formData.skills = [...new Set([...state.formData.skills, ...skillsArray])];
            renderSkills();
            showToast('AI suggested skills added!');
        } else if (targetEl) {
            targetEl.value = generatedText;
            targetEl.dispatchEvent(new Event('input'));
            showToast(existingVal ? 'Content improved using AI! ' : 'AI content generated successfully!');
        }

    } catch (error) {
        console.error('AI generation error:', error);
        if (field === 'skillsInput') {
            showToast('AI service unavailable - could not suggest skills. Try again shortly.');
        } else if (existingVal) {
            // Restyle failed - apply a genuine local cleanup instead of silently
            // leaving the text untouched, so the button visibly does something.
            const fallbackText = localRestyleFallback(existingVal);
            if (targetEl) {
                targetEl.value = fallbackText;
                targetEl.dispatchEvent(new Event('input'));
            }
            showToast('AI service unavailable - applied basic formatting instead. Try again shortly for full AI restyle.');
        } else {
            const fallbackText = generateFallbackText(field);
            if (targetEl) {
                targetEl.value = fallbackText;
                targetEl.dispatchEvent(new Event('input'));
            }
            showToast('AI service unavailable - used a local starter draft. Edit or retry shortly.');
        }
    } finally {
        btn.classList.remove('generating');
        btn.innerHTML = '<i class="fas fa-magic"></i>';
        els.aiGeneratingPopup.classList.remove('active');
    }
}

/**
 * Lightweight, dependency-free text cleanup used only when the AI restyle
 * request fails. Not a substitute for real AI polish - just makes sure the
 * "restyle" action always visibly does *something* rather than a silent no-op.
 */
function localRestyleFallback(text) {
    if (!text) return text;
    return text
        .split('\n')
        .map(line => {
            let l = line.replace(/[ \t]+/g, ' ').trim();
            if (!l) return '';
            // Normalize common bullet markers to a single "- " prefix
            l = l.replace(/^[-*â€¢]\s*/, '- ');
            // Capitalize the first letter of the line/sentence
            const prefixMatch = l.match(/^(-\s*)?/);
            const prefix = prefixMatch ? prefixMatch[0] : '';
            const rest = l.slice(prefix.length);
            const capped = rest.charAt(0).toUpperCase() + rest.slice(1);
            return prefix + capped;
        })
        .join('\n')
        .replace(/\s+([,.;:])/g, '$1'); // remove stray space before punctuation
}

function buildAIPrompt(field) {
    const purpose = state.formData.purpose || 'Job';
    const expLevel = state.formData.experienceLevel || 'Beginner';
    const role = document.getElementById('targetRole')?.value || '';
    const name = document.getElementById('fullName')?.value || 'the user';
    const college = document.getElementById('college')?.value || '';
    const degree = document.getElementById('degree')?.value || '';
    const year = state.formData.year || '';
    const clubName = els.clubName?.value || '';
    const clubCategory = els.clubCategory?.value || '';
    const skills = state.formData.skills.join(', ') || '';

    const prompts = {
        targetRole: `Write a professional target role title for a ${year} ${degree} student at ${college} with skills in ${skills}. Keep it to 3-6 words. Examples: "Software Engineering Intern", "Technical Club Secretary", "Research Assistant".`,

        motivation: `Write a 2-3 sentence motivation statement for ${name} to join ${clubName || 'a campus club'} (${clubCategory || 'technical'} category). ${name} is a ${year} ${degree} student at ${college} with ${expLevel.toLowerCase()} experience. Be genuine, enthusiastic, and specific.`,

        relevantProjects: `List 2-3 realistic projects relevant for a ${clubCategory || 'technical'} club application. ${name} is a ${year} ${degree} student. Format: Project Name | Technologies | One-line description. Keep it concise and believable.`,

        campusInvolvement: `List 2-3 campus activities/roles for ${name}, a ${year} ${degree} student at ${college}. Format: Role/Activity - Brief description. Make it realistic and student-appropriate.`,

        campusAchievements: `List 2-3 realistic achievements for a ${year} ${degree} student. Could be academic, competition, or leadership related. Keep it brief (one line each).`,

        workExperience: `Write a realistic work experience entry for a ${expLevel.toLowerCase()} ${degree} student seeking a ${role || 'software'} internship. Include: Company type | Role | Duration | 2-3 bullet points of responsibilities. Keep it believable for a student.`,

        certifications: `List 2-3 realistic certifications for a ${degree} student interested in ${role || 'technology'}. Format: Certification Name | Issuer | Year.`,

        jobProjects: `List 2-3 realistic projects for a ${expLevel.toLowerCase()} ${degree} student. Format: Project Name | Technologies | Description | GitHub-style link placeholder.`,

        jobAchievements: `List 2-3 professional achievements for a ${degree} student. Could include hackathons, academic awards, or leadership roles.`,

        researchWork: `Write a brief research summary for a ${year} ${degree} student. Include: Research area, any publications (mark as "In Progress" if none), and research interests. Keep it realistic.`,

        coursework: `List 6-8 relevant courses for a ${degree} program. Focus on courses relevant to ${role || 'the field'}.`,

        academicProjects: `List 2-3 academic projects for a ${degree} student. Format: Project Name | Course | Description. Make them realistic coursework projects.`,

        academicAchievements: `List academic achievements: GPA honors, scholarships, dean's list, or academic competitions. Keep it brief and realistic.`
    };

    return prompts[field] || `Write professional resume content for the "${field}" section. Context: ${purpose}, ${expLevel} level, ${degree} student.`;
}

function generateFallbackText(field) {
    const purpose = state.formData.purpose || 'Job';
    const role = document.getElementById('targetRole')?.value || '';
    const name = document.getElementById('fullName')?.value || 'Student';
    const college = document.getElementById('college')?.value || 'University';
    const degree = document.getElementById('degree')?.value || 'B.Tech';
    const year = state.formData.year || '3rd Year';

    const fallbacks = {
        targetRole: role || `${degree.split(' ')[0]} Intern`,
        motivation: `I am passionate about learning and contributing to meaningful projects. As a ${year} ${degree} student at ${college}, I have developed strong foundational skills and am eager to apply them in a collaborative environment. I believe this opportunity will help me grow both personally and professionally while allowing me to contribute value to the team.`,
        relevantProjects: `Campus Connect App | React, Firebase\n- Built a social platform for campus students\n- Implemented real-time chat and event notifications\n\nPortfolio Website | HTML, CSS, JavaScript\n- Designed personal portfolio showcasing projects\n- Deployed on GitHub Pages with CI/CD`,
        campusInvolvement: `Technical Club Member - ${college}\n- Participated in weekly coding sessions and hackathons\n- Mentored junior students in programming fundamentals\n\nEvent Coordinator - College Fest\n- Organized technical events with 200+ participants\n- Managed logistics and volunteer teams`,
        campusAchievements: `Top 10 in Inter-College Coding Competition\nBest Project Award - Department Exhibition 2024\nSelected for University Merit Scholarship`,
        workExperience: `Tech Solutions Pvt. Ltd. | Software Intern | May 2024 - July 2024\n- Developed frontend components using React and Tailwind CSS\n- Collaborated with backend team to integrate REST APIs\n- Participated in daily stand-ups and sprint planning`,
        certifications: `AWS Cloud Practitioner | Amazon Web Services | 2024\nGoogle Data Analytics Professional | Google | 2024`,
        jobProjects: `E-Commerce Dashboard | React, Node.js, MongoDB\n- Built admin dashboard with analytics and inventory management\n- Implemented JWT authentication and role-based access\n\nTask Management App | MERN Stack\n- Created full-stack task manager with real-time updates\n- Deployed on Vercel and Render`,
        jobAchievements: `Hackathon Winner - Build for Future 2024\nDean\'s List - Academic Excellence\nPublished article on Medium about Web Development`,
        researchWork: `Research Area: Machine Learning in Healthcare\nPublication: "Predictive Analytics for Disease Detection" (In Progress)\nRole: Research Assistant at ${college} CS Department`,
        coursework: `Data Structures and Algorithms\nDatabase Management Systems\nOperating Systems\nComputer Networks\nSoftware Engineering\nWeb Development\nMachine Learning Fundamentals\nCloud Computing`,
        academicProjects: `AI Chatbot | Natural Language Processing\n- Built conversational AI using Python and transformer models\n- Achieved 85% accuracy on test dataset\n\nDistributed Systems Simulator | Java\n- Simulated consensus algorithms and fault tolerance\n- Implemented Raft algorithm for leader election`,
        academicAchievements: `GPA: 8.5/10 (First Class with Distinction)\nUniversity Merit Scholarship - 2023, 2024\nBest Academic Project Award - Final Year\nSelected for Research Internship Program`
    };

    return fallbacks[field] || 'Professional content for this section.';
}

// ============================================
// MODAL
// ============================================
function initModal() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalClose');
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const modalUseBtn = document.getElementById('modalUseTemplateBtn');
    if (modalUseBtn) {
        modalUseBtn.addEventListener('click', () => {
            if (state.previewingTemplateId) {
                selectTemplate(state.previewingTemplateId);
                closeModal();
                showToast('Template applied!');
            }
        });
    }

    const btnChangeScratch = document.getElementById('btnChangeTemplateScratch');
    if (btnChangeScratch) {
        btnChangeScratch.addEventListener('click', () => {
            if (typeof goToStep === 'function') {
                goToStep(3);
                showToast('Choose a new template layout.');
            }
        });
    }
}

function openTemplatePreview(templateId) {
    state.previewingTemplateId = templateId;
    const t = allTemplates.find(t => t.id === templateId) || allTemplates[0];
    const modalTitle = els.modalTitle || document.getElementById('modalTitle');
    const modalResume = els.modalResume || document.getElementById('modalResume');
    const templateModal = els.templateModal || document.getElementById('templateModal');

    if (modalTitle) modalTitle.textContent = t.name + ' - Preview';

    const dataToRender = (state.resumeText || state.formData.personalDetails?.fullName)
        ? parseResumeText(state.resumeText || '')
        : sampleData;

    if (modalResume) modalResume.innerHTML = buildResumeHTML(dataToRender, templateId, true);
    if (templateModal) {
        templateModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Auto-fit modal zoom based on modal body clientWidth
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
        const availableWidth = modalBody.clientWidth - 32;
        state.modalZoom = Math.max(0.25, Math.min(availableWidth / 794, 0.95));
    } else {
        state.modalZoom = 0.75;
    }
    updateZoom();
}

function closeModal() {
    const templateModal = els.templateModal || document.getElementById('templateModal');
    if (templateModal) templateModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// PANEL SWITCHER HELPER
// ============================================
function showPanel(panelId) {
    // For non-step panels just toggle hidden
    const nonStepPanels = ['choicePanel', 'uploadPanel', 'mainStepper', 'skillGap', 'resumeEnhanceSection'];
    nonStepPanels.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', id !== panelId);
    });
    // For wizard steps toggle active
    ['step1','step2','step3','step4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('active', id === panelId);
    });
    window.scrollTo({ top: document.getElementById('builder').offsetTop - 80, behavior: 'smooth' });
}

// ============================================
// NAVIGATION BUTTONS
// ============================================
function initNavigation() {
    document.getElementById('step1Next').addEventListener('click', () => goToStep(2));
    document.getElementById('step2Back').addEventListener('click', () => goToStep(1));
    document.getElementById('step2Next').addEventListener('click', () => goToStep(3));
    document.getElementById('step3Back').addEventListener('click', () => goToStep(2));
    document.getElementById('step3Next').addEventListener('click', handleGenerate);
    document.getElementById('restartBtn').addEventListener('click', resetBuilder);
    document.getElementById('applyChanges').addEventListener('click', applyChanges);
    document.getElementById('resetChanges').addEventListener('click', resetChanges);

    // Auto-close any open modals when navigating via navbar links
    document.querySelectorAll('.nav-link, .nav-btn').forEach(link => {
        link.addEventListener('click', () => {
            const optModal = document.getElementById('optimizationModalOverlay');
            if (optModal) optModal.classList.add('hidden');
            closeModal();
        });
    });

    // Skill Gap trigger button inside step 4 (scratch flow)
    const openGapBtn = document.getElementById('openSkillGapBtn');
    if (openGapBtn) {
        openGapBtn.addEventListener('click', () => {
            const role = state.formData.targetRole || document.getElementById('gapRoleInput')?.value || '';
            showSkillGapSection(role, 'scratch');
        });
    }
    // Enhance section buttons (upload flow)
    const enhApply = document.getElementById('enhApplyChanges');
    const enhReset = document.getElementById('enhResetChanges');
    const enhRestart = document.getElementById('enhRestartBtn');
    if (enhApply) enhApply.addEventListener('click', applyEnhChanges);
    if (enhReset) enhReset.addEventListener('click', resetEnhChanges);
    if (enhRestart) enhRestart.addEventListener('click', resetBuilder);
}

// ============================================
// RESUME GENERATION
// ============================================
async function handleGenerate() {
    if (!validateStep(3)) return;
    collectFormData();

    const loadingText = document.getElementById('loadingText');
    const loadingSubtext = document.getElementById('loadingSubtext');
    els.loadingOverlay.classList.add('active');
    if (loadingText) loadingText.textContent = 'Generating your resume...';
    if (loadingSubtext) loadingSubtext.textContent = 'AI is crafting the perfect content for you';
    await new Promise(r => setTimeout(r, 1200));

    try {
        const response = await fetch('/api/generate-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                personalDetails: state.formData.personalDetails,
                purpose: state.formData.purpose,
                experienceLevel: state.formData.experienceLevel,
                targetRole: state.formData.targetRole,
                skills: state.formData.skills,
                categoryFields: state.formData.categoryFields,
                selectedTemplate: state.formData.selectedTemplate
            })
        });

        if (response.ok) {
            const data = await response.json();
            state.resumeText = data.resumeText;
        } else {
            throw new Error('API failed');
        }
    } catch (e) {
        state.resumeText = generateResumeTextFallback();
    }

    state.generatedHTML = buildResumeHTML(parseResumeText(state.resumeText), state.formData.selectedTemplate);
    els.resumeSheet.innerHTML = state.generatedHTML;
    els.editTextarea.value = state.resumeText;

    els.loadingOverlay.classList.remove('active');

    // Scratch flow: go directly to step 4 (preview & download)
    // Skill Gap Analyser is accessible via a collapsible box inside step 4
    goToStep(4);
}

function collectFormData() {
    state.formData.personalDetails = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        college: document.getElementById('college').value,
        degree: document.getElementById('degree').value,
        gradYear: document.getElementById('gradYear')?.value || '',
        undergradGpa: document.getElementById('undergradGpa')?.value || '',
        interSchool: document.getElementById('interSchool')?.value || '',
        interGpa: document.getElementById('interGpa')?.value || '',
        interBoard: document.getElementById('interBoard')?.value || '',
        interYear: document.getElementById('interYear')?.value || '',
        highSchool: document.getElementById('highSchool')?.value || '',
        highGpa: document.getElementById('highGpa')?.value || '',
        highBoard: document.getElementById('highBoard')?.value || '',
        highYear: document.getElementById('highYear')?.value || '',
        dob: document.getElementById('dob')?.value || '',
        additionalInfo: document.getElementById('additionalInfo')?.value || '',
        linkedin: document.getElementById('linkedin').value,
        github: document.getElementById('github').value,
        languages: document.getElementById('languages').value,
        photo: state.photoDataUrl
    };
    state.formData.targetRole = document.getElementById('targetRole').value;
    state.formData.clubCategory = els.clubCategory.value;
    state.formData.clubName = els.clubName.value;

    const purpose = state.formData.purpose;
    if (purpose === 'Campus Club') {
        state.formData.categoryFields = {
            motivation: document.getElementById('motivation').value,
            relevantProjects: document.getElementById('relevantProjects').value,
            campusInvolvement: document.getElementById('campusInvolvement').value,
            achievements: document.getElementById('campusAchievements').value
        };
    } else if (purpose === 'Internship' || purpose === 'Job' || purpose === 'Freelance') {
        state.formData.categoryFields = {
            workExperience: document.getElementById('workExperience').value,
            certifications: document.getElementById('certifications').value,
            projects: document.getElementById('jobProjects').value,
            achievements: document.getElementById('jobAchievements').value,
            references: document.getElementById('jobReferences')?.value || ''
        };
    } else if (purpose === 'Academic') {
        state.formData.categoryFields = {
            gpa: document.getElementById('gpa').value,
            researchWork: document.getElementById('researchWork').value,
            coursework: document.getElementById('coursework').value,
            academicProjects: document.getElementById('academicProjects').value,
            achievements: document.getElementById('academicAchievements').value
        };
    }
}

function generateResumeTextFallback() {
    const d = state.formData;
    const p = d.personalDetails;
    const purpose = d.purpose;
    let text = '';

    text += `NAME\n${p.fullName}\n\n`;
    text += `CONTACT\n`;
    text += `Email: ${p.email}\n`;
    text += `Phone: ${p.phone}\n`;
    text += `Location: ${p.location}\n`;
    if (p.linkedin) text += `LinkedIn: ${p.linkedin}\n`;
    if (p.github) text += `GitHub: ${p.github}\n`;
    if (p.languages) text += `Languages: ${p.languages}\n`;
    text += `\n`;

    if (purpose === 'Campus Club') {
        text += `ABOUT ME\n`;
        text += `I am a ${d.experienceLevel.toLowerCase()} ${p.degree} student at ${p.college}, passionate about contributing to ${d.clubName || 'campus activities'}. `;
        text += `With a strong foundation in ${d.skills.slice(0, 3).join(', ') || 'relevant skills'}, I am eager to bring fresh ideas and dedication to the team.\n\n`;
        text += `EDUCATION\n${p.college}\n${p.degree}\nExpected Graduation: ${p.gradYear || ""}dYear || '2027'}\n\n`;
        if (d.categoryFields.motivation) text += `WHY I WANT TO JOIN\n${d.categoryFields.motivation}\n\n`;
        if (d.skills.length > 0) text += `SKILLS\n${d.skills.join(', ')}\n\n`;
        if (d.categoryFields.relevantProjects) text += `PROJECTS\n${d.categoryFields.relevantProjects}\n\n`;
        if (d.categoryFields.achievements) text += `ACHIEVEMENTS\n${d.categoryFields.achievements}\n\n`;
        if (d.categoryFields.campusInvolvement) text += `CAMPUS INVOLVEMENT\n${d.categoryFields.campusInvolvement}\n\n`;
        if (p.languages) text += `LANGUAGES\n${p.languages}\n\n`;
    } else if (purpose === 'Internship' || purpose === 'Job' || purpose === 'Freelance') {
        text += `PROFESSIONAL SUMMARY\n`;
        text += `${d.experienceLevel} ${p.degree} student at ${p.college} with expertise in ${d.skills.slice(0, 4).join(', ') || 'relevant technologies'}. `;
        text += `Seeking ${purpose.toLowerCase()} opportunities to apply technical skills and contribute to impactful projects.\n\n`;
        text += `EDUCATION\n${p.college}\n${p.degree}\nExpected Graduation: ${p.gradYear || ""}dYear || '2027'}\n\n`;
        if (d.skills.length > 0) text += `SKILLS\n${d.skills.join(', ')}\n\n`;
        if (d.categoryFields.projects) text += `PROJECTS\n${d.categoryFields.projects}\n\n`;
        if (d.categoryFields.workExperience) text += `EXPERIENCE\n${d.categoryFields.workExperience}\n\n`;
        if (d.categoryFields.certifications) text += `CERTIFICATIONS\n${d.categoryFields.certifications}\n\n`;
        if (d.categoryFields.achievements) text += `ACHIEVEMENTS\n${d.categoryFields.achievements}\n\n`;
    } else if (purpose === 'Academic') {
        text += `ACADEMIC PROFILE\n`;
        text += `${p.degree} student at ${p.college} with a strong academic record. `;
        if (d.categoryFields.gpa) text += `Current GPA: ${d.categoryFields.gpa}. `;
        text += `Passionate about research and academic excellence in ${d.skills.slice(0, 3).join(', ') || 'the field'}.\n\n`;
        text += `EDUCATION\n${p.college}\n${p.degree}\nExpected Graduation: ${p.gradYear || ""}dYear || '2027'}\n\n`;
        if (d.categoryFields.gpa) text += `GPA: ${d.categoryFields.gpa}\n`;
        text += `\n`;
        if (d.categoryFields.coursework) text += `COURSEWORK\n${d.categoryFields.coursework}\n\n`;
        if (d.categoryFields.researchWork) text += `RESEARCH\n${d.categoryFields.researchWork}\n\n`;
        if (d.categoryFields.academicProjects) text += `PROJECTS\n${d.categoryFields.academicProjects}\n\n`;
        if (d.skills.length > 0) text += `SKILLS\n${d.skills.join(', ')}\n\n`;
        if (d.categoryFields.achievements) text += `ACHIEVEMENTS\n${d.categoryFields.achievements}\n\n`;
    }

    text += `CONTACT\n`;
    text += `Email: ${p.email}\n`;
    text += `Phone: ${p.phone}\n`;
    if (p.linkedin) text += `LinkedIn: ${p.linkedin}\n`;
    if (p.github) text += `GitHub: ${p.github}\n`;
    return text;
}

// ============================================
// PARSE RESUME TEXT — Robust Line-by-Line Section Classifier
// ============================================
function parseResumeText(text) {
    if (!text || !text.trim()) return {};

    const data = {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        languages: '',
        summary: '',
        education: '',
        skills: [],
        skillsText: '',
        projects: '',
        experience: '',
        certifications: '',
        achievements: ''
    };

    const lines = text.split(/\r?\n/);
    let currentSection = 'summary';
    const sectionContent = {};

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const cleanKey = trimmed.toLowerCase().replace(/[^a-z]/g, '');

        let matchedKey = null;
        if (/^(name|candidate|fullname)/i.test(trimmed)) matchedKey = 'name';
        else if (/^(contact|contactinfo|personalinfo)/i.test(trimmed)) matchedKey = 'contact';
        else if (cleanKey.includes('summary') || cleanKey.includes('about') || cleanKey.includes('profile')) matchedKey = 'summary';
        else if (cleanKey.includes('education') || cleanKey.includes('academic')) matchedKey = 'education';
        else if (cleanKey.includes('skill') || cleanKey.includes('competenc') || cleanKey.includes('technolog')) matchedKey = 'skills';
        else if (cleanKey.includes('project')) matchedKey = 'projects';
        else if (cleanKey.includes('experience') || cleanKey.includes('work') || cleanKey.includes('employment')) matchedKey = 'experience';
        else if (cleanKey.includes('certif') || cleanKey.includes('license')) matchedKey = 'certifications';
        else if (cleanKey.includes('achiev') || cleanKey.includes('award') || cleanKey.includes('honor')) matchedKey = 'achievements';
        else if (cleanKey.includes('language')) matchedKey = 'languages';

        const isStandaloneHeader = matchedKey && (trimmed.length < 35 || trimmed === trimmed.toUpperCase());

        if (isStandaloneHeader) {
            currentSection = matchedKey;
            if (!sectionContent[currentSection]) sectionContent[currentSection] = [];
        } else {
            const emailM = trimmed.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            if (emailM && !data.email) data.email = emailM[0];

            const phoneM = trimmed.match(/\+?\d{1,4}[\s\-\.]?\(?\d{2,5}\)?[\s\-\.]?\d{3,5}[\s\-\.]?\d{3,5}/);
            if (phoneM && !data.phone && !trimmed.includes('202') && !trimmed.includes('201')) data.phone = phoneM[0];

            if (!sectionContent[currentSection]) sectionContent[currentSection] = [];
            sectionContent[currentSection].push(trimmed);
        }
    });

    if (sectionContent['name']) data.fullName = sectionContent['name'].join(' ');
    if (sectionContent['summary']) data.summary = sectionContent['summary'].join('\n');
    if (sectionContent['education']) data.education = sectionContent['education'].join('\n');
    if (sectionContent['experience']) data.experience = sectionContent['experience'].join('\n');
    if (sectionContent['projects']) data.projects = sectionContent['projects'].join('\n');
    if (sectionContent['certifications']) data.certifications = sectionContent['certifications'].join('\n');
    if (sectionContent['achievements']) data.achievements = sectionContent['achievements'].join('\n');
    if (sectionContent['languages']) data.languages = sectionContent['languages'].join(', ');

    if (sectionContent['skills']) {
        const rawSkillsStr = sectionContent['skills'].join(', ');
        data.skillsText = rawSkillsStr;
        data.skills = rawSkillsStr.split(/[,|•·\n]+/).map(s => s.trim()).filter(s => s && s.length < 35);
    }

    const p = state.formData.personalDetails || {};
    data.fullName = data.fullName || p.fullName || 'MD TAUSIF';
    data.email = data.email || p.email || '';
    data.phone = data.phone || p.phone || '';
    data.location = data.location || p.location || '';
    data.targetRole = data.targetRole || p.targetRole || 'AI / Machine Learning Engineer';
    data.college = p.college || '';
    data.degree = p.degree || '';
    data.undergradGpa = p.undergradGpa || '';
    data.gradYear = p.gradYear || '';
    data.interSchool = p.interSchool || '';
    data.interGpa = p.interGpa || '';
    data.interBoard = p.interBoard || '';
    data.interYear = p.interYear || '';
    data.highSchool = p.highSchool || '';
    data.highGpa = p.highGpa || '';
    data.highBoard = p.highBoard || '';
    data.highYear = p.highYear || '';
    data.linkedin = data.linkedin || p.linkedin || '';
    data.github = data.github || p.github || '';

    return data;
}

// ============================================
// BUILD RESUME HTML
// ============================================
function getContentDensity(data) {
    let score = 0;
    if (data.summary && data.summary.trim().length > 0) score += Math.min(data.summary.trim().length / 60, 4);
    if (data.experience && data.experience.trim().length > 0) score += Math.min(data.experience.trim().length / 80, 7);
    if (data.projects && data.projects.trim().length > 0) score += Math.min(data.projects.trim().length / 80, 7);
    if (data.education && data.education.trim().length > 0) score += Math.min(data.education.trim().length / 80, 4);
    if (data.college) score += 3;
    if (data.interSchool) score += 2;
    if (data.highSchool) score += 2;
    if (data.skills && data.skills.length > 0) score += Math.min(data.skills.length * 0.4, 4);
    if (data.certifications && data.certifications.trim().length > 0) score += Math.min(data.certifications.trim().length / 100, 3);
    if (data.achievements && data.achievements.trim().length > 0) score += Math.min(data.achievements.trim().length / 100, 3);
    if (data.campusInvolvement && data.campusInvolvement.trim().length > 0) score += 2;
    if (data.languages && data.languages.trim().length > 0) score += 1;

    if (score < 8)  return 'low';
    if (score > 28) return 'very-high';
    if (score > 17) return 'high';
    return 'medium';
};

// ============================================
// PER-COLUMN DENSITY
// ============================================
// Unlike getContentDensity() (whole-resume), this scores just ONE column's
// worth of section text and returns a density keyword for it. Two-column
// templates use this separately for sidebar vs main so a column that's
// naturally shorter (e.g. Work Experience+Projects only) gets larger
// font/spacing to fill its space, instead of looking emptier than its
// neighbour just because it has fewer sections.
function getColumnDensityScore(sectionScores) {
    return sectionScores.reduce((sum, s) => sum + (s || 0), 0);
}
function columnDensityClass(score, lowMax, highMin) {
    if (score < lowMax) return 'col-density-low';
    if (score > highMin) return 'col-density-high';
    return 'col-density-medium';
}

// ============================================
// COLUMN BALANCE HELPER
// ============================================
// Quick heuristic to guess vertical size of a section
function _sectionScore(text) {
    if (!text) return 0;
    return text.length / 50 + (text.match(/\n/g) || []).length;
}

// Estimates a score (proxy for rendered height) for a text section based on column width wrapping.
function estimateSectionLines(text, colWidthChars) {
    if (!text || !text.trim()) return 0;
    return text.trim().split('\n').reduce((total, line) => {
        // Each line wraps based on the estimated character capacity of the column
        return total + Math.ceil((line.length || 1) / colWidthChars);
    }, 0);
}

/**
 * Pre-Flight Multi-Candidate Layout Planner & Visual Harmony Score Engine.
 * Evaluates candidate layout placements (Education in Right vs Left, etc.)
 * and selects the candidate that maximizes S_harmony = 100 - 1.5*|H_left - H_right| - 3.0*Overflow.
 */
// Dynamic section placement overrides computed by ConstraintLayoutEngine
let gSectionPlacementOverrides = {};

function balanceDualPanelSections(data, templateId = '') {
    if (gSectionPlacementOverrides && Object.keys(gSectionPlacementOverrides).length > 0) {
        return {
            isLeft: (key) => gSectionPlacementOverrides[key] === 'left',
            isRight: (key) => gSectionPlacementOverrides[key] === 'right' || !gSectionPlacementOverrides[key],
            filter: (fn) => Object.entries(gSectionPlacementOverrides).filter(fn),
            moveables: Object.entries(gSectionPlacementOverrides),
            leftScore: 12,
            rightScore: 12,
            harmonyScore: 95
        };
    }

    const LEFT_COL_CHARS = 30;  // Narrow 30% sidebar capacity
    const RIGHT_COL_CHARS = 65; // Wide 70% main column capacity

    const lineWeight = (text, charsPerLine) => {
        if (!text || !text.trim()) return 0;
        return text.trim().split('\n').reduce((tot, line) => tot + Math.ceil(Math.max(1, line.length) / charsPerLine), 0);
    };

    const eduWeightLeft = 5 + (data.college ? 3 : 0) + (data.interSchool ? 2 : 0) + (data.highSchool ? 2 : 0);
    const eduWeightRight = 2 + (data.college ? 2 : 0) + (data.interSchool ? 1.5 : 0) + (data.highSchool ? 1.5 : 0);

    const skillsCount = (data.skills || []).length;
    const skillsWeightLeft = Math.ceil(skillsCount / 2) + 2;
    const skillsWeightRight = Math.ceil(skillsCount / 4) + 1.5;

    const summaryLines = lineWeight(data.summary, RIGHT_COL_CHARS);
    const expLines = lineWeight(data.experience, RIGHT_COL_CHARS);
    const projLines = lineWeight(data.projects || data.categoryFields?.relevantProjects, RIGHT_COL_CHARS);
    const motivLines = lineWeight(data.motivation, RIGHT_COL_CHARS);
    const certLines = lineWeight(data.certifications, RIGHT_COL_CHARS);
    const achvLines = lineWeight(data.achievements, RIGHT_COL_CHARS);
    const langLines = lineWeight(data.languages, LEFT_COL_CHARS);

    const fixedSidebarLines = 9; // Photo, Name, Contact

    // Candidate 1: Education, Experience, Projects, Motivation in RIGHT column (DEFAULT BEST FOR FRESHERS)
    const cand1 = [
        { key: 'education',      side: 'right', scoreL: eduWeightLeft, scoreR: eduWeightRight },
        { key: 'experience',     side: 'right', scoreL: lineWeight(data.experience, LEFT_COL_CHARS), scoreR: expLines },
        { key: 'projects',       side: 'right', scoreL: lineWeight(data.projects, LEFT_COL_CHARS), scoreR: projLines },
        { key: 'motivation',     side: 'right', scoreL: lineWeight(data.motivation, LEFT_COL_CHARS), scoreR: motivLines },
        { key: 'certifications', side: (summaryLines + expLines + projLines + eduWeightRight > 24) ? 'left' : 'right', scoreL: lineWeight(data.certifications, LEFT_COL_CHARS), scoreR: certLines },
        { key: 'achievements',   side: (summaryLines + expLines + projLines + eduWeightRight > 20) ? 'left' : 'right', scoreL: lineWeight(data.achievements, LEFT_COL_CHARS), scoreR: achvLines },
        { key: 'languages',      side: 'left',  scoreL: langLines, scoreR: lineWeight(data.languages, RIGHT_COL_CHARS) },
        { key: 'skills',         side: 'left',  scoreL: skillsWeightLeft, scoreR: skillsWeightRight }
    ];

    const hLeft1 = (fixedSidebarLines + cand1.filter(c => c.side === 'left').reduce((a, c) => a + c.scoreL, 0)) * 22;
    const hRight1 = (cand1.filter(c => c.side === 'right').reduce((a, c) => a + c.scoreR, 0) + summaryLines) * 22;
    const harm1 = 100 - (1.5 * Math.abs(hLeft1 - hRight1)) - (3.0 * Math.max(0, Math.max(hLeft1, hRight1) - 1050));

    // Candidate 2: Certifications shifted left if right side is heavy
    const cand2 = cand1.map(c => {
        if (c.key === 'certifications' && hRight1 > 850) return { ...c, side: 'left' };
        return { ...c };
    });
    const hLeft2 = (fixedSidebarLines + cand2.filter(c => c.side === 'left').reduce((a, c) => a + c.scoreL, 0)) * 22;
    const hRight2 = (cand2.filter(c => c.side === 'right').reduce((a, c) => a + c.scoreR, 0) + summaryLines) * 22;
    const harm2 = 100 - (1.5 * Math.abs(hLeft2 - hRight2)) - (3.0 * Math.max(0, Math.max(hLeft2, hRight2) - 1050));

    const winner = (harm2 >= harm1) ? cand2 : cand1;
    const bestLeftScore = (harm2 >= harm1) ? (hLeft2 / 22) : (hLeft1 / 22);
    const bestRightScore = (harm2 >= harm1) ? (hRight2 / 22) : (hRight1 / 22);

    return {
        isLeft: (key) => winner.find(c => c.key === key)?.side === 'left',
        isRight: (key) => winner.find(c => c.key === key)?.side === 'right',
        filter: (fn) => winner.filter(fn),
        moveables: winner,
        leftScore: bestLeftScore,
        rightScore: bestRightScore,
        harmonyScore: Math.max(harm1, harm2)
    };
}

function buildResumeHTML(data, templateId, isPreview = false) {
    const t = allTemplates.find(t => t.id === templateId) || allTemplates[0];
    const prefix = t.class;
    const initials = (data.fullName || 'MT').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // Always show photo block - either uploaded photo or initials circle
    const photoHTML = data.photo 
        ? `<img src="${data.photo}" class="${prefix}-photo" alt="Profile">`
        : `<div class="${prefix}-photo initials-circle" style="background:${t.color || '#6366f1'};">${initials}</div>`;

    const contactItems = [];
    if (data.email) contactItems.push(`<span class="${prefix}-contact-item"><i class="fas fa-envelope"></i> ${data.email}</span>`);
    if (data.phone) contactItems.push(`<span class="${prefix}-contact-item"><i class="fas fa-phone"></i> ${data.phone}</span>`);
    if (data.location) contactItems.push(`<span class="${prefix}-contact-item"><i class="fas fa-map-marker-alt"></i> ${data.location}</span>`);
    if (data.linkedin) contactItems.push(`<span class="${prefix}-contact-item"><i class="fab fa-linkedin"></i> ${data.linkedin}</span>`);
    if (data.github) contactItems.push(`<span class="${prefix}-contact-item"><i class="fab fa-github"></i> ${data.github}</span>`);
    const contactHTML = contactItems.join(' | ');

    // Modern Clean specific: vertical list item wrappers with no pipes or dashes
    const mcContactHTML = contactItems.map(item => `<div class="mc-contact-row-item">${item}</div>`).join('');

    const contactVerticalItems = [];
    if (data.email) contactVerticalItems.push(`<div class="${prefix}-contact-row"><i class="fas fa-envelope"></i> ${data.email}</div>`);
    if (data.phone) contactVerticalItems.push(`<div class="${prefix}-contact-row"><i class="fas fa-phone"></i> ${data.phone}</div>`);
    if (data.location) contactVerticalItems.push(`<div class="${prefix}-contact-row"><i class="fas fa-map-marker-alt"></i> ${data.location}</div>`);
    if (data.linkedin) contactVerticalItems.push(`<div class="${prefix}-contact-row"><i class="fab fa-linkedin"></i> ${data.linkedin}</div>`);
    if (data.github) contactVerticalItems.push(`<div class="${prefix}-contact-row"><i class="fab fa-github"></i> ${data.github}</div>`);
    const contactVerticalHTML = contactVerticalItems.join('');

    const skillsHTML = (data.skills || []).map(s => `<span class="${prefix}-skill-tag">${s}</span>`).join('');
    const skillsListHTML = (data.skills || []).map(s => `â€¢ ${s}`).join('<br>');

    // Elegant Beige specific skills ratings
    const skillsDotsHTML = (data.skills || []).map((s, idx) => {
        const ratings = [5, 4, 3, 5, 4];
        const rating = ratings[idx % ratings.length];
        let dots = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) dots += '<span class="eb-dot active">â—</span>';
            else dots += '<span class="eb-dot">â—‹</span>';
        }
        return `<div class="eb-skill-row"><span class="eb-skill-name">${s}</span><span class="eb-skill-dots">${dots}</span></div>`;
    }).join('');

    const density = getContentDensity(data);
    const densityClass = `density-${density}`;

    const section = (title, content) => {
        if (!content || !content.trim()) return '';
        return `<div class="${prefix}-section"><div class="${prefix}-section-title">${title}</div><div class="${prefix}-content">${content.replace(/\n/g, '<br>')}</div></div>`;
    };

    const sidebarSection = (title, content, maxWords = 45) => {
        if (!content || !content.trim()) return '';
        let processed = content.trim();
        const words = processed.split(/\s+/);
        if (words.length > maxWords) {
            processed = words.slice(0, maxWords).join(' ') + '...';
        }
        return `<div class="${prefix}-section"><div class="${prefix}-section-title">${title}</div><div class="${prefix}-content">${processed.replace(/\n/g, '<br>')}</div></div>`;
    };

    const getStructuredEducationHTML = (prefix, reverseOrder = false) => {
        let eduHTML = '';
        const items = [];
        if (data.highSchool) {
            items.push(`
                <div class="${prefix}-edu-item">
                    <div class="${prefix}-edu-header">MATRICULATION (CLASS X)</div>
                    <div class="${prefix}-edu-row">
                        <span class="${prefix}-edu-inst">${data.highSchool}</span>
                        <span class="${prefix}-edu-gpa">${data.highGpa} | ${data.highBoard} (${data.highYear})</span>
                    </div>
                </div>
            `);
        }
        if (data.interSchool) {
            items.push(`
                <div class="${prefix}-edu-item">
                    <div class="${prefix}-edu-header">INTERMEDIATE (CLASS XII)</div>
                    <div class="${prefix}-edu-row">
                        <span class="${prefix}-edu-inst">${data.interSchool}</span>
                        <span class="${prefix}-edu-gpa">${data.interGpa} | ${data.interBoard} (${data.interYear})</span>
                    </div>
                </div>
            `);
        }
        if (data.college) {
            items.push(`
                <div class="${prefix}-edu-item">
                    <div class="${prefix}-edu-header">UNDERGRADUATE</div>
                    <div class="${prefix}-edu-row">
                        <span class="${prefix}-edu-inst">${data.college}</span>
                        <span class="${prefix}-edu-gpa">${data.undergradGpa || ''} | ${data.degree}${data.gradYear ? ` (${data.gradYear})` : ''}</span>
                    </div>
                </div>
            `);
        }
        if (reverseOrder) {
            items.reverse();
        }
        eduHTML = items.join('');
        if (!eduHTML) {
            eduHTML = data.education ? `<div class="${prefix}-edu-text">${data.education.replace(/\n/g, '<br>')}</div>` : '';
        }
        return eduHTML;
    };

    let outputHTML = '';

    switch(templateId) {
        case 'modern': {
            const mcRow = (title, contentHTML) => {
                if (!contentHTML || !contentHTML.trim()) return '';
                return `<div class="mc-row"><div class="mc-title-col">${title}</div><div class="mc-content-col">${contentHTML}</div></div>`;
            };
            outputHTML = `
                <div class="mc-resume ${densityClass}">
                    <div class="mc-header">
                        <div class="mc-name-wrap">
                            <div class="mc-name">${data.fullName || 'Your Name'}</div>
                            <div class="mc-role">${data.targetRole || 'Target Role'}</div>
                        </div>
                        <div class="mc-contact-bar">${mcContactHTML}</div>
                    </div>
                    <div class="mc-body">
                        ${mcRow('Professional Summary', data.summary ? data.summary.replace(/\n/g, '<br>') : '')}
                        ${mcRow('Technical Skills', skillsHTML)}
                        ${mcRow('Projects', data.projects ? data.projects.replace(/\n/g, '<br>') : '')}
                        ${mcRow('Education', getStructuredEducationHTML('mc', false))}
                        ${mcRow('Experience', data.experience ? data.experience.replace(/\n/g, '<br>') : '')}
                        ${mcRow('Certifications', data.certifications ? data.certifications.replace(/\n/g, '<br>') : '')}
                        ${mcRow('Achievements', data.achievements ? data.achievements.replace(/\n/g, '<br>') : '')}
                        ${mcRow('Languages', data.languages ? data.languages.replace(/\n/g, '<br>') : '')}
                    </div>
                </div>
            `;
            break;
        }
        case 'creative': {
            const bal = balanceDualPanelSections(data);
            const crMoveEdu = bal.isLeft('education');
            const crMoveCerts = bal.isLeft('certifications');
            const crMoveAchievements = bal.isLeft('achievements');
            const crMoveLangs = bal.isLeft('languages');
            const crMoveInterests = bal.isLeft('additionalInfo');

            const sidebarHTML = `
                <div class="cr-sidebar">
                    <div class="cr-photo-wrap">${photoHTML}</div>
                    ${sidebarSection('About Me', data.summary)}
                    ${section('Contact', contactVerticalHTML)}
                    ${crMoveLangs ? section('Languages', data.languages) : ''}
                    <div class="cr-section">
                        <div class="cr-section-title">Skills</div>
                        <div class="cr-content">${skillsHTML}</div>
                    </div>
                    ${crMoveEdu ? `
                    <div class="cr-section">
                        <div class="cr-section-title">Education</div>
                        <div class="cr-content">${getStructuredEducationHTML('cr', false)}</div>
                    </div>` : ''}
                    ${crMoveInterests && data.additionalInfo ? section('Interests', data.additionalInfo) : ''}
                    ${crMoveCerts ? section('Certifications', data.certifications) : ''}
                    ${crMoveAchievements ? section('Achievements', data.achievements) : ''}
                </div>
            `;
            const mainHTML = `
                <div class="cr-main">
                    <div class="cr-banner">
                        <div class="cr-name">${data.fullName || 'Your Name'}</div>
                        <div class="cr-role">${data.targetRole || 'Creative Professional'}</div>
                    </div>
                    <div class="cr-right-content">
                        ${section('Experience', data.experience)}
                        ${!crMoveEdu ? `
                        <div class="cr-section">
                            <div class="cr-section-title">Education</div>
                            <div class="cr-content">${getStructuredEducationHTML('cr', false)}</div>
                        </div>` : ''}
                        ${section('Projects', data.projects)}
                        ${!crMoveLangs ? section('Languages', data.languages) : ''}
                        ${!crMoveInterests && data.additionalInfo ? section('Interests', data.additionalInfo) : ''}
                        ${!crMoveCerts ? section('Certifications', data.certifications) : ''}
                        ${!crMoveAchievements ? section('Achievements', data.achievements) : ''}
                    </div>
                </div>
            `;
            outputHTML = `<div class="cr-resume ${densityClass}">${sidebarHTML}${mainHTML}</div>`;
            break;
        }
        case 'minimalPro': {
            const bal = balanceDualPanelSections(data);
            const mpMoveEdu = bal.isLeft('education');
            const mpMoveCerts = bal.isLeft('certifications');
            const mpMoveAchievements = bal.isLeft('achievements');
            const mpMoveLangs = bal.isLeft('languages');

            const mpLeftDensity  = columnDensityClass(bal.leftScore, 9, 18);
            const mpRightDensity = columnDensityClass(bal.rightScore, 9, 18);

            const sidebarHTML = `
                <div class="mp-sidebar ${mpLeftDensity}">
                    <div class="mp-photo-wrap">${photoHTML}</div>
                    ${data.dob ? section('Date of Birth', data.dob) : ''}
                    ${section('About Me', data.summary)}
                    <div class="mp-section">
                        <div class="mp-section-title">Programs / Skills</div>
                        <div class="mp-content">${skillsHTML}</div>
                    </div>
                    ${mpMoveEdu ? `
                    <div class="mp-section">
                        <div class="mp-section-title">Education</div>
                        <div class="mp-content">${getStructuredEducationHTML('mp', true)}</div>
                    </div>` : ''}
                    ${section('Languages', data.languages)}
                    ${data.additionalInfo ? section('Additional Info', data.additionalInfo) : ''}
                    ${mpMoveCerts ? section('Certifications', data.certifications) : ''}
                    ${section('Contact', contactVerticalHTML)}
                </div>
            `;
            const mainHTML = `
                <div class="mp-main ${mpRightDensity}">
                    <div class="mp-header">
                        <div class="mp-name">${data.fullName || 'Your Name'}</div>
                        <div class="mp-role">${data.targetRole || 'Professional'}</div>
                    </div>
                    ${section('Work Experience', data.experience)}
                    ${!mpMoveEdu ? `
                    <div class="mp-section">
                        <div class="mp-section-title">Education</div>
                        <div class="mp-content">${getStructuredEducationHTML('mp', true)}</div>
                    </div>` : ''}
                    ${section('Projects', data.projects)}
                    ${!mpMoveCerts ? section('Certifications', data.certifications) : ''}
                </div>
            `;
            outputHTML = `<div class="mp-resume ${densityClass}">${sidebarHTML}${mainHTML}</div>`;
            break;
        }
        case 'elegantBeige': {
            const headerCardHTML = `
                <div class="eb-header-card">
                    <div class="eb-header-photo-wrap">${photoHTML}</div>
                    <div class="eb-header-info">
                        <div class="eb-name">${data.fullName || 'Your Name'}</div>
                        <div class="eb-role">${data.targetRole || 'Professional'}</div>
                    </div>
                </div>
            `;
            const balEB = balanceDualPanelSections(data, 'elegantBeige');
            const ebEduLeft = balEB.isLeft('education');
            const ebLangLeft = balEB.isLeft('languages');
            const ebCertsLeft = balEB.isLeft('certifications');
            const sidebarHTML = `
                <div class="eb-sidebar">
                    ${section('Contact', contactVerticalHTML)}
                    ${ebEduLeft ? `
                    <div class="eb-section">
                        <div class="eb-section-title">Education</div>
                        <div class="eb-content">${getStructuredEducationHTML('eb', true)}</div>
                    </div>` : ''}
                    <div class="eb-section">
                        <div class="eb-section-title">Skills</div>
                        <div class="eb-content">${skillsDotsHTML}</div>
                    </div>
                    ${ebCertsLeft ? section('Certifications', data.certifications) : ''}
                    ${ebLangLeft ? section('Languages', data.languages) : ''}
                </div>
            `;
            const mainHTML = `
                <div class="eb-main">
                    ${headerCardHTML}
                    ${section('Professional Summary', data.summary)}
                    ${!ebEduLeft ? `
                    <div class="eb-section">
                        <div class="eb-section-title">Education</div>
                        <div class="eb-content">${getStructuredEducationHTML('eb', false)}</div>
                    </div>` : ''}
                    ${section('Experience', data.experience)}
                    ${section('Projects', data.projects)}
                    ${!ebCertsLeft ? section('Certifications', data.certifications) : ''}
                    ${!ebLangLeft ? section('Languages', data.languages) : ''}
                </div>
            `;
            outputHTML = `<div class="eb-resume ${densityClass}">${sidebarHTML}${mainHTML}</div>`;
            break;
        }
        case 'diagonal': {
            const balDG = balanceDualPanelSections(data, 'diagonal');
            const dgEduLeft = balDG.isLeft('education');
            const dgCertsLeft = balDG.isLeft('certifications');
            const dgLangLeft = balDG.isLeft('languages');
            const dgAchvLeft = balDG.isLeft('achievements');

            const sidebarHTML = `
                <div class="dg-sidebar">
                    <div class="dg-photo-wrap">${photoHTML}</div>
                    <div class="dg-diagonal-divider"></div>
                    <div class="dg-sidebar-content">
                        ${section('Contact', contactVerticalHTML)}
                        ${dgEduLeft ? `
                        <div class="dg-section">
                            <div class="dg-section-title">Education</div>
                            <div class="dg-content">${getStructuredEducationHTML('dg', false)}</div>
                        </div>` : ''}
                        <div class="dg-section">
                            <div class="dg-section-title">Skills</div>
                            <div class="dg-content">${skillsHTML}</div>
                        </div>
                        ${dgCertsLeft ? section('Certifications', data.certifications) : ''}
                        ${dgLangLeft ? section('Languages', data.languages) : ''}
                        ${dgAchvLeft ? section('Achievements', data.achievements) : ''}
                    </div>
                </div>
            `;
            const mainHTML = `
                <div class="dg-main">
                    <div class="dg-header">
                        <div class="dg-name">${data.fullName || 'Your Name'}</div>
                        <div class="dg-role">${data.targetRole || 'Professional'}</div>
                    </div>
                    ${section('Profile Summary', data.summary)}
                    ${!dgEduLeft ? `
                    <div class="dg-section">
                        <div class="dg-section-title">Education</div>
                        <div class="dg-content">${getStructuredEducationHTML('dg', false)}</div>
                    </div>` : ''}
                    ${section('Experience', data.experience)}
                    ${section('Projects', data.projects)}
                    ${!dgCertsLeft ? section('Certifications', data.certifications) : ''}
                    ${!dgAchvLeft ? section('Awards', data.achievements) : ''}
                    ${!dgLangLeft ? section('Languages', data.languages) : ''}
                </div>
            `;
            outputHTML = `<div class="dg-resume ${densityClass}">${sidebarHTML}${mainHTML}</div>`;
            break;
        }
        case 'dualPanel': {
            // Build skills with percentage alignment
            const dpSkillsRows = (data.skills || []).map((s, idx) => {
                const pcts = [90, 87, 95, 84, 92, 88, 91];
                return `<div class="dp-skill-row"><span>${s}</span><span>${pcts[idx % pcts.length]}%</span></div>`;
            }).join('');

            // Build language circles helper
            const langItems = (data.languages || '').split(/[,\n]+/).map(l => l.trim()).filter(l => l);
            const langPcts = [94, 90, 84, 88, 86];
            const makeDpLanguageHTML = () => langItems.length > 0
                ? `<div class="dp-lang-row">${langItems.slice(0, 3).map((l, i) => {
                    const pct = langPcts[i % langPcts.length];
                    const deg = Math.round(pct * 3.6);
                    return `<div class="dp-lang-item">
                        <div class="dp-lang-circle" style="background: conic-gradient(#B8C091 ${deg}deg, rgba(255,255,255,0.15) ${deg}deg);">
                            <span class="dp-lang-pct">${pct}%</span>
                        </div>
                        <div class="dp-lang-label">${l}</div>
                    </div>`;
                }).join('')}</div>`
                : '';

            // Run column-balance algorithm
            const dpBalanced = balanceDualPanelSections(data);
            const dpLeftMoveable  = dpBalanced.filter(m => m.side === 'left');
            const dpRightMoveable = dpBalanced.filter(m => m.side === 'right');

            // Build LEFT extra sections (moveable sections assigned to left)
            let dpLeftExtra = '';
            for (const m of dpLeftMoveable) {
                if (!m.text || !m.text.trim()) continue;
                if (m.key === 'languages') {
                    dpLeftExtra += langItems.length > 0 ? `
                    <div class="dp-lsection">
                        <div class="dp-pill-label">Language:</div>
                        ${makeDpLanguageHTML()}
                    </div>` : '';
                } else {
                    dpLeftExtra += `<div class="dp-lsection">
                        <div class="dp-pill-label">${m.label}</div>
                        <div class="dp-lcontent">${m.text.replace(/\n/g, '<br>')}</div>
                    </div>`;
                }
            }

            // Build RIGHT content - fixed sections always in right
            let dpRightContent = '';
            if (data.experience && data.experience.trim()) {
                dpRightContent += `<div class="dp-rsection">
                    <div class="dp-pill-label">Professional Experience:</div>
                    <div class="dp-rcontent">${data.experience.replace(/\n/g, '<br>')}</div>
                </div>`;
            }
            if (data.projects && data.projects.trim()) {
                dpRightContent += `<div class="dp-rsection">
                    <div class="dp-pill-label">Projects:</div>
                    <div class="dp-rcontent">${data.projects.replace(/\n/g, '<br>')}</div>
                </div>`;
            }
            // Add moveable sections assigned to right
            for (const m of dpRightMoveable) {
                if (!m.text || !m.text.trim()) continue;
                if (m.key === 'languages') {
                    dpRightContent += langItems.length > 0 ? `<div class="dp-rsection">
                        <div class="dp-pill-label">${m.label}</div>
                        <div class="dp-rcontent">${makeDpLanguageHTML()}</div>
                    </div>` : '';
                } else {
                    dpRightContent += `<div class="dp-rsection">
                        <div class="dp-pill-label">${m.label}</div>
                        <div class="dp-rcontent">${m.text.replace(/\n/g, '<br>')}</div>
                    </div>`;
                }
            }

            // Split name into first and last for premium display
            const nameParts = (data.fullName || 'Your Name').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            outputHTML = `
                <div class="dp-resume ${densityClass}">
                    <div class="dp-header-container">
                        <div class="dp-header-top">
                            <div class="dp-name-block">
                                <div class="dp-firstname">${firstName.toUpperCase()}</div>
                                <div class="dp-lastname">${lastName}</div>
                                <div class="dp-role">${data.targetRole || 'Professional'}</div>
                            </div>
                            <div class="dp-photo-floating">${photoHTML}</div>
                        </div>
                        <div class="dp-about-card">
                            <span class="dp-about-label">About Me</span>
                            <p>${data.summary ? data.summary.replace(/\n/g, '<br>') : ''}</p>
                        </div>
                    </div>
                    <div class="dp-body-columns">
                        <div class="dp-left">
                            <div class="dp-left-sections">
                                <div class="dp-lsection">
                                    <div class="dp-pill-label">Skills:</div>
                                    <div class="dp-lcontent">${dpSkillsRows}</div>
                                </div>
                                ${dpBalanced.isLeft('education') ? `
                                <div class="dp-lsection">
                                    <div class="dp-pill-label">Education:</div>
                                    <div class="dp-lcontent">${getStructuredEducationHTML('dp', true)}</div>
                                </div>` : ''}
                                ${dpLeftExtra}
                                <div class="dp-contact-block">
                                    ${contactVerticalHTML}
                                </div>
                            </div>
                        </div>
                        <div class="dp-right">
                            ${dpBalanced.isRight('education') ? `
                            <div class="dp-rsection">
                                <div class="dp-pill-label">Education:</div>
                                <div class="dp-rcontent">${getStructuredEducationHTML('dp', false)}</div>
                            </div>` : ''}
                            ${dpRightContent}
                        </div>
                    </div>
                </div>
            `;
            break;
        }
        case 'campusClub': {
            const rawLeft  = _sectionScore(data.summary) + (data.skills || []).length * 0.8 + 3;
            const rawRight = _sectionScore(data.motivation) + _sectionScore(data.campusInvolvement) + _sectionScore(data.projects) + _sectionScore(data.achievements) + _sectionScore(data.languages) + 4;

            const diff = rawRight - rawLeft;
            const ccMoveEdu = diff > 5;
            const ccMoveAchv = data.achievements && (diff > 3 || ccMoveEdu);
            const ccMoveLangs = data.languages && (diff > 4 || ccMoveEdu);

            const sidebarHTML = `
                <div class="cc-sidebar">
                    <div class="cc-photo-wrap">${photoHTML}</div>
                    ${section('About Me', data.summary)}
                    ${section('Contact', contactVerticalHTML)}
                    <div class="cc-section">
                        <div class="cc-section-title">Skills</div>
                        <div class="cc-content">${skillsHTML}</div>
                    </div>
                    ${ccMoveEdu ? `
                    <div class="cc-section">
                        <div class="cc-section-title">Education</div>
                        <div class="cc-content">${getStructuredEducationHTML('cc', false)}</div>
                    </div>` : ''}
                    ${data.additionalInfo ? section('Interests', data.additionalInfo) : ''}
                    ${ccMoveAchv  ? section('Achievements', data.achievements) : ''}
                    ${ccMoveLangs ? section('Languages',    data.languages)    : ''}
                </div>
            `;
            const mainHTML = `
                <div class="cc-main">
                    <div class="cc-header">
                        <div class="cc-name">${data.fullName || 'Your Name'}</div>
                        <div class="cc-applying">Applying For: ${data.targetRole || 'Campus Club Member'}</div>
                    </div>
                    ${section('Why I Want To Join', data.motivation)}
                    ${!ccMoveEdu ? `
                    <div class="cc-section">
                        <div class="cc-section-title">Education</div>
                        <div class="cc-content">${getStructuredEducationHTML('cc', false)}</div>
                    </div>` : ''}
                    ${section('Relevant Coursework', data.coursework)}
                    ${section('Previous Club Experience', data.campusInvolvement)}
                    ${section('Projects & Contributions', data.projects)}
                    ${!ccMoveAchv  ? section('Achievements', data.achievements) : ''}
                    ${!ccMoveLangs ? section('Languages',    data.languages)    : ''}
                </div>
            `;
            outputHTML = `<div class="cc-resume ${densityClass}">${sidebarHTML}${mainHTML}</div>`;
            break;
        }
        case 'campusMinimal': {
            const headerHTML = `
                <div class="cm-header">
                    <div class="cm-header-left">
                        <div class="cm-photo-wrap">${photoHTML}</div>
                        <div class="cm-header-name-role">
                            <div class="cm-name">${data.fullName || 'Your Name'}</div>
                            <div class="cm-applying">Applying For: ${data.targetRole || 'Campus Role'}</div>
                        </div>
                    </div>
                    <div class="cm-header-right">
                        <div class="cm-contact-grid">${contactVerticalHTML}</div>
                    </div>
                </div>
            `;
            const eduTimelineHTML = `
                <div class="cm-edu-timeline">
                    <div class="cm-edu-card">
                        <div class="cm-edu-title">Matriculation</div>
                        <div class="cm-edu-inst">${data.highSchool || 'High School'}</div>
                        <div class="cm-edu-gpa">${data.highGpa || ''} (${data.highYear || ''})</div>
                    </div>
                    <div class="cm-edu-card">
                        <div class="cm-edu-title">Intermediate</div>
                        <div class="cm-edu-inst">${data.interSchool || 'Intermediate'}</div>
                        <div class="cm-edu-gpa">${data.interGpa || ''} (${data.interYear || ''})</div>
                    </div>
                    <div class="cm-edu-card">
                        <div class="cm-edu-title">Undergraduate</div>
                        <div class="cm-edu-inst">${data.college || 'College'}</div>
                        <div class="cm-edu-gpa">${data.undergradGpa || ''} (${data.gradYear || ""} || ''})</div>
                    </div>
                </div>
            `;
            outputHTML = `
                <div class="cm-resume ${densityClass}">
                    ${headerHTML}
                    <div class="cm-body">
                        ${section('About Me', data.summary)}
                        <div class="cm-section">
                            <div class="cm-section-title">Education</div>
                            ${eduTimelineHTML}
                        </div>
                        ${section('Why I Want To Join', data.motivation)}
                        <div class="cm-section">
                            <div class="cm-section-title">Skills</div>
                            <div class="cm-content">${skillsHTML}</div>
                        </div>
                        ${section('Campus Involvement', data.campusInvolvement)}
                        ${section('Achievements', data.achievements)}
                        ${section('Languages', data.languages)}
                    </div>
                </div>
            `;
            break;
        }
        case 'campusAchiever': {
            const balCA = balanceDualPanelSections(data, 'campusAchiever');
            const caEduLeft = balCA.isLeft('education');
            const caMoveAchv = balCA.isLeft('achievements');

            const sidebarHTML = `
                <div class="ca-sidebar">
                    <div class="ca-photo-wrap">${photoHTML}</div>
                    ${sidebarSection('About Me', data.summary)}
                    ${section('Contact', contactVerticalHTML)}
                    <div class="ca-section">
                        <div class="ca-section-title">Skills</div>
                        <div class="ca-content">${skillsHTML}</div>
                    </div>
                    ${caEduLeft ? `
                    <div class="ca-section">
                        <div class="ca-section-title">Education</div>
                        <div class="ca-content">${getStructuredEducationHTML('ca', true)}</div>
                    </div>` : ''}
                    ${section('Languages', data.languages)}
                    ${caMoveAchv ? section('Achievements', data.achievements) : ''}
                </div>
            `;
            const mainHTML = `
                <div class="ca-main">
                    <div class="ca-header">
                        <div class="ca-name">${data.fullName || 'Your Name'}</div>
                        <div class="ca-status">Applying For: ${data.targetRole || 'Software Development Engineer'}</div>
                    </div>
                    ${section('Why I Want To Join', data.motivation)}
                    ${!caEduLeft ? `
                    <div class="ca-section">
                        <div class="ca-section-title">Education</div>
                        <div class="ca-content">${getStructuredEducationHTML('ca', false)}</div>
                    </div>` : ''}
                    ${section('Previous Club Experience', data.categoryFields?.experience || data.experience)}
                    ${section('Projects & Contributions', data.categoryFields?.relevantProjects || data.projects)}
                    ${!caMoveAchv ? section('Achievements', data.achievements) : ''}
                </div>
            `;
            outputHTML = `<div class="ca-resume ${densityClass}">${sidebarHTML}${mainHTML}</div>`;
            break;
        }
        case 'boldBlue': {
            const balBB = balanceDualPanelSections(data);
            const bbMoveEdu = balBB.isLeft('education');
            const bbMoveCerts = balBB.isLeft('certifications');
            const bbMoveAchv = balBB.isLeft('achievements');

            const sidebarHTML = `
                <div class="bb-sidebar">
                    <div class="bb-photo-wrap">${photoHTML}</div>
                    ${sidebarSection('About Me', data.summary)}
                    ${section('Contact', contactVerticalHTML)}
                    ${section('Languages', data.languages)}
                    <div class="bb-section">
                        <div class="bb-section-title">Skills</div>
                        <div class="bb-content">${skillsHTML}</div>
                    </div>
                    ${bbMoveEdu ? `
                    <div class="bb-section">
                        <div class="bb-section-title">Education</div>
                        <div class="bb-content">${getStructuredEducationHTML('bb', true)}</div>
                    </div>` : ''}
                    ${bbMoveCerts ? section('Certifications', data.certifications) : ''}
                    ${bbMoveAchv  ? section('Achievements', data.achievements)    : ''}
                </div>
            `;
            const mainHTML = `
                <div class="bb-main">
                    <div class="bb-banner">
                        <div class="bb-name">${data.fullName || 'Your Name'}</div>
                        <div class="bb-role">${data.targetRole || 'Professional'}</div>
                    </div>
                    <div class="bb-right-content">
                        ${section('Work Experience', data.experience)}
                        ${!bbMoveEdu ? `
                        <div class="bb-section">
                            <div class="bb-section-title">Education</div>
                            <div class="bb-content">${getStructuredEducationHTML('bb', true)}</div>
                        </div>` : ''}
                        ${section('Projects', data.projects)}
                        ${!bbMoveCerts ? section('Certifications', data.certifications) : ''}
                        ${!bbMoveAchv  ? section('Achievements', data.achievements)    : ''}
                    </div>
                </div>
            `;
            outputHTML = `<div class="bb-resume ${densityClass}">${sidebarHTML}${mainHTML}</div>`;
            break;
        }
        case 'classic': {
            outputHTML = `
                <div class="cl-resume ${densityClass}">
                    <div class="cl-header">
                        <div class="cl-name">${data.fullName || 'Your Name'}</div>
                        <div class="cl-role">${data.targetRole || 'Professional'}</div>
                        <div class="cl-contact">${contactHTML}</div>
                    </div>
                    ${section('Professional Summary', data.summary)}
                    <div class="cl-section">
                        <div class="cl-section-title">Education</div>
                        <div class="cl-content">${getStructuredEducationHTML('cl', true)}</div>
                    </div>
                    <div class="cl-section">
                        <div class="cl-section-title">Skills</div>
                        <div class="cl-content">${skillsHTML}</div>
                    </div>
                    ${section('Experience', data.experience)}
                    ${section('Projects', data.projects)}
                    ${section('Certifications', data.certifications)}
                    ${section('Achievements', data.achievements)}
                    ${section('Languages', data.languages)}
                </div>
            `;
            break;
        }
        case 'starter': {
            outputHTML = `
                <div class="st-resume ${densityClass}">
                    <div class="st-header">
                        <div class="st-name">${data.fullName || 'Your Name'}</div>
                        <div class="st-role">${data.targetRole || 'Student'}</div>
                        <div class="st-contact">${contactHTML}</div>
                    </div>
                    <div class="st-divider"></div>
                    ${section('Career Objective', data.summary)}
                    <div class="st-section">
                        <div class="st-section-title">Education</div>
                        <div class="st-content">${getStructuredEducationHTML('st', true)}</div>
                    </div>
                    <div class="st-section">
                        <div class="st-section-title">Skills</div>
                        <div class="st-content">${skillsHTML}</div>
                    </div>
                    ${section('Projects', data.projects)}
                    ${section('Certifications', data.certifications)}
                    ${section('Achievements', data.achievements)}
                    ${section('Languages', data.languages)}
                </div>
            `;
            break;
        }
        case 'technical': {
            const sectionTc = (title, content) => {
                if (!content || !content.trim()) return '';
                return `
                    <div class="tc-section">
                        <div class="tc-section-title"><i class="fas fa-mouse-pointer" style="font-size:0.75rem; transform: rotate(-45deg); margin-right: 8px; color: #0ea5e9;"></i> ${title}</div>
                        <div class="tc-content">${content.replace(/\n/g, '<br>')}</div>
                    </div>
                `;
            };
            outputHTML = `
                <div class="tc-resume ${densityClass}">
                    <div class="tc-header">
                        <div class="tc-name">${data.fullName || 'Your Name'}</div>
                        <div class="tc-role">${data.targetRole || 'Software Engineer'}</div>
                        <div class="tc-contact">${contactHTML}</div>
                    </div>
                    ${sectionTc('Summary', data.summary)}
                    <div class="tc-section">
                        <div class="tc-section-title"><i class="fas fa-mouse-pointer" style="font-size:0.75rem; transform: rotate(-45deg); margin-right: 8px; color: #0ea5e9;"></i> Education</div>
                        <div class="tc-content">${getStructuredEducationHTML('tc', true)}</div>
                    </div>
                    <div class="tc-section">
                        <div class="tc-section-title"><i class="fas fa-mouse-pointer" style="font-size:0.75rem; transform: rotate(-45deg); margin-right: 8px; color: #0ea5e9;"></i> Skills</div>
                        <div class="tc-content">${skillsHTML}</div>
                    </div>
                    ${sectionTc('Experience', data.experience)}
                    ${sectionTc('Projects', data.projects)}
                    ${sectionTc('Certifications', data.certifications)}
                    ${sectionTc('Achievements', data.achievements)}
                    ${sectionTc('Languages', data.languages)}
                </div>
            `;
            break;
        }
        default:
            outputHTML = buildResumeHTML(data, 'modern', isPreview);
            break;
    }

    if (templateId === 'classic') {
        outputHTML = outputHTML.replace(/AI\/ML Club/gi, 'AI/ML Society');
    }

    return outputHTML;
}

// ============================================
// EDIT & APPLY
// ============================================
function applyChanges() {
    const text = els.editTextarea.value;
    state.resumeText = text;
    const parsed = parseResumeText(text);
    state.generatedHTML = buildResumeHTML(parsed, state.formData.selectedTemplate);
    els.resumeSheet.innerHTML = state.generatedHTML;
    showToast('Changes applied successfully!');
}
function resetChanges() {
    els.editTextarea.value = state.resumeText;
    applyChanges();
    showToast('Reset to original version');
}

// ============================================
// ZOOM
// ============================================
function initZoomControls() {
    document.getElementById('zoomIn').addEventListener('click', () => { state.zoom = Math.min(state.zoom + 0.1, 1.5); updateZoom(); });
    document.getElementById('zoomOut').addEventListener('click', () => { state.zoom = Math.max(state.zoom - 0.1, 0.5); updateZoom(); });
    
    document.getElementById('modalZoomIn').addEventListener('click', () => { state.modalZoom = Math.min(state.modalZoom + 0.1, 1.5); updateZoom(); });
    document.getElementById('modalZoomOut').addEventListener('click', () => { state.modalZoom = Math.max(state.modalZoom - 0.1, 0.25); updateZoom(); });
    
    window.addEventListener('resize', () => {
        autoFitZoom();
        if (document.getElementById('templateModal').classList.contains('active')) {
            // Recalculate auto modal zoom on resize
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) {
                const availableWidth = modalBody.clientWidth - 32;
                state.modalZoom = Math.max(0.25, Math.min(availableWidth / 794, 0.95));
            }
            updateZoom();
        }
    });
}
function updateZoom() {
    const viewport = document.getElementById('resumeViewport');
    if (viewport) {
        viewport.style.setProperty('--zoom-factor', state.zoom);
    }
    const modalViewport = document.getElementById('modalResumeViewport');
    if (modalViewport) {
        modalViewport.style.setProperty('--zoom-factor', state.modalZoom);
        const modalZoomLevel = document.getElementById('modalZoomLevel');
        if (modalZoomLevel) {
            modalZoomLevel.textContent = Math.round(state.modalZoom * 100) + '%';
        }
    }
    const zoomEl = els.zoomLevel || document.getElementById('zoomLevel');
    if (zoomEl) {
        zoomEl.textContent = Math.round(state.zoom * 100) + '%';
    }
}
function autoFitZoom() {
    const step4 = document.getElementById('step4');
    if (!step4 || !step4.classList.contains('active')) return; // step4 is preview in scratch (step 5)
    
    // Compute available width based on body or window layout parameters to prevent race conditions during transitions
    const bodyWidth = document.body.clientWidth || window.innerWidth;
    let targetWidth = bodyWidth - 32; // Default padding for mobile
    
    if (bodyWidth > 1200) {
        // Desktop Grid: left column is preview container, right column is editor panel (400px wide + 32px gap)
        const wizardWidth = Math.min(950, bodyWidth - 80);
        targetWidth = wizardWidth - 400 - 32 - 48; // subtract editor panel, gap, and container padding
    } else if (bodyWidth > 768) {
        // Desktop Single Column: preview container occupies full wizard width (max 950px)
        const wizardWidth = Math.min(950, bodyWidth - 80);
        targetWidth = wizardWidth - 48;
    } else {
        // Mobile view: full width minus some small padding
        targetWidth = bodyWidth - 24;
    }
    
    if (targetWidth <= 0) targetWidth = 320;
    
    state.zoom = Math.max(0.25, Math.min(targetWidth / 794, 1.15));
    updateZoom();
}

// ============================================
// DOWNLOAD - Single Source of Truth Export Engine
// ============================================
function initDownloadButtons() {
    document.getElementById('downloadPDF').addEventListener('click', downloadPDF);
    document.getElementById('downloadJPG').addEventListener('click', downloadJPG);
    document.getElementById('downloadTXT').addEventListener('click', downloadTXT);
}

/**
 * Waits until fonts are loaded, all images inside the container are complete,
 * and CSS layout has settled (two rAF ticks).
 */
async function waitForReadyState(container) {
    // 1. Wait for all web fonts to finish loading
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }

    // 2. Wait for all images inside the container
    const images = [...container.querySelectorAll('img')];
    if (images.length > 0) {
        await Promise.all(images.map(img => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; // don't block on broken images
                setTimeout(resolve, 3000); // 3s max timeout per image
            });
        }));
    }

    // 3. Wait for two animation frames so CSS layout is fully settled
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
}

/**
 * Creates an off-screen clone of the resume HTML for export.
 * Uses the SAME HTML string as the preview - single source of truth.
 * Returns { clone, cleanup } where cleanup() removes it from DOM.
 */
function createExportClone(htmlContent) {
    const clone = document.createElement('div');
    clone.className = 'export-clone';
    clone.innerHTML = htmlContent || state.generatedHTML;
    document.body.appendChild(clone);

    // Copy computed density variables from the visible resume sheet
    const visibleSheet = els.resumeSheet;
    if (visibleSheet) {
        const cs = getComputedStyle(visibleSheet.firstElementChild || visibleSheet);
        ['--section-gap', '--item-gap', '--font-scale', '--header-gap', '--line-height', '--padding-scale'].forEach(prop => {
            const val = cs.getPropertyValue(prop);
            if (val) clone.style.setProperty(prop, val);
        });
    }

    return {
        clone,
        cleanup: () => { if (clone.parentNode) clone.parentNode.removeChild(clone); }
    };
}

/**
 * Shared export engine: captures a resume clone as a canvas at its FULL natural
 * height (never clipped to one page). Used by every download button so there is
 * exactly one place that owns capture behavior.
 */
async function captureResumeCanvas(clone, scale) {
    await waitForReadyState(clone);
    
    // Execute Layout Engine Pipeline on export clone
    balanceResumeColumns(clone);
    optimizeVerticalSpacingAndTypography(clone);

    // Validate layout quality
    const valResult = validateResumeLayout(clone);
    if (!valResult.valid && valResult.errors.length > 0) {
        console.warn('Layout Validation Warnings:', valResult.errors);
    }

    const fullHeight = Math.max(clone.scrollHeight, 1123);
    const canvas = await html2canvas(clone, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: fullHeight,
        windowWidth: 794,
        windowHeight: fullHeight,
        logging: false,
        onclone: (doc) => {
            const el = doc.querySelector('.export-clone');
            if (el) {
                el.style.position = 'static';
                el.style.left = '0';
                el.style.top = '0';
                el.style.width = '794px';
                el.style.height = fullHeight + 'px';
                el.style.overflow = 'visible'; // never clip content during capture
            }
        }
    });
    return canvas;
}

/** Slices a captured canvas into correctly-sized A4 pages and saves as PDF. */
function exportCanvasToPDF(canvas, filename) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const totalPxH = canvas.height;
    const pageHeightPx = Math.round(canvas.width * (297 / 210));
    const totalPages = Math.max(1, Math.ceil(totalPxH / pageHeightPx));

    for (let pg = 0; pg < totalPages; pg++) {
        if (pg > 0) pdf.addPage();
        const srcY = pg * pageHeightPx;
        const srcH = Math.min(pageHeightPx, totalPxH - srcY);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = srcH;
        slice.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
        const sliceData = slice.toDataURL('image/png', 1.0);
        const sliceH = (srcH / canvas.width) * pageW;
        pdf.addImage(sliceData, 'PNG', 0, 0, pageW, sliceH);
    }
    pdf.save(filename);
    return totalPages;
}

async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    showToast('Preparing PDFâ€¦');

    const { clone, cleanup } = createExportClone();

    try {
        const canvas = await captureResumeCanvas(clone, 3);
        exportCanvasToPDF(canvas, `${state.formData.personalDetails.fullName || 'Resume'}_Resume.pdf`);
        showToast('PDF downloaded successfully!');
    } catch (err) {
        console.error('PDF generation failed:', err);
        showToast('PDF generation failed. Try JPG instead.');
    } finally {
        cleanup();
    }
}

async function downloadJPG() {
    showToast('Preparing JPGâ€¦');
    const { clone, cleanup } = createExportClone();

    try {
        const canvas = await captureResumeCanvas(clone, 2);
        // JPG is a single image, so multi-page content is captured as one tall image
        // (nothing is cropped) rather than split into pages - PDF handles real pagination.
        if (canvas.height > 1123 * 2 * 1.03) { // canvas is captured at scale 2, so compare against scaled page height
            showToast('Resume spans multiple pages - JPG will be one tall image. Use PDF for paginated pages.');
        }
        const link = document.createElement('a');
        link.download = `${state.formData.personalDetails.fullName || 'Resume'}_Resume.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
        showToast('JPG downloaded successfully!');
    } catch (err) {
        console.error('JPG generation failed:', err);
        showToast('JPG generation failed.');
    } finally {
        cleanup();
    }
}

function downloadTXT() {
    const blob = new Blob([state.resumeText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `${state.formData.personalDetails.fullName || 'Resume'}_Resume.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    showToast('TXT downloaded successfully!');
}

// ============================================
// RESET
// ============================================
function resetBuilder() {
    state.currentStep = 1;
    state.flow = 'scratch';
    state.formData = { year: '', purpose: '', experienceLevel: '', clubCategory: '', clubName: '', personalDetails: {}, targetRole: '', skills: [], categoryFields: {}, selectedTemplate: 'modern' };
    state.resumeText = ''; state.generatedHTML = ''; state.zoom = 1; state.photoDataUrl = '';
    document.querySelectorAll('.inp').forEach(inp => inp.value = '');
    if (els.clubCategory) els.clubCategory.value = '';
    document.querySelectorAll('.quiz-opt').forEach(btn => btn.classList.remove('active'));
    els.skillsTags.innerHTML = '';
    els.photoImg.src = ''; els.photoImg.style.display = 'none';
    els.photoInitials.style.display = 'flex'; els.photoInitials.textContent = '?';
    Object.values(els.dynamicFields).forEach(el => el.classList.add('hidden'));
    els.campusClubFields.classList.add('hidden');
    selectTemplate('modern');
    updateZoom(); updateStepper();

    // Show choice panel, hide everything else
    document.getElementById('choicePanel')?.classList.remove('hidden');
    document.getElementById('uploadPanel')?.classList.add('hidden');
    document.getElementById('mainStepper')?.classList.add('hidden');
    document.getElementById('skillGap')?.classList.add('hidden');
    document.getElementById('resumeEnhanceSection')?.classList.add('hidden');
    els.wizardSteps.forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });

    // Reset upload panel state
    const pdfDropZone = document.getElementById('pdfDropZone');
    const uploadStatus = document.getElementById('uploadStatus');
    if (pdfDropZone) pdfDropZone.style.display = 'flex';
    if (uploadStatus) uploadStatus.style.display = 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Ready to build a new resume! ');
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.remove('active');
        }
    });

    menu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => menu.classList.remove('active'));
    });

    // Skill Gap Analyser direct link handler (navbar & mobile drawer)
    const triggerSkillGap = () => {
        menu.classList.remove('active');
        const role = state.formData.targetRole || 'Software Engineer';
        showSkillGapSection(role, 'scratch');
    };

    const mlSkillGap = document.getElementById('mlSkillGap');
    if (mlSkillGap) mlSkillGap.addEventListener('click', triggerSkillGap);

    const navSkillGapBtn = document.getElementById('navSkillGapBtn');
    if (navSkillGapBtn) navSkillGapBtn.addEventListener('click', triggerSkillGap);
}

// ============================================
// TOAST
// ============================================
function showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.style.cssText = `position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(120px);background:#0f172a;color:white;padding:16px 32px;border-radius:16px;font-size:0.92rem;font-weight:700;z-index:9999;opacity:0;transition:all 0.4s cubic-bezier(0.4,0,0.2,1);box-shadow:0 12px 40px rgba(0,0,0,0.25);white-space:nowrap;border:1px solid rgba(255,255,255,0.08);`;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(120px)'; }, 3000);
}

// ============================================
// NAVBAR SCROLL
// ============================================
function initNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)';
            navbar.style.background = 'rgba(255,255,255,0.95)';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.background = 'rgba(255,255,255,0.85)';
        }
    });
}

// ============================================
// AI ENHANCE RESUME FEATURE
// ============================================
function initAIEnhance() {
    const enhanceFullBtn = document.getElementById('enhanceFullBtn');

    // Section enhance buttons in scratch step 4 (no data-target="enh")
    document.querySelectorAll('.enhance-btn:not([data-target="enh"])').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            await enhanceSection(btn.dataset.section, btn);
        });
    });

    if (enhanceFullBtn) {
        enhanceFullBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await enhanceFullResume(enhanceFullBtn);
        });
    }
}

function serializeResumeData(data) {
    let text = '';
    text += `NAME\n${data.fullName || ''}\n\n`;
    text += `CONTACT\n`;
    if (data.email) text += `Email: ${data.email}\n`;
    if (data.phone) text += `Phone: ${data.phone}\n`;
    if (data.location) text += `Location: ${data.location}\n`;
    if (data.linkedin) text += `LinkedIn: ${data.linkedin}\n`;
    if (data.github) text += `GitHub: ${data.github}\n`;
    if (data.languages) text += `Languages: ${data.languages}\n`;
    text += `\n`;

    if (data.summary) text += `PROFESSIONAL SUMMARY\n${data.summary}\n\n`;
    if (data.education) text += `EDUCATION\n${data.education}\n\n`;
    if (data.skills && data.skills.length > 0) text += `SKILLS\n${data.skills.join(', ')}\n\n`;
    else if (data.skillsText) text += `SKILLS\n${data.skillsText}\n\n`;
    if (data.projects) text += `PROJECTS\n${data.projects}\n\n`;
    if (data.experience) text += `EXPERIENCE\n${data.experience}\n\n`;
    if (data.certifications) text += `CERTIFICATIONS\n${data.certifications}\n\n`;
    if (data.achievements) text += `ACHIEVEMENTS\n${data.achievements}\n\n`;
    if (data.references) text += `REFERENCES\n${data.references}\n\n`;
    return text.trim() + '\n';
}

async function enhanceSection(sectionKey, btn) {
    const currentText = els.editTextarea.value.trim();
    if (!currentText) {
        showToast('Please type or upload a resume first.');
        return;
    }
    const parsed = parseResumeText(currentText);
    
    // Find text for this section
    let sectionVal = '';
    let label = '';
    if (sectionKey === 'summary') { sectionVal = parsed.summary || ''; label = 'Summary'; }
    else if (sectionKey === 'experience') { sectionVal = parsed.experience || ''; label = 'Experience'; }
    else if (sectionKey === 'projects') { sectionVal = parsed.projects || ''; label = 'Projects'; }
    else if (sectionKey === 'achievements') { sectionVal = parsed.achievements || ''; label = 'Achievements'; }
    else if (sectionKey === 'certifications') { sectionVal = parsed.certifications || ''; label = 'Certifications'; }
    else if (sectionKey === 'skills') { sectionVal = parsed.skills ? parsed.skills.join(', ') : (parsed.skillsText || ''); label = 'Skills'; }

    if (!sectionVal) {
        showToast(`No content found in ${label} section to enhance.`);
        return;
    }

    btn.disabled = true;
    const oldHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enhancing...';
    els.aiGeneratingPopup.classList.add('active');

    let prompt = '';
    if (sectionKey === 'skills') {
        prompt = `You are a professional resume writer. Format, optimize, and expand this comma-separated list of skills for maximum ATS compatibility: "${sectionVal}". Add 2-3 relevant high-value industry-standard technical skills if applicable. Return ONLY the improved skills as a comma-separated list. No intro, no formatting, no conversational text.`;
    } else {
        prompt = `You are a professional resume writer. Enhance the following resume "${label}" section to sound highly professional, metrics-driven (where possible), grammatically perfect, and optimized for ATS keywords:\n\n"${sectionVal}"\n\nDo NOT invent new qualifications, companies, or credentials. Keep the core details exactly the same. Return ONLY the enhanced content, with no introductory text, conversational filler, markdown formatting, or headers.`;
    }

    try {
        const response = await fetch('/api/ai-write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: sectionKey, context: prompt })
        });
        if (!response.ok) throw new Error('API failed');
        const resData = await response.json();
        const enhancedText = resData.content;

        if (sectionKey === 'skills') {
            parsed.skillsText = enhancedText;
            parsed.skills = enhancedText.split(/[,\n]+/).map(s => s.trim()).filter(s => s);
        } else {
            parsed[sectionKey] = enhancedText;
        }

        const serialized = serializeResumeData(parsed);
        els.editTextarea.value = serialized;
        state.resumeText = serialized;
        applyChanges();
        showToast(`Enhanced ${label} section successfully!`);
    } catch (e) {
        console.error(e);
        showToast(`Failed to enhance ${label} section.`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = oldHtml;
        els.aiGeneratingPopup.classList.remove('active');
    }
}

async function enhanceFullResume(btn) {
    const currentText = els.editTextarea.value.trim();
    if (!currentText) {
        showToast('Please type or upload a resume first.');
        return;
    }

    btn.disabled = true;
    const oldHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enhancing Full Resume...';
    els.aiGeneratingPopup.classList.add('active');

    const prompt = `You are an expert resume writer. The user has provided their complete resume text below. Please rewrite and enhance the entire resume. Improve the vocabulary, sentence structures, professional impact, and optimize it heavily for ATS systems. Do NOT invent fake companies, credentials, or achievements. Keep all name, contact details, and dates exactly as they are. Return ONLY the enhanced resume text using the exact same section headers (e.g. NAME, CONTACT, PROFESSIONAL SUMMARY, EDUCATION, SKILLS, PROJECTS, EXPERIENCE, CERTIFICATIONS, ACHIEVEMENTS, REFERENCES) with a blank line after each section header. Do not add any conversational remarks, introductions, or markdown formatting outside of plain text.\n\nHere is the resume to enhance:\n\n${currentText}`;

    try {
        const response = await fetch('/api/ai-write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: 'fullResume', context: prompt })
        });
        if (!response.ok) throw new Error('API failed');
        const resData = await response.json();
        const enhancedText = resData.content;

        els.editTextarea.value = enhancedText;
        state.resumeText = enhancedText;
        applyChanges();
        showToast('Full resume enhanced successfully! ');
    } catch (e) {
        console.error(e);
        showToast('Failed to enhance full resume.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = oldHtml;
        els.aiGeneratingPopup.classList.remove('active');
    }
}

// ============================================
// SKILL GAP ANALYSER FEATURE
// ============================================
const roleSkillsMap = {
    'software engineer': ['Git', 'Java', 'Python', 'C++', 'Data Structures', 'Algorithms', 'System Design', 'SQL', 'OOP'],
    'frontend developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Tailwind CSS', 'TypeScript', 'Git', 'Webpack', 'REST APIs'],
    'backend developer': ['Node.js', 'Express', 'Python', 'Java', 'SQL', 'MongoDB', 'REST APIs', 'System Design', 'Git', 'Docker', 'Redis'],
    'full stack developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'SQL', 'MongoDB', 'Git', 'Docker', 'REST APIs'],
    'machine learning engineer': ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'SQL', 'Numpy', 'Pandas', 'Scikit-Learn', 'Git'],
    'data scientist': ['Python', 'SQL', 'R', 'Machine Learning', 'Statistics', 'Pandas', 'Numpy', 'Data Visualization', 'Tableau', 'Git'],
    'cybersecurity analyst': ['Linux', 'Networking', 'Firewalls', 'SIEM', 'Cryptography', 'Penetration Testing', 'Incident Response', 'Wireshark', 'Python'],
    'product manager': ['Product Strategy', 'Agile Methodologies', 'User Research', 'Data Analysis', 'Roadmapping', 'Jira', 'SQL', 'A/B Testing'],
    'ui/ux designer': ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'UI Design', 'Interaction Design', 'Adobe XD', 'HTML', 'CSS'],
    'data analyst': ['SQL', 'Excel', 'Python', 'Pandas', 'Tableau', 'Power BI', 'Statistics', 'Data Visualization', 'Data Cleaning'],
    'video editor': ['Adobe Premiere Pro', 'DaVinci Resolve', 'Color Grading', 'Audio Mixing', 'Motion Graphics', 'After Effects', 'Storytelling', 'Video Compression', 'Final Cut Pro'],
    'video editing': ['Adobe Premiere Pro', 'DaVinci Resolve', 'Color Grading', 'Audio Mixing', 'Motion Graphics', 'After Effects', 'Storytelling', 'Video Compression', 'Final Cut Pro'],
    'graphic designer': ['Adobe Photoshop', 'Adobe Illustrator', 'Typography', 'Color Theory', 'Branding', 'Figma', 'Layout Design', 'Canva'],
    'photographer': ['Photo Composition', 'Lightroom', 'Photoshop', 'Lighting', 'Camera Operation', 'Photo Retouching'],
    'content writer': ['SEO Writing', 'Copywriting', 'Content Strategy', 'Editing & Proofreading', 'Research', 'WordPress'],
    'digital marketer': ['SEO', 'Google Ads', 'Meta Ads', 'Content Marketing', 'Email Marketing', 'Analytics', 'Social Media Strategy'],
    'social media manager': ['Content Calendar Planning', 'Canva', 'Copywriting', 'Analytics', 'Community Management', 'Paid Ads Basics'],
    'motion graphics designer': ['After Effects', 'Cinema 4D', 'Animation Principles', 'Adobe Premiere Pro', 'Typography', 'Storyboarding'],
    'animator': ['After Effects', 'Blender', 'Storyboarding', 'Animation Principles', 'Character Rigging']
};

const commonSkillsList = [
    'Python', 'Java', 'C++', 'C#', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'React', 'Angular', 'Vue', 'Node.js', 'Express',
    'Django', 'Flask', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'GitHub',
    'CI/CD', 'Linux', 'Data Structures', 'Algorithms', 'System Design', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
    'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Pandas', 'Numpy', 'Tableau', 'Power BI', 'Excel', 'Figma', 'Agile', 'Scrum', 'DevOps'
];

const courseRecommendations = {
    'python': [
        { name: 'Python Tutorial for Beginners â€“ CodeWithHarry (Hindi)', platform: 'YouTube', rating: '8M+ views', url: 'https://www.youtube.com/watch?v=gfDE2a7MKjA', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'Python Full Course â€“ Apna College (Hindi)', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/watch?v=ERCMXc8x7mc', price: 'Free', ytChannel: 'Apna College' },
        { name: '100 Days of Code: Python Bootcamp', platform: 'Udemy', rating: '4.7 ★ (180k reviews)', url: 'https://www.udemy.com/course/100-days-of-code/', price: 'Top Rated' },
        { name: 'Python for Everybody â€“ Dr. Chuck', platform: 'Coursera', rating: '4.8 ★ (220k reviews)', url: 'https://www.coursera.org/specializations/python', price: 'Free to Audit' }
    ],
    'javascript': [
        { name: 'Namaste JavaScript â€“ Akshay Saini (Hindi/English)', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP', price: 'Free', ytChannel: 'Akshay Saini' },
        { name: 'JavaScript Tutorial â€“ CodeWithHarry (Hindi)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/watch?v=hKB-YGF14SY', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'The Complete JavaScript Course 2025', platform: 'Udemy', rating: '4.7 ★ (190k reviews)', url: 'https://www.udemy.com/course/the-complete-javascript-course/', price: 'Top Rated' }
    ],
    'typescript': [
        { name: 'TypeScript Full Course â€“ Hitesh Choudhary (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=30LWjhZzg50', price: 'Free', ytChannel: 'Chai aur Code' },
        { name: 'TypeScript Tutorial â€“ CodeWithHarry (Hindi)', platform: 'YouTube', rating: '800k+ views', url: 'https://www.youtube.com/watch?v=GinmHZ1jGBk', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'Understanding TypeScript', platform: 'Udemy', rating: '4.7 ★ (60k reviews)', url: 'https://www.udemy.com/course/understanding-typescript/', price: 'Best Seller' }
    ],
    'react': [
        { name: 'React JS Full Course â€“ Hitesh Choudhary (Hindi)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige', price: 'Free', ytChannel: 'Chai aur Code' },
        { name: 'React JS â€“ CodeWithHarry (Hindi)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=RGKi6LSPDLU', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'React â€“ Thapa Technical (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=fOFVGCNxhEA', price: 'Free', ytChannel: 'Thapa Technical' },
        { name: 'React - The Complete Guide', platform: 'Udemy', rating: '4.6 ★ (150k reviews)', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', price: 'Best Seller' }
    ],
    'angular': [
        { name: 'Angular Tutorial â€“ Thapa Technical (Hindi)', platform: 'YouTube', rating: '1.5M+ views', url: 'https://www.youtube.com/playlist?list=PLwGdqUZWnOp3Vqf1n8QjRMhqwM-j7HGkQ', price: 'Free', ytChannel: 'Thapa Technical' },
        { name: 'Angular â€“ The Complete Guide', platform: 'Udemy', rating: '4.6 ★ (80k reviews)', url: 'https://www.udemy.com/course/the-complete-guide-to-angular-2/', price: 'Best Seller' }
    ],
    'vue': [
        { name: 'Vue JS Crash Course â€“ Traversy Media', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/watch?v=Wy9q22isx3U', price: 'Free', ytChannel: 'Traversy Media' },
        { name: 'Vue - The Complete Guide', platform: 'Udemy', rating: '4.7 ★ (65k reviews)', url: 'https://www.udemy.com/course/vuejs-2-the-complete-guide/', price: 'Best Seller' }
    ],
    'node.js': [
        { name: 'Node.js Tutorial â€“ Sheryians Coding School (Hindi)', platform: 'YouTube', rating: '1.5M+ views', url: 'https://www.youtube.com/watch?v=y18ubz7gOsQ', price: 'Free', ytChannel: 'Sheryians Coding School' },
        { name: 'Node.js Backend â€“ Hitesh Choudhary (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_NS-ZAh6Rl8CIvX3', price: 'Free', ytChannel: 'Chai aur Code' },
        { name: 'NodeJS â€“ The Complete Guide', platform: 'Udemy', rating: '4.7 ★ (100k reviews)', url: 'https://www.udemy.com/course/nodejs-the-complete-guide/', price: 'Best Seller' }
    ],
    'mongodb': [
        { name: 'MongoDB Tutorial â€“ CodeWithHarry (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=oSIv-E60NiU', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'MongoDB â€“ The Complete Developer Guide', platform: 'Udemy', rating: '4.6 ★ (45k reviews)', url: 'https://www.udemy.com/course/mongodb-the-complete-developers-guide/', price: 'Best Seller' }
    ],
    'django': [
        { name: 'Django Full Course â€“ CodeWithHarry (Hindi)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/watch?v=JxzZxdht-XY', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'Python Django â€“ The Practical Guide', platform: 'Udemy', rating: '4.7 ★ (25k reviews)', url: 'https://www.udemy.com/course/python-django-the-practical-guide/', price: 'Best Seller' }
    ],
    'flask': [
        { name: 'Flask Tutorial â€“ CodeWithHarry (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=oA8brF3w5XQ', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'REST APIs with Flask & Python', platform: 'Udemy', rating: '4.7 ★ (30k reviews)', url: 'https://www.udemy.com/course/rest-api-flask-and-python/', price: 'Best Seller' }
    ],
    'machine learning': [
        { name: 'Machine Learning â€“ CampusX (Hindi)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=ZftI2fEz0Fw', price: 'Free', ytChannel: 'CampusX' },
        { name: 'ML Tutorial â€“ codebasics (Hindi/English)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/playlist?list=PLeo1K3hjS3uvCeTYTeyfe0-rN5r8zn9rw', price: 'Free', ytChannel: 'codebasics' },
        { name: 'Machine Learning Specialization â€“ Andrew Ng', platform: 'Coursera', rating: '4.9 ★ (340k reviews)', url: 'https://www.coursera.org/specializations/machine-learning-introduction', price: 'Top Recommended' }
    ],
    'deep learning': [
        { name: 'Deep Learning â€“ CampusX (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=1VSZtNYMntM', price: 'Free', ytChannel: 'CampusX' },
        { name: 'Deep Learning Specialization â€“ Andrew Ng', platform: 'Coursera', rating: '4.9 ★ (150k reviews)', url: 'https://www.coursera.org/specializations/deep-learning', price: 'Top Recommended' }
    ],
    'data science': [
        { name: 'Data Science Full Course â€“ CampusX (Hindi)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/playlist?list=PLKnIA16_RmvbAlyx4_rdtR66B7EHX5k3z', price: 'Free', ytChannel: 'CampusX' },
        { name: 'Data Science â€“ codebasics (Hindi/English)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=3xw3SnFBRNs', price: 'Free', ytChannel: 'codebasics' },
        { name: 'Data Science A-Z', platform: 'Udemy', rating: '4.6 ★ (110k reviews)', url: 'https://www.udemy.com/course/datascience/', price: 'Best Seller' }
    ],
    'data structures': [
        { name: 'DSA Series â€“ Striver/TakeUForward (Hindi/English)', platform: 'YouTube', rating: '6M+ views', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz', price: 'Free', ytChannel: 'take U forward' },
        { name: 'DSA in Java â€“ Kunal Kushwaha (Hindi/English)', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ', price: 'Free', ytChannel: 'Kunal Kushwaha' },
        { name: 'DSA â€“ Love Babbar (Hindi)', platform: 'YouTube', rating: '4M+ views', url: 'https://www.youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA', price: 'Free', ytChannel: 'Love Babbar' },
        { name: 'Master DSA: Interview Prep', platform: 'Udemy', rating: '4.7 ★ (85k reviews)', url: 'https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/', price: 'Best Seller' }
    ],
    'algorithms': [
        { name: 'Algorithms â€“ Abdul Bari (English)', platform: 'YouTube', rating: '10M+ views', url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O', price: 'Free', ytChannel: 'Abdul Bari' },
        { name: 'Algorithms Specialization â€“ Stanford', platform: 'Coursera', rating: '4.8 ★ (35k reviews)', url: 'https://www.coursera.org/specializations/algorithms', price: 'Free to Audit' }
    ],
    'system design': [
        { name: 'System Design â€“ Gaurav Sen (English)', platform: 'YouTube', rating: '4M+ views', url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX', price: 'Free', ytChannel: 'Gaurav Sen' },
        { name: 'System Design â€“ Shrayansh Jain (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=0163cssUxLA', price: 'Free', ytChannel: 'Shrayansh Jain' },
        { name: 'System Design Interview Guide', platform: 'Udemy', rating: '4.6 ★ (15k reviews)', url: 'https://www.udemy.com/course/system-design-interview-guide/', price: 'Highly Rated' }
    ],
    'sql': [
        { name: 'SQL Tutorial â€“ CodeWithHarry (Hindi)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=hlGoQC332VM', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'SQL Full Course â€“ Apna College (Hindi)', platform: 'YouTube', rating: '1.5M+ views', url: 'https://www.youtube.com/watch?v=7S_tz1z_5bA', price: 'Free', ytChannel: 'Apna College' },
        { name: 'The Complete SQL Bootcamp', platform: 'Udemy', rating: '4.7 ★ (170k reviews)', url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/', price: 'Best Seller' }
    ],
    'git': [
        { name: 'Git & GitHub â€“ Kunal Kushwaha (Hindi/English)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/watch?v=apGV9Kg7ics', price: 'Free', ytChannel: 'Kunal Kushwaha' },
        { name: 'Git & GitHub Tutorial â€“ CodeWithHarry (Hindi)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=gwWKnnCMQ5c', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'Git & GitHub Complete Guide', platform: 'Udemy', rating: '4.7 ★ (45k reviews)', url: 'https://www.udemy.com/course/git-and-github-complete-guide/', price: 'Best Seller' }
    ],
    'docker': [
        { name: 'Docker Tutorial â€“ Abhishek Veeramalla (Hindi/English)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/playlist?list=PLdpzxOOAlwvIKMjOl0YEzAa9VhMusFnFt', price: 'Free', ytChannel: 'Abhishek Veeramalla' },
        { name: 'Docker Tutorial â€“ TechWorld with Nana', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE', price: 'Free', ytChannel: 'TechWorld with Nana' },
        { name: 'Docker & Kubernetes: The Practical Guide', platform: 'Udemy', rating: '4.8 ★ (65k reviews)', url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', price: 'Best Seller' }
    ],
    'kubernetes': [
        { name: 'Kubernetes â€“ Abhishek Veeramalla (Hindi/English)', platform: 'YouTube', rating: '1.5M+ views', url: 'https://www.youtube.com/playlist?list=PLdpzxOOAlwvIKMjOl0YEzAa9VhMusFnFt', price: 'Free', ytChannel: 'Abhishek Veeramalla' },
        { name: 'Kubernetes â€“ TechWorld with Nana', platform: 'YouTube', rating: '4M+ views', url: 'https://www.youtube.com/watch?v=X48VuDVv0do', price: 'Free', ytChannel: 'TechWorld with Nana' },
        { name: 'CKA with Practice Tests', platform: 'Udemy', rating: '4.8 ★ (80k reviews)', url: 'https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/', price: 'Best Seller' }
    ],
    'devops': [
        { name: 'DevOps Zero to Hero â€“ Abhishek Veeramalla (Hindi/English)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/playlist?list=PLdpzxOOAlwvIKMjOl0YEzAa9VhMusFnFt', price: 'Free', ytChannel: 'Abhishek Veeramalla' },
        { name: 'DevOps Bootcamp â€“ TrainWithShubham (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=0Gh6kQSmUTE', price: 'Free', ytChannel: 'TrainWithShubham' },
        { name: 'DevOps Beginners to Advanced', platform: 'Udemy', rating: '4.7 ★ (35k reviews)', url: 'https://www.udemy.com/course/decodingdevops/', price: 'Best Seller' }
    ],
    'aws': [
        { name: 'AWS Zero to Hero â€“ Abhishek Veeramalla (Hindi/English)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/playlist?list=PLdpzxOOAlwvIKMjOl0YEzAa9VhMusFnFt', price: 'Free', ytChannel: 'Abhishek Veeramalla' },
        { name: 'AWS Tutorial â€“ Intellipaat (Hindi)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=k1RI5locZE4', price: 'Free', ytChannel: 'Intellipaat' },
        { name: 'Ultimate AWS Cloud Practitioner', platform: 'Udemy', rating: '4.7 ★ (140k reviews)', url: 'https://www.udemy.com/course/aws-certified-cloud-practitioner-new/', price: 'Top Rated' }
    ],
    'networking': [
        { name: 'Computer Networks â€“ Gate Smashers (Hindi)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_', price: 'Free', ytChannel: 'Gate Smashers' },
        { name: 'Networking Full Course â€“ Kunal Kushwaha (Hindi/English)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=IPvYjXCsTg8', price: 'Free', ytChannel: 'Kunal Kushwaha' }
    ],
    'c++': [
        { name: 'C++ Full Course â€“ CodeWithHarry (Hindi)', platform: 'YouTube', rating: '8M+ views', url: 'https://www.youtube.com/watch?v=j8nAHeVKL08', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'C++ Tutorial â€“ Apna College (Hindi)', platform: 'YouTube', rating: '4M+ views', url: 'https://www.youtube.com/watch?v=z9bZufPHFLU', price: 'Free', ytChannel: 'Apna College' },
        { name: 'DSA in C++ â€“ Love Babbar (Hindi)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA', price: 'Free', ytChannel: 'Love Babbar' }
    ],
    'java': [
        { name: 'Java Full Course â€“ CodeWithHarry (Hindi)', platform: 'YouTube', rating: '7M+ views', url: 'https://www.youtube.com/watch?v=UmnCZ7-9yDY', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'Java Full Course â€“ Kunal Kushwaha (Hindi/English)', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/watch?v=rZ41y93P2Qo', price: 'Free', ytChannel: 'Kunal Kushwaha' },
        { name: 'Java Masterclass', platform: 'Udemy', rating: '4.7 ★ (120k reviews)', url: 'https://www.udemy.com/course/java-the-complete-java-developer-course/', price: 'Best Seller' }
    ],
    'html': [
        { name: 'HTML & CSS Full Course â€“ CodeWithHarry (Hindi)', platform: 'YouTube', rating: '10M+ views', url: 'https://www.youtube.com/watch?v=BsDoLVMnmZs', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'HTML Full Course â€“ Sheryians Coding School (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=k7ELO356Npo', price: 'Free', ytChannel: 'Sheryians Coding School' }
    ],
    'css': [
        { name: 'CSS Full Course â€“ CodeWithHarry (Hindi)', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/watch?v=Edsxf_NBFrw', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'CSS Flexbox & Grid â€“ Sheryians Coding School (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=jDDaOFr9nqQ', price: 'Free', ytChannel: 'Sheryians Coding School' }
    ],
    'tensorflow': [
        { name: 'TensorFlow â€“ CampusX (Hindi)', platform: 'YouTube', rating: '500k+ views', url: 'https://www.youtube.com/watch?v=Mubj_fqiAv8', price: 'Free', ytChannel: 'CampusX' },
        { name: 'TensorFlow 2 & Keras â€“ Daniel Bourke', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=tpCFfeUEGs8', price: 'Free', ytChannel: 'Daniel Bourke' }
    ],
    'figma': [
        { name: 'Figma UI/UX Design â€“ DesignCourse', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/watch?v=jwCmIBJ8Jtc', price: 'Free', ytChannel: 'DesignCourse' },
        { name: 'UI/UX â€“ Figma Masterclass', platform: 'Udemy', rating: '4.6 ★ (50k reviews)', url: 'https://www.udemy.com/course/learn-figma/', price: 'Best Seller' }
    ],
    'excel': [
        { name: 'Excel Tutorial â€“ Trump Excel (English)', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/watch?v=Vl0H-qTclOg', price: 'Free', ytChannel: 'Trump Excel' },
        { name: 'Microsoft Excel â€“ Zero to Hero', platform: 'Udemy', rating: '4.6 ★ (140k reviews)', url: 'https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/', price: 'Best Seller' }
    ],
    'power bi': [
        { name: 'Power BI Tutorial â€“ codebasics (Hindi/English)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/playlist?list=PLeo1K3hjS3uva8pk1FI3iK9kCOOS2bHIH', price: 'Free', ytChannel: 'codebasics' },
        { name: 'Microsoft Power BI Desktop', platform: 'Udemy', rating: '4.6 ★ (85k reviews)', url: 'https://www.udemy.com/course/microsoft-power-bi-up-running-with-power-bi-desktop/', price: 'Best Seller' }
    ],
    'tableau': [
        { name: 'Tableau Full Course â€“ Simplilearn (English)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=TPMlZxRRaBQ', price: 'Free', ytChannel: 'Simplilearn' },
        { name: 'Tableau Training', platform: 'Udemy', rating: '4.5 ★ (50k reviews)', url: 'https://www.udemy.com/course/tableau10/', price: 'Best Seller' }
    ],
    'communication': [
        { name: 'Spoken English â€“ Dhruv Rathee (Hindi)', platform: 'YouTube', rating: '4M+ views', url: 'https://www.youtube.com/watch?v=FSl0hU6iFac', price: 'Free', ytChannel: 'Dhruv Rathee' },
        { name: 'Public Speaking â€“ TED on Coursera', platform: 'Coursera', rating: '4.8 ★ (30k reviews)', url: 'https://www.coursera.org/learn/public-speaking', price: 'Free to Audit' }
    ],
    'leadership': [
        { name: 'Leadership & Management â€“ Great Learning (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=N0RKHSt5MCw', price: 'Free', ytChannel: 'Great Learning' },
        { name: 'Leadership Development Specialization', platform: 'Coursera', rating: '4.8 ★ (50k reviews)', url: 'https://www.coursera.org/specializations/leadership-development-for-engineers', price: 'Free to Audit' }
    ],
    'marketing': [
        { name: 'Digital Marketing Full Course â€“ Google Digital Garage', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/watch?v=VoX97altFMg', price: 'Free', ytChannel: 'Google Digital Garage' },
        { name: 'Digital Marketing Masterclass', platform: 'Udemy', rating: '4.5 ★ (100k reviews)', url: 'https://www.udemy.com/course/digital-marketing-masterclass-course/', price: 'Best Seller' }
    ]
};

let currentGapAnalysis = {
    role: '',
    missing: [],
    matched: []
};

function initSkillGap() {
    const runGapBtn = document.getElementById('runGapBtn');
    const generateRoadmapBtn = document.getElementById('generateRoadmapBtn');
    const gapBackBtn = document.getElementById('gapBackBtn');
    const gapProceedBtn = document.getElementById('gapProceedBtn');

    if (runGapBtn) {
        runGapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            runGapAnalysis();
        });
    }

    if (generateRoadmapBtn) {
        generateRoadmapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            generateAIRoadmap();
        });
    }

    if (gapBackBtn) {
        gapBackBtn.addEventListener('click', () => {
            document.getElementById('skillGap').classList.add('hidden');
            if (state.flow === 'upload') {
                document.getElementById('uploadPanel').classList.remove('hidden');
                window.scrollTo({ top: document.getElementById('builder').offsetTop - 80, behavior: 'smooth' });
            } else {
                // Scratch: close skill gap modal, return to step 4 preview
                closeSkillGapModal();
            }
        });
    }

    if (gapProceedBtn) {
        gapProceedBtn.addEventListener('click', () => {
            document.getElementById('skillGap').classList.add('hidden');
            if (state.flow === 'upload') {
                showResumeEnhanceSection();
            } else {
                closeSkillGapModal();
            }
        });
    }
}

// Show Skill Gap section
// - upload flow: full page section
// - scratch flow: modal overlay on top of step 4 preview
function showSkillGapSection(targetRole, flow) {
    state.flow = flow || 'scratch';

    const skillGap = document.getElementById('skillGap');
    document.getElementById('gapResults').style.display = 'none';

    if (targetRole) {
        document.getElementById('gapRoleInput').value = targetRole;
    }

    if (state.flow === 'upload') {
        // Upload flow: full-page section
        document.getElementById('choicePanel')?.classList.add('hidden');
        document.getElementById('uploadPanel')?.classList.add('hidden');
        document.getElementById('resumeEnhanceSection')?.classList.add('hidden');
        document.getElementById('mainStepper')?.classList.add('hidden');
        els.wizardSteps.forEach(el => { el.classList.remove('active'); el.classList.add('hidden'); });
        skillGap.classList.remove('hidden');
        skillGap.classList.remove('skill-gap-modal');
        window.scrollTo({ top: skillGap.offsetTop - 80, behavior: 'smooth' });
    } else {
        // Scratch flow: show as overlay modal on top of builder section
        skillGap.classList.remove('hidden');
        skillGap.classList.add('skill-gap-modal');
        window.scrollTo({ top: skillGap.offsetTop - 80, behavior: 'smooth' });
    }

    showToast('Skill Gap Analyser ready! Enter your target role and click Analyse. ');
}

// Close skill gap modal (scratch flow) - return to step 4 preview
function closeSkillGapModal() {
    const skillGap = document.getElementById('skillGap');
    skillGap.classList.add('hidden');
    skillGap.classList.remove('skill-gap-modal');
    // Scroll back to preview step
    window.scrollTo({ top: document.getElementById('builder').offsetTop - 100, behavior: 'smooth' });
}

async function runGapAnalysis() {
    const roleInput = document.getElementById('gapRoleInput').value.trim();
    const jdInput = document.getElementById('gapJdInput').value.trim();
    const runBtn = document.getElementById('runGapBtn');

    if (!roleInput) {
        showToast('Please enter a target job role.');
        return;
    }

    // Determine target required skills
    let reqSkills = [];
    const matchedRole = Object.keys(roleSkillsMap).find(k => roleInput.toLowerCase().includes(k) || k.includes(roleInput.toLowerCase()));
    if (matchedRole) {
        reqSkills = [...roleSkillsMap[matchedRole]];
    } else {
        // Role isn't in our hardcoded map (e.g. "Wedding Videographer",
        // "Podcast Editor") - ask the AI for the right skills for THIS
        // specific role instead of assuming it's a software job.
        const origBtnHTML = runBtn.innerHTML;
        runBtn.disabled = true;
        runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analysing role...';
        try {
            const resp = await fetch('/api/role-skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: roleInput })
            });
            if (resp.ok) {
                const data = await resp.json();
                reqSkills = data.skills || [];
            }
        } catch (e) {
            console.error('role-skills fetch failed', e);
        }
        runBtn.disabled = false;
        runBtn.innerHTML = origBtnHTML;

        // Only if the AI lookup genuinely failed (offline / no API key) do we
        // fall back to a generic list - and we say so, rather than pretending
        // it's role-specific.
        if (reqSkills.length === 0) {
            reqSkills = ['Communication', 'Problem Solving', 'Project Management', 'Adaptability', 'Time Management'];
            showToast('Could not fetch AI-matched skills for this role - showing generic core skills instead.');
        }
    }

    // Extract skills from JD if provided
    if (jdInput) {
        commonSkillsList.forEach(s => {
            const rx = new RegExp('\\b' + s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
            if (rx.test(jdInput) && !reqSkills.some(x => x.toLowerCase() === s.toLowerCase())) {
                reqSkills.push(s);
            }
        });
    }

    // Get current candidate skills: from state (scratch flow) or parsed textarea (upload flow)
    let userSkills = [];
    if (state.flow === 'scratch' && state.formData.skills && state.formData.skills.length > 0) {
        userSkills = state.formData.skills;
    } else {
        const currentText = els.editTextarea.value || state.resumeText || '';
        const parsed = parseResumeText(currentText);
        userSkills = parsed.skills || state.formData.skills || [];
    }

    // Intersect and find gaps
    const matched = [];
    const missing = [];

    reqSkills.forEach(s => {
        const isMatched = userSkills.some(us => us.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(us.toLowerCase()));
        if (isMatched) {
            matched.push(s);
        } else {
            missing.push(s);
        }
    });

    currentGapAnalysis = {
        role: roleInput,
        missing: missing,
        matched: matched
    };

    // Calculate ATS Score
    const score = reqSkills.length > 0 ? Math.round((matched.length / reqSkills.length) * 100) : 100;
    
    // Display results
    document.getElementById('gapResults').style.display = 'block';
    
    // Animate ATS Ring
    const ringFill = document.getElementById('atsRingFill');
    const strokeDash = (score / 100) * 314;
    ringFill.style.strokeDasharray = `${strokeDash} 314`;

    // Dynamic ATS color based on score
    if (score < 40) ringFill.style.stroke = '#ef4444';
    else if (score < 75) ringFill.style.stroke = '#f59e0b';
    else ringFill.style.stroke = '#10b981';

    document.getElementById('atsScoreNum').textContent = score;
    
    let atsLabel = 'Low Fit';
    if (score >= 80) atsLabel = 'Excellent Fit ';
    else if (score >= 60) atsLabel = 'Good Fit ';
    else if (score >= 40) atsLabel = 'Moderate Fit  ï¸';
    document.getElementById('atsLabel').textContent = atsLabel;
    document.getElementById('atsMatched').textContent = `${matched.length} of ${reqSkills.length} skills matched`;

    // Render matched chips
    const matchedList = document.getElementById('matchedSkillsList');
    matchedList.innerHTML = matched.length > 0
        ? matched.map(s => `<span class="matched-skill-chip"><i class="fas fa-check"></i> ${s}</span>`).join('')
        : '<p style="font-size:0.8rem;color:var(--gray);">No matching skills found.</p>';

    // Render missing chips
    const gapList = document.getElementById('gapSkillsList');
    gapList.innerHTML = missing.length > 0
        ? missing.map(s => `<span class="gap-skill-chip"><i class="fas fa-exclamation-triangle"></i> ${s}</span>`).join('')
        : '<p style="font-size:0.8rem;color:var(--gray);">No missing skills! You are a perfect match. ';

    // Recommend Courses
    renderCourseRecommendations(missing);

    // Reset roadmap area
    document.getElementById('roadmapBox').innerHTML = `<p class="roadmap-hint">Click "Generate AI Roadmap" above for a custom 3-month plan to master: ${missing.join(', ') || 'your career'}.</p>`;
    
    showToast('Gap analysis complete! Scroll down to see course recommendations.');
}

function renderCourseRecommendations(missingSkills) {
    const coursesSection = document.getElementById('coursesSection');
    const coursesGrid = document.getElementById('coursesGrid');
    
    if (missingSkills.length === 0) {
        coursesSection.style.display = 'none';
        return;
    }

    coursesSection.style.display = 'block';
    
    // Accumulate courses
    let html = '';
    
    missingSkills.forEach(skill => {
        const lookup = skill.toLowerCase();
        let courses = courseRecommendations[lookup];
        
        // If not hardcoded, build dynamic recommended courses
        if (!courses) {
            courses = [
                {
                    name: `${skill} Full Course (Hindi) â€“ YouTube Search`,
                    platform: 'YouTube',
                    rating: 'Free Hindi/English Videos',
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill)}+full+course+hindi`,
                    price: 'Free',
                    ytChannel: 'YouTube Search'
                },
                {
                    name: `Mastering ${skill}: From Zero to Professional`,
                    platform: 'Udemy',
                    rating: '4.7 ★ (New Course)',
                    url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`,
                    price: 'Top Choice'
                },
                {
                    name: `${skill} Fundamentals & Application`,
                    platform: 'Coursera',
                    rating: '4.8 ★ (Partner Course)',
                    url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
                    price: 'Free to Audit'
                }
            ];
        }

        courses.forEach(c => {
            let platformStyle, platformIcon, ctaText;
            if (c.platform === 'YouTube') {
                platformStyle = 'background:#FF0000;';
                platformIcon = '<i class="fab fa-youtube"></i>';
                ctaText = 'Watch Free';
            } else if (c.platform === 'Udemy') {
                platformStyle = 'background:#A435F0;';
                platformIcon = '<i class="fas fa-graduation-cap"></i>';
                ctaText = 'Enrol Now';
            } else {
                platformStyle = 'background:#0056D2;';
                platformIcon = '<i class="fas fa-university"></i>';
                ctaText = 'Enrol Free';
            }
            const channelBadge = c.ytChannel
                ? `<span class="yt-channel-badge">${platformIcon} ${c.ytChannel}</span>`
                : '';
            html += `
                <a href="${c.url}" target="_blank" class="course-card ${c.platform === 'YouTube' ? 'yt-card' : ''}">
                    <div class="course-card-top">
                        <span class="course-platform" style="${platformStyle}">${platformIcon} ${c.platform}</span>
                        ${channelBadge}
                    </div>
                    <span class="course-skill-label">${skill}</span>
                    <div class="course-name">${c.name}</div>
                    <div class="course-meta">
                        <span class="course-rating">${c.rating}</span>
                        <span>·</span>
                        <span>${c.price}</span>
                    </div>
                    <div class="course-cta">${ctaText} <i class="fas fa-external-link-alt"></i></div>
                </a>
            `;
        });
    });

    coursesGrid.innerHTML = html;
}

async function generateAIRoadmap() {
    const missing = currentGapAnalysis.missing;
    const role = currentGapAnalysis.role;

    if (!role) {
        showToast('Please run the skill gap analysis first.');
        return;
    }

    const roadmapBox = document.getElementById('roadmapBox');
    const generateBtn = document.getElementById('generateRoadmapBtn');

    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Roadmap...';
    roadmapBox.innerHTML = '<div class="roadmap-loading"><i class="fas fa-cog fa-spin"></i> AI is constructing your weekly learning roadmap...</div>';

    const prompt = `You are a world-class mentor in the exact field of "${role}" - infer whether this is a technical, creative, or business role from the title itself, and stay strictly within that field's real tools and practices. The student wants to become a "${role}" but currently lacks these specific skills:\n${missing.join(', ') || 'core skills for this role'}\n\nPlease generate a highly detailed, practical, week-by-week 3-month (12 weeks) learning roadmap in clean, readable text, built ONLY around the listed missing skills and this specific field. Do not include generic unrelated topics (e.g. Git, software data structures, or generic hackathons) unless they are genuinely part of "${role}" work. Format it clearly, with week ranges, objectives, recommended projects, and milestones. Do not write any HTML tags. Use plain text formatting only. Start directly with the roadmap title.`;

    try {
        const response = await fetch('/api/ai-write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: 'roadmap', context: prompt })
        });
        if (!response.ok) throw new Error('API failed');
        const resData = await response.json();
        
        roadmapBox.innerHTML = `<pre class="roadmap-text">${resData.content}</pre>`;
        showToast('Roadmap generated successfully! ');
    } catch (e) {
        console.error(e);
        roadmapBox.innerHTML = '<p class="roadmap-hint" style="color:#ef4444;">Failed to generate AI roadmap. Please try again.</p>';
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate AI Roadmap';
    }
}

// ============================================
// PDF TEXT EXTRACTION (PDF.js)
// ============================================
async function extractTextFromPDF(arrayBuffer) {
    if (typeof pdfjsLib === 'undefined') throw new Error('PDF.js not loaded');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Sort items by Y position (top to bottom), then X (left to right)
        // This reconstructs reading order correctly for multi-column PDFs
        const items = textContent.items.slice().sort((a, b) => {
            const ay = Math.round(a.transform[5] / 5) * 5;
            const by = Math.round(b.transform[5] / 5) * 5;
            if (ay !== by) return by - ay; // descending Y (PDF coords)
            return a.transform[4] - b.transform[4]; // ascending X
        });

        let lastY = null;
        let lastX = null;
        let pageText = '';

        for (const item of items) {
            const text = item.str;
            if (!text.trim()) continue;
            const y = Math.round(item.transform[5]);
            const x = item.transform[4];

            if (lastY !== null) {
                const yDiff = Math.abs(lastY - y);
                const xDiff = x - (lastX || 0);

                if (yDiff > 12) {
                    // New line — significant vertical gap
                    pageText += '\n';
                } else if (xDiff > 20) {
                    // Same line but horizontal gap — add space
                    pageText += ' ';
                }
            }
            pageText += text;
            lastY = y;
            lastX = x + (item.width || 0);
        }
        fullText += pageText + '\n\n';
    }

    return fullText.trim();
}

// ============================================
// ENTRY FLOW: Choice Panel -> Upload / Scratch
// ============================================
function initEntryFlow() {
    const choiceUpload = document.getElementById('choiceUpload');
    const choiceScratch = document.getElementById('choiceScratch');
    const backToChoiceBtn = document.getElementById('backToChoiceBtn');
    const pdfDropZone = document.getElementById('pdfDropZone');
    const pdfFileInput = document.getElementById('pdfFileInput');

    const handleUploadClick = (e) => {
        if (e) e.preventDefault();
        const choicePanel = document.getElementById('choicePanel');
        const uploadPanel = document.getElementById('uploadPanel');
        if (choicePanel) choicePanel.classList.add('hidden');
        if (uploadPanel) uploadPanel.classList.remove('hidden');
        const builder = document.getElementById('builder');
        if (builder) window.scrollTo({ top: builder.offsetTop - 80, behavior: 'smooth' });
    };

    const handleScratchClick = (e) => {
        if (e) e.preventDefault();
        state.flow = 'scratch';
        state.totalSteps = 4;
        const choicePanel = document.getElementById('choicePanel');
        const mainStepper = document.getElementById('mainStepper');
        if (choicePanel) choicePanel.classList.add('hidden');
        if (mainStepper) mainStepper.classList.remove('hidden');
        if (typeof goToStep === 'function') goToStep(1);
    };

    // Choice: Upload PDF (card or button inside)
    if (choiceUpload) {
        choiceUpload.addEventListener('click', handleUploadClick);
        const btn = choiceUpload.querySelector('.choice-btn');
        if (btn) btn.addEventListener('click', handleUploadClick);
    }

    // Choice: Create From Scratch (card or button inside)
    if (choiceScratch) {
        choiceScratch.addEventListener('click', handleScratchClick);
        const btn = choiceScratch.querySelector('.choice-btn');
        if (btn) btn.addEventListener('click', handleScratchClick);
    }

    // Back to choice from upload panel
    if (backToChoiceBtn) {
        backToChoiceBtn.addEventListener('click', () => {
            document.getElementById('uploadPanel').classList.add('hidden');
            document.getElementById('choicePanel').classList.remove('hidden');
            window.scrollTo({ top: document.getElementById('builder').offsetTop - 80, behavior: 'smooth' });
        });
    }

    // Drag & drop on PDF drop zone
    if (pdfDropZone) {
        pdfDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            pdfDropZone.classList.add('dragover');
        });
        pdfDropZone.addEventListener('dragleave', () => pdfDropZone.classList.remove('dragover'));
        pdfDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            pdfDropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') {
                handlePDFUpload(file);
            } else {
                showToast('Please drop a valid PDF file.');
            }
        });
        pdfDropZone.addEventListener('click', () => pdfFileInput && pdfFileInput.click());
    }

    // File input change
    if (pdfFileInput) {
        pdfFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handlePDFUpload(file);
        });
    }
}

async function handlePDFUpload(file) {
    const uploadStatus = document.getElementById('uploadStatus');
    const statusTitle = document.getElementById('statusTitle');
    const statusDesc = document.getElementById('statusDesc');
    const pdfDropZone = document.getElementById('pdfDropZone');

    pdfDropZone.style.display = 'none';
    uploadStatus.style.display = 'flex';
    statusTitle.textContent = 'Uploading & Analyzing PDF Geometry...';
    statusDesc.textContent = 'Executing 11-Stage Resume Intelligence Pipeline';

    try {
        let rawText = '';
        let serverMeta = null;

        // ── Strategy 1: Production Resume Intelligence Engine (/api/extract-pdf) ──
        try {
            const formData = new FormData();
            formData.append('pdf', file);
            const serverResp = await fetch('/api/extract-pdf', { method: 'POST', body: formData });
            if (serverResp.ok) {
                const serverData = await serverResp.json();
                if (serverData.text && serverData.text.length > 50) {
                    rawText = serverData.text;
                    serverMeta = serverData;
                    statusDesc.textContent = `Extracted via ${serverData.parserUsed || 'PyMuPDF'} (Confidence: ${serverData.confidenceScore || 90}%)`;
                    renderParsingIntelligenceCard(serverData);
                }
            }
        } catch (serverErr) {
            console.warn('Resume Intelligence Pipeline notice, trying client PDF.js:', serverErr.message);
        }

        // ── Strategy 2: client-side PDF.js fallback ──
        if (!rawText || rawText.length < 50) {
            statusDesc.textContent = 'Executing client-side layout fallback...';
            try {
                const arrayBuffer = await file.arrayBuffer();
                rawText = await extractTextFromPDF(arrayBuffer);
            } catch (clientErr) {
                console.warn('Client PDF.js also failed:', clientErr.message);
            }
        }

        if (!rawText || rawText.length < 50) {
            throw new Error('Could not extract text from this PDF. It may be image-based or password-protected. Please try a different PDF or copy-paste your resume text manually.');
        }

        statusTitle.textContent = 'AI Structuring & Validating Resume...';
        statusDesc.textContent = 'Parsing sections into standardized Resume JSON';

        let parsedData = null;

        // If Python Resume Intelligence Engine extracted structured JSON, map it directly
        if (serverMeta && serverMeta.resumeJson) {
            const rj = serverMeta.resumeJson;
            const p = rj.personal || {};
            parsedData = {
                fullName: p.name || '',
                email: p.email || '',
                phone: p.phone || '',
                location: p.location || '',
                summary: rj.summary || '',
                skills: rj.skills || [],
                education: (rj.education || []).map(e => e.details || e).join('\n'),
                experience: (rj.experience || []).map(e => e.details || e).join('\n'),
                projects: (rj.projects || []).map(e => e.details || e).join('\n'),
                certifications: (rj.certifications || []).join('\n'),
                languages: (rj.languages || []).join(', '),
                achievements: (rj.achievements || []).join('\n'),
                linkedin: p.linkedin || '',
                github: p.github || ''
            };
        } else {
            // AI Fallback parsing
            const parsePrompt = `You are an expert resume parser. Extract ALL structured information from the following raw resume text and return it as a JSON object with these exact keys:\n{\n  "fullName": "",\n  "email": "",\n  "phone": "",\n  "location": "",\n  "college": "",\n  "degree": "",\n  "gra": "",\n  "education": "",\n  "skills": [],\n  "languages": "",\n  "targetRole": "",\n  "summary": "",\n  "experience": "",\n  "projects": "",\n  "certifications": "",\n  "achievements": "",\n  "linkedin": "",\n  "github": ""\n}\n\nRules:\n- skills must be an array of strings\n- experience, projects, certifications, achievements: preserve full multi-line text as-is\n- education: format as 'College Name\\nDegree (Grad Year)' or leave blank\n- languages: comma-separated list of languages spoken\n- Return ONLY the raw JSON. No markdown code blocks, no explanation, no extra text.\n- If a field is not found, use an empty string or empty array\n\nResume text:\n${rawText.substring(0, 12000)}`;

            try {
                const response = await fetch('/api/ai-write', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ field: 'parseResume', context: parsePrompt })
                });

                if (response.ok) {
                    const resData = await response.json();
                    const jsonStr = resData.content
                        .replace(/```json/gi, '')
                        .replace(/```/g, '')
                        .trim();
                    try {
                        parsedData = JSON.parse(jsonStr);
                    } catch (parseErr) {
                        console.warn('JSON parse failed, using raw text fallback');
                    }
                }
            } catch (aiErr) {
                console.warn('AI parsing failed, proceeding with raw text');
            }
        }

        statusTitle.textContent = 'Pre-filling your profile...';
        statusDesc.textContent = 'Transferring validated data to builder';

        state.flow = 'upload';

        // Pre-fill form fields if parsed data is available
        if (parsedData) {
            const fieldMap = {
                fullName: 'fullName',
                email: 'email',
                phone: 'phone',
                location: 'location',
                college: 'college',
                degree: 'degree',
                undergradGpa: 'undergradGpa',
                gradYear: 'gradYear',
                targetRole: 'targetRole',
                summary: 'summary',
                linkedin: 'linkedin',
                github: 'github'
            };

            Object.entries(fieldMap).forEach(([dataKey, inputId]) => {
                const el = document.getElementById(inputId);
                if (el && parsedData[dataKey]) el.value = parsedData[dataKey];
            });

            if (Array.isArray(parsedData.skills) && parsedData.skills.length > 0) {
                state.formData.skills = [...new Set(parsedData.skills)];
                renderSkills();
            }
            if (parsedData.targetRole) state.formData.targetRole = parsedData.targetRole;
            if (parsedData.languages) {
                const langEl = document.getElementById('languages');
                if (langEl) langEl.value = parsedData.languages;
            }
        }

        // Serialize parsed data into clean plain text that parseResumeText() can read.
        // Storing raw PDF text caused section parsing to fail (missing sections in templates).
        const serializedText = parsedData ? serializeResumeData(parsedData) : rawText;
        state.resumeText = serializedText;

        // Pre-fill edit textarea for step 4
        if (els.editTextarea) {
            els.editTextarea.value = serializedText;
        }

        // Build resume HTML preview using best-guess data
        const previewData = parsedData ? {
            fullName: parsedData.fullName || 'Your Name',
            targetRole: parsedData.targetRole || 'Professional',
            email: parsedData.email || '',
            phone: parsedData.phone || '',
            location: parsedData.location || '',
            college: parsedData.college || '',
            degree: parsedData.degree || '',
            gradYear: parsedData.gradYear || '',
            skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
            summary: parsedData.summary || '',
            experience: parsedData.experience || '',
            projects: parsedData.projects || '',
            certifications: parsedData.certifications || '',
            achievements: parsedData.achievements || '',
            linkedin: parsedData.linkedin || '',
            github: parsedData.github || ''
        } : parseResumeText(rawText);

        state.generatedHTML = buildResumeHTML(previewData, state.formData.selectedTemplate);
        if (els.resumeSheet) els.resumeSheet.innerHTML = state.generatedHTML;

        await new Promise(r => setTimeout(r, 400));
        uploadStatus.style.display = 'none';

        // Navigate to Skill Gap Analyser
        const targetRole = (parsedData && parsedData.targetRole) || '';
        showSkillGapSection(targetRole, 'upload');

        showToast('Resume parsed successfully!  Analyse your skill gaps below.');

    } catch (err) {
        console.error('PDF Upload error:', err);
        uploadStatus.style.display = 'none';
        // Show manual paste fallback
        const manualArea = document.getElementById('manualPasteArea');
        if (manualArea) {
            manualArea.classList.remove('hidden');
        } else {
            pdfDropZone.style.display = 'flex';
        }
        showToast('Auto-extract failed - please paste your resume text below.');
    }
}

// Wire manual paste submit
document.addEventListener('DOMContentLoaded', () => {
    const manualBtn = document.getElementById('manualPasteSubmit');
    if (manualBtn) {
        manualBtn.addEventListener('click', async () => {
            const text = document.getElementById('manualPasteText')?.value?.trim();
            if (!text || text.length < 30) {
                showToast('Please paste your resume text first.');
                return;
            }
            state.resumeText = text;
            state.flow = 'upload';
            if (els.editTextarea) els.editTextarea.value = text;

            const uploadStatus = document.getElementById('uploadStatus');
            if (uploadStatus) { uploadStatus.style.display = 'flex'; }
            document.getElementById('manualPasteArea')?.classList.add('hidden');
            document.getElementById('statusTitle').textContent = 'AI is structuring your resume...';
            document.getElementById('statusDesc').textContent = 'Parsing with Groq AI';

            // AI parse
            const parsePrompt = `You are an expert resume parser. Extract structured information from the following raw resume text and return it as a JSON object with these exact keys:\n{\n  "fullName": "",\n  "email": "",\n  "phone": "",\n  "location": "",\n  "college": "",\n  "degree": "",\n  "gra": "",\n  "skills": [],\n  "targetRole": "",\n  "summary": "",\n  "experience": "",\n  "projects": "",\n  "certifications": "",\n  "achievements": "",\n  "linkedin": "",\n  "github": ""\n}\nRules: skills must be an array. Return ONLY raw JSON.\nResume text:\n${text.substring(0, 4000)}`;

            let parsedData = null;
            try {
                const resp = await fetch('/api/ai-write', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ field: 'parseResume', context: parsePrompt })
                });
                if (resp.ok) {
                    const rd = await resp.json();
                    const js = rd.content.replace(/```json/gi,'').replace(/```/g,'').trim();
                    try { parsedData = JSON.parse(js); } catch(e){}
                }
            } catch(e){}

            if (parsedData) {
                ['fullName','email','phone','location','college','degree','gra','targetRole','summary','linkedin','github'].forEach(f => {
                    const el = document.getElementById(f);
                    if (el && parsedData[f]) el.value = parsedData[f];
                });
                if (Array.isArray(parsedData.skills) && parsedData.skills.length > 0) {
                    state.formData.skills = [...new Set(parsedData.skills)];
                    renderSkills();
                }
                if (parsedData.targetRole) state.formData.targetRole = parsedData.targetRole;
            }

            const previewData = parsedData ? {
                fullName: parsedData.fullName || 'Your Name',
                targetRole: parsedData.targetRole || '',
                email: parsedData.email || '', phone: parsedData.phone || '',
                location: parsedData.location || '', college: parsedData.college || '',
                degree: parsedData.degree || '', gradYear: parsedData.gradYear || '',
                skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
                summary: parsedData.summary || '', experience: parsedData.experience || '',
                projects: parsedData.projects || '', certifications: parsedData.certifications || '',
                achievements: parsedData.achievements || '', linkedin: parsedData.linkedin || '',
                github: parsedData.github || ''
            } : parseResumeText(text);

            state.generatedHTML = buildResumeHTML(previewData, state.formData.selectedTemplate || 'modern');
            if (els.resumeSheet) els.resumeSheet.innerHTML = state.generatedHTML;

            showSkillGapSection(parsedData?.targetRole || '', 'upload');
            showToast('Resume loaded! Analyse skill gaps below. ');
        });
    }
});

// ============================================
// RESUME ENHANCE SECTION (Upload Flow)
// ============================================

function showResumeEnhanceSection() {
    // Hide all other sections
    document.getElementById('choicePanel')?.classList.add('hidden');
    document.getElementById('uploadPanel')?.classList.add('hidden');
    document.getElementById('mainStepper')?.classList.add('hidden');
    document.getElementById('skillGap')?.classList.add('hidden');
    els.wizardSteps.forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });

    // Show enhance section
    const section = document.getElementById('resumeEnhanceSection');
    section.classList.remove('hidden');

    // Populate the edit textarea with current resumeText
    const enhTA = document.getElementById('enhEditTextarea');
    if (enhTA) {
        enhTA.value = state.resumeText || '';
    }

    // Render resume preview in enhance section
    const enhSheet = document.getElementById('enhResumeSheet');
    if (enhSheet) {
        enhSheet.innerHTML = state.generatedHTML || buildResumeHTML(parseResumeText(state.resumeText), state.formData.selectedTemplate || 'modern');
    }

    // Set initial zoom
    updateEnhZoom();

    window.scrollTo({ top: section.offsetTop - 80, behavior: 'smooth' });
    showToast('Resume loaded! Enhance, review and download your improved resume. ');
}

function applyEnhChanges() {
    const enhTA = document.getElementById('enhEditTextarea');
    if (!enhTA) return;
    state.resumeText = enhTA.value;
    const enhSheet = document.getElementById('enhResumeSheet');
    if (enhSheet) {
        state.generatedHTML = buildResumeHTML(parseResumeText(state.resumeText), state.formData.selectedTemplate || 'modern');
        enhSheet.innerHTML = state.generatedHTML;
    }
    showToast('Changes applied to preview!');
}

function resetEnhChanges() {
    const enhTA = document.getElementById('enhEditTextarea');
    if (enhTA) enhTA.value = state.resumeText;
    showToast('Changes reset.');
}

function updateEnhZoom() {
    const viewport = document.getElementById('enhResumeViewport');
    const sheet = document.getElementById('enhResumeSheet');
    if (!viewport || !sheet) return;
    const z = state.enhZoom;
    viewport.style.setProperty('--zoom-factor', z);
    const zEl = document.getElementById('enhZoomLevel');
    if (zEl) zEl.textContent = Math.round(z * 100) + '%';
}

function initEnhanceSection() {
    // Zoom controls for enhance section
    const zoomIn = document.getElementById('enhZoomIn');
    const zoomOut = document.getElementById('enhZoomOut');
    if (zoomIn) zoomIn.addEventListener('click', () => {
        state.enhZoom = Math.min(state.enhZoom + 0.1, 2);
        updateEnhZoom();
    });
    if (zoomOut) zoomOut.addEventListener('click', () => {
        state.enhZoom = Math.max(state.enhZoom - 0.1, 0.3);
        updateEnhZoom();
    });

    // Full enhance button in enhance section
    const enhFull = document.getElementById('enhFullResumeBtn');
    if (enhFull) {
        enhFull.addEventListener('click', async (e) => {
            e.preventDefault();
            await enhanceFullResumeFor('enh');
        });
    }

    // Per-section enhance buttons in enhance section (data-target="enh")
    document.querySelectorAll('.enhance-btn[data-target="enh"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            await enhanceSectionFor(btn.dataset.section, btn, 'enh');
        });
    });

    // Download buttons for enhance section
    const dlPDF = document.getElementById('enhDownloadPDF');
    const dlJPG = document.getElementById('enhDownloadJPG');
    const dlTXT = document.getElementById('enhDownloadTXT');

    if (dlPDF) dlPDF.addEventListener('click', async () => {
        const sheet = document.getElementById('enhResumeSheet');
        if (!sheet) return;
        showToast('Generating PDF...');
        const { clone, cleanup } = createExportClone(sheet.innerHTML);
        try {
            const canvas = await captureResumeCanvas(clone, 3);
            exportCanvasToPDF(canvas, 'enhanced_resume.pdf');
        } catch (err) { showToast('PDF generation failed.'); }
        finally { cleanup(); }
    });
    if (dlJPG) dlJPG.addEventListener('click', async () => {
        const sheet = document.getElementById('enhResumeSheet');
        if (!sheet) return;
        showToast('Generating image...');
        const { clone, cleanup } = createExportClone(sheet.innerHTML);
        try {
            const canvas = await captureResumeCanvas(clone, 2);
            const link = document.createElement('a');
            link.download = 'enhanced_resume.jpg';
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.click();
        } catch (err) { showToast('Image generation failed.'); }
        finally { cleanup(); }
    });
    if (dlTXT) dlTXT.addEventListener('click', () => {
        const text = state.resumeText || '';
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'enhanced_resume.txt';
        link.click();
        showToast('TXT downloaded!');
    });

    // Template selection grid for enhance section
    initEnhTemplateGrid();
}

function initEnhTemplateGrid() {
    const grid = document.getElementById('enhTemplateGrid');
    if (!grid) return;
    // Show flat list of templates
    grid.innerHTML = allTemplates.map(tmpl => `
        <div class="enh-tmpl-card ${tmpl.id === (state.formData.selectedTemplate || 'modern') ? 'active' : ''}"
             data-tmpl="${tmpl.id}">
            <i class="fas fa-file-alt"></i> ${tmpl.name}
        </div>
    `).join('');

    grid.querySelectorAll('.enh-tmpl-card').forEach(card => {
        card.addEventListener('click', () => {
            grid.querySelectorAll('.enh-tmpl-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            state.formData.selectedTemplate = card.dataset.tmpl;
            // Re-render preview
            const enhSheet = document.getElementById('enhResumeSheet');
            if (enhSheet) {
                state.generatedHTML = buildResumeHTML(parseResumeText(state.resumeText), state.formData.selectedTemplate);
                enhSheet.innerHTML = state.generatedHTML;
            }
            showToast('Template applied to preview!');
        });
    });
}

async function enhanceFullResumeFor(target) {
    const textareaId = target === 'enh' ? 'enhEditTextarea' : 'editTextarea';
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    const currentText = textarea.value || state.resumeText;
    if (!currentText.trim()) { showToast('No resume content to enhance.'); return; }

    const btn = document.getElementById(target === 'enh' ? 'enhFullResumeBtn' : 'enhanceFullBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enhancing...'; }

    showToast('AI is enhancing your full resume...');
    try {
        const response = await fetch('/api/ai-write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                field: 'fullEnhance',
                context: `You are a professional resume writer and ATS optimization expert. Enhance the following resume to make it more professional, ATS-friendly, and impactful. Improve grammar, use stronger action verbs, add relevant keywords, and make it stand out. Keep all sections but improve the content quality. Return the enhanced resume in the same plain text format with section headers in ALL CAPS.\n\nRESUME:\n${currentText}`
            })
        });
        if (response.ok) {
            const data = await response.json();
            const enhanced = data.content;
            textarea.value = enhanced;
            state.resumeText = enhanced;
            // Re-render preview
            const sheetId = target === 'enh' ? 'enhResumeSheet' : 'resumeSheet';
            const sheet = document.getElementById(sheetId);
            if (sheet) {
                state.generatedHTML = buildResumeHTML(parseResumeText(enhanced), state.formData.selectedTemplate || 'modern');
                sheet.innerHTML = state.generatedHTML;
            }
            showToast('Resume enhanced successfully with AI! ');
        } else {
            throw new Error('API error');
        }
    } catch (err) {
        showToast('AI enhancement failed. Please try again.');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Enhance Full Resume with AI'; }
    }
}

async function enhanceSectionFor(sectionKey, btn, target) {
    const textareaId = target === 'enh' ? 'enhEditTextarea' : 'editTextarea';
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    const currentText = textarea.value || state.resumeText;
    if (!currentText.trim()) { showToast('No resume content to enhance.'); return; }

    btn.disabled = true;
    const origHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const sectionMap = {
        summary: 'PROFESSIONAL SUMMARY or ABOUT ME or ACADEMIC PROFILE',
        experience: 'EXPERIENCE or WORK EXPERIENCE',
        projects: 'PROJECTS',
        achievements: 'ACHIEVEMENTS',
        certifications: 'CERTIFICATIONS',
        skills: 'SKILLS'
    };
    const sectionName = sectionMap[sectionKey] || sectionKey.toUpperCase();

    try {
        const response = await fetch('/api/ai-write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                field: 'sectionEnhance',
                context: `You are a professional resume writer. From the following resume, find the section "${sectionName}" and rewrite it to be more professional, ATS-friendly, and impactful. Use strong action verbs and quantifiable achievements where possible. Return ONLY the improved section content (not the entire resume, just that section's improved text). Keep the section header in ALL CAPS.\n\nRESUME:\n${currentText.substring(0, 3000)}`
            })
        });
        if (response.ok) {
            const data = await response.json();
            const enhanced = data.content;
            // Replace the section in the textarea
            const lines = currentText.split('\n');
            const sectionRegex = new RegExp('^(' + sectionKey.toUpperCase() + '|' + sectionName.split(' or ')[0] + '|' + sectionName.split(' or ').join('|') + ')\\s*$', 'im');
            const nextSectionRegex = /^[A-Z][A-Z\s\(\)\d]+$/;
            let newLines = [];
            let inTarget = false;
            let replaced = false;
            for (let i = 0; i < lines.length; i++) {
                const trimmed = lines[i].trim();
                if (!replaced && sectionRegex.test(trimmed)) {
                    inTarget = true;
                    newLines.push(lines[i]);
                    newLines.push(enhanced);
                    replaced = true;
                    continue;
                }
                if (inTarget && replaced && trimmed && nextSectionRegex.test(trimmed) && !sectionRegex.test(trimmed)) {
                    inTarget = false;
                    newLines.push(lines[i]);
                    continue;
                }
                if (!inTarget || !replaced) {
                    newLines.push(lines[i]);
                }
            }
            const newText = replaced ? newLines.join('\n') : currentText + '\n\n' + enhanced;
            textarea.value = newText;
            state.resumeText = newText;
            showToast(`${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)} section enhanced!`);
        }
    } catch (err) {
        showToast('Enhancement failed. Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = origHTML;
    }
}

// ============================================
// AI CONTENT OPTIMIZATION ENGINE
// ============================================

// ============================================
// INTELLIGENT LAYOUT-AWARE ENGINE & PIPELINE
// ============================================

function calculateLayoutFit(container) {
    if (!container) return null;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight || 1123; // Usually 1123px for A4
    return scrollHeight - clientHeight;
}

/**
 * 1. INTELLIGENT COLUMN BALANCING
 * Rebalances left/right columns by moving flexible sections when imbalance exceeds 60px.
 */
function balanceResumeColumns(container) {
    if (!container) return;
    
    // Select column pairs across template styles
    const leftCol = container.querySelector('[class*="-left"], [class*="-sidebar"], .col-left');
    const rightCol = container.querySelector('[class*="-right"], [class*="-main"], .col-right');

    if (!leftCol || !rightCol) return;

    const movableTitleKeywords = ['skill', 'certification', 'language', 'achievement', 'interest', 'volunteer', 'award', 'program'];

    let leftH = leftCol.offsetHeight;
    let rightH = rightCol.offsetHeight;
    let diff = leftH - rightH;

    // Flexible sections moving loop
    const maxPasses = 3;
    let pass = 0;

    while (Math.abs(diff) > 60 && pass < maxPasses) {
        pass++;
        const sourceCol = diff > 0 ? leftCol : rightCol;
        const targetCol = diff > 0 ? rightCol : leftCol;

        // Find all direct section children in source column
        const sections = Array.from(sourceCol.children);
        let movedSection = null;

        for (let i = sections.length - 1; i >= 0; i--) {
            const sec = sections[i];
            const titleEl = sec.querySelector('[class*="-title"], h3, h4');
            const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';

            // Check if section is flexible (not Experience, Education, Summary, Header)
            const isFlexible = movableTitleKeywords.some(kw => titleText.includes(kw));

            if (isFlexible) {
                movedSection = sec;
                break;
            }
        }

        if (movedSection) {
            targetCol.appendChild(movedSection);
            leftH = leftCol.offsetHeight;
            rightH = rightCol.offsetHeight;
            diff = leftH - rightH;
        } else {
            break; // No more flexible sections to move
        }
    }
}

/**
 * 2. VERTICAL SPACE & DYNAMIC TYPOGRAPHY OPTIMIZATION
 * Scales CSS variables (--section-gap, --font-scale, --line-height) to prevent overflow or eliminate blank gaps.
 */
function optimizeVerticalSpacingAndTypography(container) {
    if (!container) return;
    
    // First run column balance
    balanceResumeColumns(container);

    let overflowPx = calculateLayoutFit(container) || 0;

    // Default CSS variable levels
    let fontScale = 1.0;
    let sectionGap = 24;
    let itemGap = 12;
    let lineHeight = 1.5;

    // Case A: Content Overflow -> Gradually compress spacing & font size
    if (overflowPx > 15) {
        if (overflowPx > 150) {
            fontScale = 0.88;
            sectionGap = 12;
            itemGap = 6;
            lineHeight = 1.35;
        } else if (overflowPx > 80) {
            fontScale = 0.92;
            sectionGap = 16;
            itemGap = 8;
            lineHeight = 1.4;
        } else {
            fontScale = 0.96;
            sectionGap = 20;
            itemGap = 10;
            lineHeight = 1.45;
        }
    } 
    // Case B: Insufficient Content -> Expand spacing to fill page comfortably
    else if (overflowPx < -120) {
        fontScale = 1.04;
        sectionGap = 28;
        itemGap = 14;
        lineHeight = 1.6;
    }

    // Apply inline style adjustments to container
    container.style.setProperty('--font-scale', fontScale);
    container.style.setProperty('--section-gap', `${sectionGap}px`);
    container.style.setProperty('--item-gap', `${itemGap}px`);
    container.style.setProperty('--line-height', lineHeight);

    // Re-verify fit
    return calculateLayoutFit(container);
}

/**
 * 3. AUTOMATIC QUALITY VALIDATION BEFORE EXPORT
 */
function validateResumeLayout(container) {
    if (!container) return { valid: false, errors: ['No container found'] };

    const errors = [];
    const scrollH = container.scrollHeight;
    const clientH = container.clientHeight || 1123;
    const overflow = scrollH - clientH;

    // Check 1: Overflow
    if (overflow > 20) {
        errors.push(`Resume content overflows by ${overflow}px.`);
    }

    // Check 2: Oversized Empty Space (>18% unused page area)
    const unusedPct = ((clientH - scrollH) / clientH) * 100;
    if (unusedPct > 18) {
        errors.push(`Resume has ${Math.round(unusedPct)}% unused empty space on page.`);
    }

    // Check 3: Column Imbalance
    const leftCol = container.querySelector('[class*="-left"], [class*="-sidebar"], .col-left');
    const rightCol = container.querySelector('[class*="-right"], [class*="-main"], .col-right');
    if (leftCol && rightCol) {
        const diff = Math.abs(leftCol.offsetHeight - rightCol.offsetHeight);
        if (diff > 100) {
            errors.push(`Columns are visually imbalanced by ${diff}px.`);
        }
    }

    // Check 4: Orphan Headings (section title at very bottom of container without content)
    const titles = container.querySelectorAll('[class*="-section-title"], [class*="-title"]');
    titles.forEach(title => {
        const parentSec = title.closest('.section, [class*="-section"]') || title.parentElement;
        if (parentSec && parentSec.offsetHeight < 25) {
            errors.push(`Orphan heading detected: "${title.textContent.trim()}".`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        metrics: { overflow, unusedPct: Math.max(0, unusedPct) }
    };
}

function showOptimizationModal(originalText, optimizedText, textareaEl, target) {
    const modal = document.getElementById('optimizationModalOverlay');
    const origArea = document.getElementById('optOriginalText');
    const optArea = document.getElementById('optOptimizedText');
    const btnAccept = document.getElementById('btnAcceptOpt');
    const btnReject = document.getElementById('btnRejectOpt');
    const closeBtn = document.getElementById('closeOptModal');

    if (!modal) return;

    origArea.value = originalText;
    optArea.value = optimizedText;
    
    // Reset listeners to avoid multiple bindings
    const newAccept = btnAccept.cloneNode(true);
    btnAccept.parentNode.replaceChild(newAccept, btnAccept);
    const newReject = btnReject.cloneNode(true);
    btnReject.parentNode.replaceChild(newReject, btnReject);
    const newClose = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newClose, closeBtn);

    const closeModal = () => modal.classList.add('hidden');

    newAccept.addEventListener('click', () => {
        textareaEl.value = optimizedText;
        state.resumeText = optimizedText;
        if (target === 'enh') {
            document.getElementById('enhApplyChanges').click();
        } else {
            document.getElementById('applyChanges').click();
        }
        closeModal();
        showToast('Optimizations applied successfully!');
    });

    newReject.addEventListener('click', closeModal);
    newClose.addEventListener('click', closeModal);

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);

    modal.classList.remove('hidden');
}

/**
 * CONSTRAINT-BASED AI LAYOUT OPTIMIZATION ENGINE
 * 
 * Implements a formal 10-Sta// ============================================
// TEMPLATE GROWTH ZONES & SPACING PRIORITIES
// ============================================
const TEMPLATE_GROWTH_ZONES = {
    creative: {
        preferred_growth_sections: ['summary', 'skills', 'certifications', 'achievements', 'languages'],
        spacing_priority: ['between_sections', 'skill_chips', 'line_height'],
        never_expand: ['contact', 'photo']
    },
    minimalPro: {
        preferred_growth_sections: ['summary', 'skills', 'certifications', 'achievements', 'languages'],
        spacing_priority: ['between_sections', 'skill_chips', 'line_height'],
        never_expand: ['contact', 'photo']
    },
    boldBlue: {
        preferred_growth_sections: ['summary', 'skills', 'certifications', 'achievements', 'languages'],
        spacing_priority: ['between_sections', 'skill_chips', 'line_height'],
        never_expand: ['contact', 'photo']
    },
    campusClub: {
        preferred_growth_sections: ['motivation', 'skills', 'campusInvolvement', 'achievements', 'languages'],
        spacing_priority: ['between_sections', 'skill_chips', 'line_height'],
        never_expand: ['contact', 'photo']
    },
    classic: {
        preferred_growth_sections: ['summary', 'projects', 'experience', 'education', 'achievements'],
        spacing_priority: ['between_sections', 'line_height', 'item_gap'],
        never_expand: ['contact']
    },
    starter: {
        preferred_growth_sections: ['summary', 'projects', 'skills', 'education', 'achievements'],
        spacing_priority: ['between_sections', 'line_height', 'item_gap'],
        never_expand: ['contact']
    },
    technical: {
        preferred_growth_sections: ['summary', 'projects', 'experience', 'skills', 'certifications'],
        spacing_priority: ['between_sections', 'line_height', 'item_gap'],
        never_expand: ['contact']
    },
    default: {
        preferred_growth_sections: ['summary', 'projects', 'experience', 'skills', 'certifications', 'achievements', 'languages'],
        spacing_priority: ['between_sections', 'skill_chips', 'line_height'],
        never_expand: ['contact', 'photo']
    }
};

/**
 * LAYOUT INTELLIGENCE ENGINE & CONSTRAINT SOLVER
 * 
 * Implements a formal 10-Stage Iterative Optimization Pipeline:
 * Stage 1: Layout Analyzer & Growth Zone Inspection
 * Stage 2: Empty Space & Column Imbalance Measurement (Real DOM)
 * Stage 3: Content Density Analyzer
 * Stage 4: Section Capacity Analyzer
 * Stage 5: Strategy Selector (Sidebar Fill, Main Fill, Page Fill, Compact, Balanced)
 * Stage 6: Intelligent Section Redistribution Planner
 * Stage 7: Layout Metadata-Driven AI Content Optimizer
 * Stage 8: Typography & Spacing Optimizer
 * Stage 9: Pagination & Layout Integrity Optimizer
 * Stage 10: Visual Quality Scorer & Real-time Report Renderer
 */
const ConstraintLayoutEngine = {
    // Stage 1 — Layout Analyzer
    analyzeLayoutConstraints(templateId, element) {
        const isTwoCol = ['creative','minimalPro','elegantBeige','diagonal','boldBlue','campusClub','campusAchiever','doublePanel'].includes(templateId);
        const growthZone = TEMPLATE_GROWTH_ZONES[templateId] || TEMPLATE_GROWTH_ZONES.default;

        return {
            templateId,
            isTwoCol,
            pageWidthPx: 794,
            pageHeightPx: 1123,
            maxUsableHeightPx: 1060,
            targetFillMin: 0.88,
            targetFillMax: 0.95,
            targetFillIdeal: 0.92,
            targetColumnDeltaMaxPx: 35,
            growthZone
        };
    },

    // Stage 2 — Empty Space Analyzer (Real DOM Measurements)
    analyzeEmptySpace(containerEl, layoutConstraints) {
        if (!containerEl) return { leftPx: 0, rightPx: 0, totalPx: 0, deltaPx: 0, remainingSpacePx: 0, fillRatio: 0, overflowPx: 0, isTwoCol: false, sidebarFillPct: 0, mainFillPct: 0, totalPageUtilizationPct: 0 };

        const isTwoCol = layoutConstraints.isTwoCol;
        let leftPx = 0;
        let rightPx = 0;
        let totalPx = 0;

        if (isTwoCol) {
            const leftEl = containerEl.querySelector('[class$="-sidebar"], .dp-left');
            const rightEl = containerEl.querySelector('[class$="-main"], [class$="-right-content"], .dp-right');

            if (leftEl) leftPx = Math.round(leftEl.getBoundingClientRect().height || leftEl.offsetHeight || 0);
            if (rightEl) rightPx = Math.round(rightEl.getBoundingClientRect().height || rightEl.offsetHeight || 0);
            totalPx = Math.max(leftPx, rightPx);
        } else {
            totalPx = Math.round(containerEl.scrollHeight || containerEl.getBoundingClientRect().height || 0);
            leftPx = totalPx;
            rightPx = totalPx;
        }

        const maxUsable = layoutConstraints.maxUsableHeightPx;
        const deltaPx = isTwoCol ? Math.abs(leftPx - rightPx) : 0;
        const remainingSpacePx = Math.max(0, maxUsable - totalPx);
        const overflowPx = Math.max(0, totalPx - maxUsable);
        const fillRatio = Math.min(1.25, totalPx / maxUsable);

        const sidebarFillPct = Math.min(100, Math.round((leftPx / maxUsable) * 100));
        const mainFillPct = Math.min(100, Math.round((rightPx / maxUsable) * 100));
        const totalPageUtilizationPct = Math.min(100, Math.round((totalPx / maxUsable) * 100));

        return {
            leftPx,
            rightPx,
            totalPx,
            deltaPx,
            remainingSpacePx,
            overflowPx,
            fillRatio,
            isTwoCol,
            sidebarFillPct,
            mainFillPct,
            totalPageUtilizationPct
        };
    },

    // Stage 3 — Content Density Analyzer
    analyzeContentDensity(containerEl) {
        const sections = [];
        if (!containerEl) return sections;

        const secNodes = containerEl.querySelectorAll('[class*="-section"], .mc-row, .dp-lsection, .dp-rsection');
        secNodes.forEach(node => {
            const titleEl = node.querySelector('[class*="-title"], [class*="-header"], .mc-title-col, .dp-pill-label');
            const contentEl = node.querySelector('[class*="-content"], .mc-content-col, .dp-lcontent, .dp-rcontent');

            const titleText = titleEl ? titleEl.textContent.trim() : '';
            const contentText = contentEl ? contentEl.textContent.trim() : node.textContent.trim();
            const rect = node.getBoundingClientRect();

            let key = titleText.toLowerCase().replace(/[^a-z]/g, '');
            if (key.includes('summary') || key.includes('about')) key = 'summary';
            else if (key.includes('project')) key = 'projects';
            else if (key.includes('experience') || key.includes('work')) key = 'experience';
            else if (key.includes('education')) key = 'education';
            else if (key.includes('skill')) key = 'skills';
            else if (key.includes('certif')) key = 'certifications';
            else if (key.includes('achiev')) key = 'achievements';
            else if (key.includes('language')) key = 'languages';
            else if (key.includes('motivation') || key.includes('why')) key = 'motivation';
            else if (key.includes('involve') || key.includes('campus')) key = 'campusInvolvement';

            sections.push({
                key,
                title: titleText,
                heightPx: Math.round(rect.height || node.offsetHeight || 0),
                textLength: contentText.length,
                wordCount: contentText.split(/\s+/).filter(Boolean).length,
                node
            });
        });

        return sections;
    },

    // Stage 4 — Section Capacity Analyzer
    analyzeSectionCapacities(resumeData, densitySections) {
        const capacities = {
            summary:        { minPx: 50,  idealPx: 120, maxPx: 220, minWords: 20, maxWords: 90 },
            experience:     { minPx: 160, idealPx: 350, maxPx: 580, minWords: 40, maxWords: 350 },
            projects:       { minPx: 160, idealPx: 350, maxPx: 580, minWords: 40, maxWords: 350 },
            education:      { minPx: 70,  idealPx: 140, maxPx: 220, minWords: 15, maxWords: 80 },
            skills:         { minPx: 50,  idealPx: 100, maxPx: 180, minWords: 10, maxWords: 60 },
            certifications: { minPx: 40,  idealPx: 90,  maxPx: 160, minWords: 10, maxWords: 50 },
            achievements:   { minPx: 40,  idealPx: 80,  maxPx: 150, minWords: 10, maxWords: 50 },
            languages:      { minPx: 30,  idealPx: 60,  maxPx: 110, minWords: 5,  maxWords: 30 },
            motivation:     { minPx: 60,  idealPx: 120, maxPx: 200, minWords: 25, maxWords: 100 },
            campusInvolvement: { minPx: 70, idealPx: 150, maxPx: 250, minWords: 25, maxWords: 120 }
        };

        const sectionStatus = {};
        densitySections.forEach(s => {
            const cap = capacities[s.key] || { minPx: 40, idealPx: 100, maxPx: 200, minWords: 10, maxWords: 100 };
            let state = 'optimal';
            if (s.heightPx < cap.minPx || s.wordCount < cap.minWords) state = 'under_capacity';
            else if (s.heightPx > cap.maxPx || s.wordCount > cap.maxWords) state = 'over_capacity';

            sectionStatus[s.key] = {
                currentPx: s.heightPx,
                wordCount: s.wordCount,
                state,
                capacity: cap
            };
        });

        return sectionStatus;
    },

    // Stage 5 — Strategy Selector & Layout Optimization Plan Generator
    solveConstraints(emptySpace, sectionCapacities, layoutConstraints, mode = 'balanced') {
        let fillStrategy = 'BALANCED_MODE';

        if (emptySpace.overflowPx > 5 || mode === 'compact') {
            fillStrategy = 'COMPACT_MODE';
        } else if (emptySpace.isTwoCol && emptySpace.leftPx < emptySpace.rightPx - 40) {
            fillStrategy = 'SIDEBAR_FILL_MODE';
        } else if (emptySpace.isTwoCol && emptySpace.rightPx < emptySpace.leftPx - 40) {
            fillStrategy = 'MAIN_FILL_MODE';
        } else if (!emptySpace.isTwoCol && (emptySpace.fillRatio < layoutConstraints.targetFillMin || mode === 'detailed')) {
            fillStrategy = 'PAGE_FILL_MODE';
        } else if (mode === 'detailed') {
            fillStrategy = emptySpace.isTwoCol ? 'SIDEBAR_FILL_MODE' : 'PAGE_FILL_MODE';
        }

        const needsAIExpand = ['SIDEBAR_FILL_MODE', 'MAIN_FILL_MODE', 'PAGE_FILL_MODE'].includes(fillStrategy);
        const needsAICompress = fillStrategy === 'COMPACT_MODE';

        const sectionTargets = {};
        let targetPxToDistribute = 0;

        if (fillStrategy === 'SIDEBAR_FILL_MODE') {
            targetPxToDistribute = Math.min(380, Math.max(80, emptySpace.rightPx - emptySpace.leftPx));
            sectionTargets.summary = Math.round(targetPxToDistribute * 0.30);
            sectionTargets.skills = Math.round(targetPxToDistribute * 0.15);
            sectionTargets.certifications = Math.round(targetPxToDistribute * 0.22);
            sectionTargets.achievements = Math.round(targetPxToDistribute * 0.25);
            sectionTargets.languages = Math.round(targetPxToDistribute * 0.08);
        } else if (fillStrategy === 'MAIN_FILL_MODE') {
            targetPxToDistribute = Math.min(380, Math.max(80, emptySpace.leftPx - emptySpace.rightPx));
            sectionTargets.projects = Math.round(targetPxToDistribute * 0.45);
            sectionTargets.experience = Math.round(targetPxToDistribute * 0.35);
            sectionTargets.summary = Math.round(targetPxToDistribute * 0.20);
        } else if (fillStrategy === 'PAGE_FILL_MODE') {
            targetPxToDistribute = Math.min(300, Math.max(60, emptySpace.remainingSpacePx * 0.75));
            sectionTargets.summary = Math.round(targetPxToDistribute * 0.25);
            sectionTargets.projects = Math.round(targetPxToDistribute * 0.40);
            sectionTargets.experience = Math.round(targetPxToDistribute * 0.25);
            sectionTargets.skills = Math.round(targetPxToDistribute * 0.10);
        } else if (fillStrategy === 'COMPACT_MODE') {
            targetPxToDistribute = Math.max(30, emptySpace.overflowPx + 20);
            sectionTargets.projects = Math.round(targetPxToDistribute * 0.45);
            sectionTargets.experience = Math.round(targetPxToDistribute * 0.35);
            sectionTargets.summary = Math.round(targetPxToDistribute * 0.20);
        }

        const layoutOptimizationPlan = {
            template: layoutConstraints.templateId,
            fill_strategy: fillStrategy,
            page_height_px: layoutConstraints.pageHeightPx,
            usable_height_px: layoutConstraints.maxUsableHeightPx,
            sidebar_height_used_px: emptySpace.leftPx,
            main_height_used_px: emptySpace.rightPx,
            sidebar_remaining_space_px: Math.max(0, layoutConstraints.maxUsableHeightPx - emptySpace.leftPx),
            main_remaining_space_px: Math.max(0, layoutConstraints.maxUsableHeightPx - emptySpace.rightPx),
            column_difference_px: emptySpace.deltaPx,
            page_utilization_pct: emptySpace.totalPageUtilizationPct,
            sidebar_fill_pct: emptySpace.sidebarFillPct,
            main_fill_pct: emptySpace.mainFillPct,
            optimization_required: fillStrategy !== 'BALANCED_MODE',
            preferred_growth_sections: layoutConstraints.growthZone.preferred_growth_sections,
            target_px_distribution: sectionTargets,
            needsAIExpand,
            needsAICompress,
            overflowPx: emptySpace.overflowPx,
            remainingSpacePx: emptySpace.remainingSpacePx,
            fillRatio: emptySpace.fillRatio,
            isTwoCol: emptySpace.isTwoCol
        };

        return layoutOptimizationPlan;
    },

    // Stage 6 — Intelligent Section Redistribution Planner
    planSectionRedistribution(resumeData, containerEl, templateId) {
        if (!['creative','minimalPro','elegantBeige','diagonal','boldBlue','campusClub','campusAchiever','doublePanel'].includes(templateId)) {
            return {};
        }

        const getSecHeight = (key, text) => {
            if (!text || !text.trim()) return 0;
            if (containerEl) {
                const sec = Array.from(containerEl.querySelectorAll('[class*="-section"]')).find(el => {
                    const t = el.querySelector('[class*="-title"]')?.textContent || '';
                    return t.toLowerCase().includes(key);
                });
                if (sec) return Math.round(sec.getBoundingClientRect().height || 80);
            }
            return Math.round((text.length / 45) * 16 + 30);
        };

        const eduH = (resumeData.college ? 110 : 0) + (resumeData.interSchool ? 50 : 0) + (resumeData.highSchool ? 50 : 0) || 100;
        const certH = getSecHeight('certif', resumeData.certifications);
        const achvH = getSecHeight('achiev', resumeData.achievements);
        const langH = getSecHeight('langua', resumeData.languages);
        const intH  = getSecHeight('interest', resumeData.additionalInfo);

        const fixedLeftH = 170 + (resumeData.summary ? (resumeData.summary.length / 30) * 16 : 80) + ((resumeData.skills || []).length * 10);
        const fixedRightH = (resumeData.experience ? (resumeData.experience.length / 65) * 16 : 150) + (resumeData.projects ? (resumeData.projects.length / 65) * 16 : 150);

        const candidates = [
            { education: 'right', certifications: 'right', achievements: 'left', languages: 'left',  additionalInfo: 'left' },
            { education: 'right', certifications: 'left',  achievements: 'left', languages: 'left',  additionalInfo: 'left' },
            { education: 'left',  certifications: 'right', achievements: 'left', languages: 'left',  additionalInfo: 'left' },
            { education: 'left',  certifications: 'left',  achievements: 'left', languages: 'left',  additionalInfo: 'left' },
            { education: 'right', certifications: 'right', achievements: 'right',languages: 'left',  additionalInfo: 'left' }
        ];

        let bestCand = candidates[0];
        let minDiff = 9999;

        candidates.forEach(cand => {
            let leftSum = fixedLeftH;
            let rightSum = fixedRightH;

            if (cand.education === 'left') leftSum += eduH; else rightSum += eduH;
            if (cand.certifications === 'left') leftSum += certH; else rightSum += certH;
            if (cand.achievements === 'left') leftSum += achvH; else rightSum += achvH;
            if (cand.languages === 'left') leftSum += langH; else rightSum += langH;
            if (cand.additionalInfo === 'left') leftSum += intH; else rightSum += intH;

            const diff = Math.abs(leftSum - rightSum);
            if (diff < minDiff) {
                minDiff = diff;
                bestCand = cand;
            }
        });

        gSectionPlacementOverrides = bestCand;
        return gSectionPlacementOverrides;
    },

    // Stage 7 — AI Content Optimizer with Structured Metadata
    async runAIContentOptimization(currentText, layoutPlan, target) {
        const prompt = `You are an elite Constraint-Based AI Layout Intelligence Engine. Optimize the provided resume text to strictly satisfy layout metadata constraints.

LAYOUT METADATA & CONSTRAINTS:
${JSON.stringify(layoutPlan, null, 2)}

STRATEGY DIRECTIVES FOR "${layoutPlan.fill_strategy}":
- IF "SIDEBAR_FILL_MODE": Focus expansion strictly on sidebar sections: Summary/About Me, Skills, Certifications, Achievements, Languages. Expand About Me into a rich 120-170 word profile. Group raw skills into categorized domain groups (e.g. Programming, Web Technologies, Developer Tools, Databases). Format Certifications with issuer & year info. Elaborate single-line achievements into multi-line impact statements. Do NOT inflate main column sections.
- IF "MAIN_FILL_MODE": Focus expansion on Projects, Work Experience, and Summary.
- IF "PAGE_FILL_MODE": Proportionally elaborate Summary, Projects, Experience, and Skills across the single column.
- IF "COMPACT_MODE": Compress text cleanly to cut ${layoutPlan.target_px_distribution.projects || 60}px while preserving 100% of ATS keywords, tools, and technical facts.

STRICT ACCURACY RULES:
1. NEVER invent false facts, degrees, job titles, companies, dates, skills, or metrics.
2. Maintain ALL CAPS section headers verbatim. Return ONLY plain text resume.

ORIGINAL RESUME:
${currentText}`;

        const response = await fetch('/api/ai-write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: 'constraintOptimization', context: prompt })
        });

        if (!response.ok) throw new Error('AI optimization request failed');
        const resData = await response.json();
        return resData.content;
    },

    // Stage 8 — Typography & Spacing Optimizer
    optimizeTypographyAndSpacing(containerEl, layoutPlan) {
        if (!containerEl) return { fontScale: 1, lineHeights: 1.6 };

        let fontScale = 1.0;
        let lineHeights = 1.6;
        let sectionGap = 22;
        let itemGap = 11;
        let paddingScale = 1.0;

        if (layoutPlan.fill_strategy === 'COMPACT_MODE') {
            fontScale = 0.86;
            lineHeights = 1.32;
            sectionGap = 10;
            itemGap = 5;
            paddingScale = 0.78;
        } else if (layoutPlan.fill_strategy === 'SIDEBAR_FILL_MODE' || layoutPlan.fill_strategy === 'MAIN_FILL_MODE' || layoutPlan.fill_strategy === 'PAGE_FILL_MODE') {
            fontScale = 1.03;
            lineHeights = 1.68;
            sectionGap = 26;
            itemGap = 14;
            paddingScale = 1.08;
        }

        containerEl.style.setProperty('--font-scale', fontScale);
        containerEl.style.setProperty('--line-height', lineHeights);
        containerEl.style.setProperty('--section-gap', `${sectionGap}px`);
        containerEl.style.setProperty('--item-gap', `${itemGap}px`);
        containerEl.style.setProperty('--padding-scale', paddingScale);

        return { fontScale, lineHeights, sectionGap, itemGap, paddingScale };
    },

    // Stage 9 — Pagination & Layout Integrity Optimizer
    optimizePaginationAndIntegrity(containerEl) {
        if (!containerEl) return;

        const headings = containerEl.querySelectorAll('[class*="-section-title"], .mc-title-col');
        headings.forEach(h => {
            const rect = h.getBoundingClientRect();
            const parentRect = containerEl.getBoundingClientRect();
            const bottomMargin = parentRect.bottom - rect.bottom;
            if (bottomMargin > 0 && bottomMargin < 35) {
                h.style.pageBreakBefore = 'always';
            }
        });
    },

    // Stage 10 — Visual Quality Scorer & Real-Time Report Renderer
    calculateVisualQualityScore(emptySpace, layoutPlan, typographyState) {
        let colScore = 25;
        if (emptySpace.isTwoCol) {
            colScore = Math.max(0, Math.round(25 * (1 - (emptySpace.deltaPx / 60))));
        }

        let fillScore = 35;
        const ratio = emptySpace.fillRatio;
        if (ratio >= 0.88 && ratio <= 0.95) fillScore = 35;
        else if (ratio < 0.88) fillScore = Math.max(10, Math.round(35 * (ratio / 0.88)));
        else fillScore = Math.max(0, Math.round(35 * (1 - (ratio - 0.95) * 4)));

        let overflowScore = emptySpace.overflowPx === 0 ? 25 : Math.max(0, 25 - Math.round(emptySpace.overflowPx / 4));
        let typoScore = 15;

        const totalScore = Math.min(100, colScore + fillScore + overflowScore + typoScore);

        return {
            totalScore,
            colScore,
            fillScore,
            overflowScore,
            typoScore,
            metrics: emptySpace
        };
    },

    renderLayoutIntelligenceReport(layoutPlan, qualityResult, target) {
        const reportEl = document.getElementById(target === 'enh' ? 'layoutReport_enh' : 'layoutReport_scratch');
        const badgeEl = document.getElementById(target === 'enh' ? 'optBadge_enh' : 'optBadge_scratch');

        if (!reportEl) return;
        reportEl.classList.remove('hidden');

        const strategyNames = {
            'SIDEBAR_FILL_MODE': '⚡ Sidebar Fill Mode',
            'MAIN_FILL_MODE': '⚡ Main Fill Mode',
            'PAGE_FILL_MODE': '⚡ Page Fill Mode',
            'COMPACT_MODE': '✂️ Compact Mode',
            'BALANCED_MODE': '✨ Balanced Fit'
        };

        if (badgeEl) {
            badgeEl.innerHTML = strategyNames[layoutPlan.fill_strategy] || 'Auto-Fit';
        }

        const planItems = Object.entries(layoutPlan.target_px_distribution || {})
            .filter(([_, px]) => px > 0)
            .map(([sec, px]) => `<li>Expand <strong>${sec.toUpperCase()}</strong>: +${px}px</li>`)
            .join('');

        reportEl.innerHTML = `
            <div class="lir-header">
                <span>Layout Intelligence Report</span>
                <span class="lir-strategy-tag">${strategyNames[layoutPlan.fill_strategy] || layoutPlan.fill_strategy}</span>
            </div>
            <div class="lir-grid">
                <div class="lir-item"><span>Page Utilization:</span> <span class="lir-val">${layoutPlan.page_utilization_pct}%</span></div>
                <div class="lir-item"><span>Column Delta:</span> <span class="lir-val">${layoutPlan.column_difference_px}px</span></div>
                <div class="lir-item"><span>Sidebar Fill:</span> <span class="lir-val">${layoutPlan.sidebar_fill_pct}%</span></div>
                <div class="lir-item"><span>Main Fill:</span> <span class="lir-val">${layoutPlan.main_fill_pct}%</span></div>
            </div>
            ${planItems ? `
                <div class="lir-plan-title">Targeted Optimization Plan:</div>
                <ul class="lir-plan-list">${planItems}</ul>
            ` : ''}
        `;
    },

    // MASTER ITERATIVE OPTIMIZATION LOOP
    async runIterativeOptimizationPipeline(target, mode = 'balanced', options = {}) {
        const sheet = target === 'enh' ? els.enhResumeSheet : els.resumeSheet;
        const textarea = target === 'enh' ? els.enhEditTextarea : els.editTextarea;
        const btn = document.getElementById(target === 'enh' ? 'btnOptimizeContent_enh' : 'btnOptimizeContent_scratch');
        const currentText = textarea.value || state.resumeText;

        if (!currentText || !currentText.trim()) {
            showToast('No resume content to optimize.');
            return;
        }

        const templateId = state.formData.selectedTemplate || 'modern';
        const origBtnText = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-brain fa-spin"></i> Analyzing Geometry...'; }

        showToast('Initializing Layout Intelligence Engine...');

        try {
            let pass = 1;
            const maxPasses = 3;
            let finalScore = 0;
            let currentResumeText = currentText;
            let layoutPlan = null;
            let scoreResult = null;

            while (pass <= maxPasses) {
                // Parse & Render current draft
                const resumeData = parseResumeText(currentResumeText);
                state.generatedHTML = buildResumeHTML(resumeData, templateId);
                sheet.innerHTML = state.generatedHTML;
                await new Promise(r => setTimeout(r, 40));

                // Stage 1: Layout Constraints & Growth Zones
                const layoutConstraints = this.analyzeLayoutConstraints(templateId, sheet);

                // Stage 2: Real DOM Empty Space Measurement
                const emptySpace = this.analyzeEmptySpace(sheet, layoutConstraints);

                // Stage 3: Content Density
                const densitySections = this.analyzeContentDensity(sheet);

                // Stage 4: Section Capacities
                const capacities = this.analyzeSectionCapacities(resumeData, densitySections);

                // Stage 5: Strategy Selector & Layout Optimization Plan Generator
                layoutPlan = this.solveConstraints(emptySpace, capacities, layoutConstraints, mode);

                // Stage 6: Section Redistribution (Pass 1)
                if (emptySpace.isTwoCol && pass === 1) {
                    this.planSectionRedistribution(resumeData, sheet, templateId);
                    state.generatedHTML = buildResumeHTML(resumeData, templateId);
                    sheet.innerHTML = state.generatedHTML;
                    await new Promise(r => setTimeout(r, 40));
                }

                // Stage 8: Typography & Spacing Optimizer
                const typographyState = this.optimizeTypographyAndSpacing(sheet, layoutPlan);

                // Stage 9: Pagination Integrity
                this.optimizePaginationAndIntegrity(sheet);

                // Re-measure post spacing adjustment
                const reMeasuredSpace = this.analyzeEmptySpace(sheet, layoutConstraints);

                // Stage 10: Quality Score & Real-Time Report Rendering
                scoreResult = this.calculateVisualQualityScore(reMeasuredSpace, layoutPlan, typographyState);
                finalScore = scoreResult.totalScore;
                this.renderLayoutIntelligenceReport(layoutPlan, scoreResult, target);

                // Check termination condition
                if (finalScore >= 90 || (!layoutPlan.needsAIExpand && !layoutPlan.needsAICompress) || pass === maxPasses) {
                    showToast(`Layout Intelligence Complete! Quality Score: ${finalScore}/100 🎉`);
                    break;
                }

                // Stage 7: Layout Metadata-Driven AI Content Optimization (Pass 2)
                if (pass < maxPasses && (layoutPlan.needsAIExpand || layoutPlan.needsAICompress)) {
                    if (btn) btn.innerHTML = `<i class="fas fa-wand-magic-sparkles fa-spin"></i> ${layoutPlan.fill_strategy} (Pass ${pass + 1})...`;
                    showToast(`Pass ${pass}: AI executing ${layoutPlan.fill_strategy}...`);
                    const aiOptimizedText = await this.runAIContentOptimization(currentResumeText, layoutPlan, target);
                    if (aiOptimizedText && aiOptimizedText.length > 50) {
                        currentResumeText = aiOptimizedText;
                    }
                }

                pass++;
            }

            // Sync final state
            textarea.value = currentResumeText;
            state.resumeText = currentResumeText;
            const finalParsed = parseResumeText(currentResumeText);
            state.generatedHTML = buildResumeHTML(finalParsed, templateId);
            sheet.innerHTML = state.generatedHTML;

            const printSheet = document.getElementById('resumeSheetPrint');
            if (printSheet) printSheet.innerHTML = state.generatedHTML;

            showToast(`Layout Optimization Finished! Visual Quality Score: ${finalScore}/100`);

        } catch (err) {
            console.error('Layout Intelligence Engine error:', err);
            showToast('Layout Engine notice: Applied baseline column and spacing balance.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = origBtnText;
            }
        }
    }
};

async function runContentOptimization(target, mode) {
    return ConstraintLayoutEngine.runIterativeOptimizationPipeline(target, mode);
}

document.addEventListener('DOMContentLoaded', () => {
    const optBtnScratch = document.getElementById('btnOptimizeContent_scratch');
    const optModeScratch = document.getElementById('optimizeMode_scratch');
    if (optBtnScratch && optModeScratch) {
        optBtnScratch.addEventListener('click', (e) => {
            e.preventDefault();
            runContentOptimization('scratch', optModeScratch.value);
        });
    }

    const optBtnEnh = document.getElementById('btnOptimizeContent_enh');
    const optModeEnh = document.getElementById('optimizeMode_enh');
    if (optBtnEnh && optModeEnh) {
        optBtnEnh.addEventListener('click', (e) => {
            e.preventDefault();
            runContentOptimization('enh', optModeEnh.value);
        });
    }
});
