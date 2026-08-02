/* ============================================
   AI RESUME BUILDER v2.0 - JAVASCRIPT
   By Innoverse AMU | 2025
   ============================================ */

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    currentStep: 1,
    totalSteps: 4,  // 4-step scratch flow: Q→Details→Skills/Template→Preview
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
        title: '🏛️ Campus & Club',
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
        title: '💼 Internship & Job',
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
        title: '🎓 Academic & Research',
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
    cacheElements();
    initStepper();
    initQuizOptions();
    initPhotoUpload();
    initSkillsInput();
    initTemplateGrid();
    initNavigation();
    initZoomControls();
    initDownloadButtons();
    initModal();
    initMobileMenu();
    initAIWriteButtons();
    initNavbarScroll();
    initAIEnhance();
    initSkillGap();
    initEntryFlow();
    initEnhanceSection();
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
                el?.focus();
                return false;
            }
        }
        const email = document.getElementById('email').value;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Please enter a valid email address');
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

    els.templatesContainer.innerHTML = html;

    // Event listeners
    document.querySelectorAll('.tmpl-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.tmpl-btn-preview')) return;
            selectTemplate(card.dataset.template);
        });
    });
    document.querySelectorAll('.tmpl-btn-preview').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
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
        // targetRole is a short single-line job title — special handling
        if (existingVal) {
            prompt = `You are a professional resume writer. The user has written this job title/target role: "${existingVal}". Rewrite it as a clean, professional, ATS-optimized job title. Return ONLY the improved job title as a short phrase (3-5 words maximum). No explanations, no punctuation at the end, no quotes.`;
        } else {
            const skills = state.formData.skills.join(', ');
            prompt = `Suggest a professional job title for a resume based on these skills: "${skills || 'Software Development'}". Return ONLY a clean job title (3-5 words). No explanations or quotes.`;
        }
    } else if (existingVal) {
        prompt = `You are an expert resume writer. The user has written the following content for their resume field "${field}":\n"${existingVal}"\n\nPlease rewrite, restyle, and improve the English, grammar, professional tone, and ATS compatibility of this content. Do NOT invent any new accomplishments, projects, or credentials. Keep the core facts exactly the same, but present them in a highly polished, professional, and ATS-friendly manner. Return ONLY the improved text, with no headers, introductions, conversational filler, or formatting quotes.`;
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
            showToast(existingVal ? 'Content improved using AI! ✨' : 'AI content generated successfully!');
        }

    } catch (error) {
        console.error('AI generation error:', error);
        if (field === 'skillsInput') {
            showToast('Failed to generate skills using AI.');
        } else {
            const fallbackText = existingVal ? existingVal : generateFallbackText(field);
            if (targetEl) {
                targetEl.value = fallbackText;
                targetEl.dispatchEvent(new Event('input'));
            }
            showToast(existingVal ? 'Failed to improve text. Kept original.' : 'Used local AI fallback.');
        }
    } finally {
        btn.classList.remove('generating');
        btn.innerHTML = '<i class="fas fa-magic"></i>';
        els.aiGeneratingPopup.classList.remove('active');
    }
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
    document.getElementById('modalOverlay').addEventListener('click', closeModal);
    document.getElementById('modalClose').addEventListener('click', closeModal);
}

function openTemplatePreview(templateId) {
    const t = allTemplates.find(t => t.id === templateId);
    els.modalTitle.textContent = t.name + ' - Preview';
    els.modalResume.innerHTML = buildResumeHTML(sampleData, templateId, true);
    els.templateModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
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
    els.templateModal.classList.remove('active');
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
        gradYear: document.getElementById('gradYear').value,
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
        text += `EDUCATION\n${p.college}\n${p.degree}\nExpected Graduation: ${p.gradYear}\n\n`;
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
        text += `EDUCATION\n${p.college}\n${p.degree}\nExpected Graduation: ${p.gradYear}\n\n`;
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
        text += `EDUCATION\n${p.college}\n${p.degree}\nExpected Graduation: ${p.gradYear}\n`;
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
// PARSE RESUME TEXT
// ============================================
function parseResumeText(text) {
    const data = {};
    const sections = text.split(/\n(?=[A-Z][A-Z\s]+\n)/);
    sections.forEach(section => {
        const lines = section.trim().split('\n');
        const title = lines[0].trim();
        const content = lines.slice(1).join('\n').trim();
        const key = title.toLowerCase().replace(/\s+/g, '');
        if (title === 'NAME') data.fullName = content;
        else if (title === 'CONTACT') {
            const contactLines = content.split('\n');
            contactLines.forEach(line => {
                if (line.includes('Email:')) data.email = line.replace('Email:', '').trim();
                if (line.includes('Phone:')) data.phone = line.replace('Phone:', '').trim();
                if (line.includes('Location:')) data.location = line.replace('Location:', '').trim();
                if (line.includes('LinkedIn:')) data.linkedin = line.replace('LinkedIn:', '').trim();
                if (line.includes('GitHub:')) data.github = line.replace('GitHub:', '').trim();
                if (line.includes('Languages:')) data.languages = line.replace('Languages:', '').trim();
            });
        }
        else if (key.includes('summary') || key.includes('about') || key.includes('profile')) data.summary = content;
        else if (key.includes('education')) data.education = content;
        else if (key.includes('skill')) data.skillsText = content;
        else if (key.includes('project')) data.projects = content;
        else if (key.includes('experience') || key.includes('work')) data.experience = content;
        else if (key.includes('certif')) data.certifications = content;
        else if (key.includes('achievement')) data.achievements = content;
        else if (key.includes('research')) data.research = content;
        else if (key.includes('coursework')) data.coursework = content;
        else if (key.includes('motivation') || key.includes('join')) data.motivation = content;
        else if (key.includes('involvement')) data.campusInvolvement = content;
        else if (key.includes('language') && !data.languages) data.languages = content;
        else if (key.includes('ref')) data.references = content;
        data[title] = content;
    });

    const p = state.formData.personalDetails;
    if (p) {
        data.fullName = data.fullName || p.fullName;
        data.email = data.email || p.email;
        data.phone = data.phone || p.phone;
        data.location = data.location || p.location;
        data.college = p.college;
        data.degree = p.degree;
        data.gradYear = p.gradYear;
        data.undergradGpa = p.undergradGpa || '';
        data.interSchool = p.interSchool || '';
        data.interGpa = p.interGpa || '';
        data.interBoard = p.interBoard || '';
        data.interYear = p.interYear || '';
        data.highSchool = p.highSchool || '';
        data.highGpa = p.highGpa || '';
        data.highBoard = p.highBoard || '';
        data.highYear = p.highYear || '';
        data.dob = p.dob || '';
        data.additionalInfo = p.additionalInfo || '';
        data.linkedin = data.linkedin || p.linkedin;
        data.github = data.github || p.github;
        data.languages = data.languages || p.languages;
        data.photo = p.photo || '';
        data.targetRole = state.formData.targetRole || '';
    }
    data.references = data.references || state.formData.categoryFields?.references || '';

    if (data.skillsText) {
        data.skills = data.skillsText.split(/[,\n]+/).map(s => s.trim()).filter(s => s);
    } else if (state.formData.skills?.length > 0) {
        data.skills = state.formData.skills;
    }
    return data;
}

// ============================================
// BUILD RESUME HTML
// ============================================
function getContentDensity(data) {
    let score = 0;
    if (data.summary && data.summary.trim().length > 0) score += Math.min(data.summary.trim().length / 50, 5);
    if (data.experience && data.experience.trim().length > 0) score += Math.min(data.experience.trim().length / 80, 6);
    if (data.projects && data.projects.trim().length > 0) score += Math.min(data.projects.trim().length / 80, 6);
    if (data.education && data.education.trim().length > 0) score += Math.min(data.education.trim().length / 60, 4);
    if (data.skills && data.skills.length > 0) score += Math.min(data.skills.length * 0.5, 6);
    if (data.certifications && data.certifications.trim().length > 0) score += 3;
    if (data.achievements && data.achievements.trim().length > 0) score += 3;
    if (data.campusInvolvement && data.campusInvolvement.trim().length > 0) score += 3;
    
    if (score < 10) return 'low';
    if (score > 16) return 'high';
    return 'medium';
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
 * Balances columns for two-panel templates by shuffling moveable sections.
 * left  = array of section objects { key, label, score, html }
 * right = array of section objects { key, label, score, html }
 */
function balanceDualPanelSections(data) {
    // Estimated characters per line before wrapping
    const LEFT_COL_CHARS = 32;
    const RIGHT_COL_CHARS = 65;

    // Left column always has: contact, skills, education
    const fixedLeftScore =
        5 + // contact block constant
        estimateSectionLines((data.skills || []).join('\n'), LEFT_COL_CHARS) * 1.5 +
        estimateSectionLines(data.college, LEFT_COL_CHARS) * 1.5;

    // Right column always has: summary, experience, projects
    const fixedRightScore =
        estimateSectionLines(data.summary, RIGHT_COL_CHARS) +
        estimateSectionLines(data.experience, RIGHT_COL_CHARS) * 1.2 +
        estimateSectionLines(data.projects, RIGHT_COL_CHARS) * 1.2;

    // All moveable sections with default preferred side
    const moveables = [
        { key: 'certifications', label: 'Certifications:', text: data.certifications, side: 'right' },
        { key: 'achievements',   label: 'Achievements:',   text: data.achievements,   side: 'right' },
        { key: 'languages',      label: 'Languages:',      text: data.languages,       side: 'left'  },
        { key: 'additionalInfo', label: 'Additional Info:', text: data.additionalInfo, side: 'left'  },
    ].map(m => ({
        ...m,
        scoreLeft: estimateSectionLines(m.text, LEFT_COL_CHARS),
        scoreRight: estimateSectionLines(m.text, RIGHT_COL_CHARS)
    }));

    let leftScore  = fixedLeftScore  + moveables.filter(m => m.side === 'left') .reduce((a, m) => a + m.scoreLeft, 0);
    let rightScore = fixedRightScore + moveables.filter(m => m.side === 'right').reduce((a, m) => a + m.scoreRight, 0);

    // Greedily rebalance
    const THRESHOLD = 4;
    let pass = 0;
    while (pass++ < 10) {
        let changed = false;
        for (const m of moveables) {
            if (m.scoreRight < 1) continue;
            const diff = rightScore - leftScore;
            // if right is too heavy, move a right item to left
            if (diff > THRESHOLD && m.side === 'right') {
                m.side = 'left'; rightScore -= m.scoreRight; leftScore += m.scoreLeft; changed = true;
            }
            // if left is too heavy, move a left item to right
            else if (diff < -THRESHOLD && m.side === 'left') {
                m.side = 'right'; leftScore -= m.scoreLeft; rightScore += m.scoreRight; changed = true;
            }
        }
        if (!changed) break;
    }

    return moveables;
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
    const skillsListHTML = (data.skills || []).map(s => `• ${s}`).join('<br>');

    // Elegant Beige specific skills ratings
    const skillsDotsHTML = (data.skills || []).map((s, idx) => {
        const ratings = [5, 4, 3, 5, 4];
        const rating = ratings[idx % ratings.length];
        let dots = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) dots += '<span class="eb-dot active">●</span>';
            else dots += '<span class="eb-dot">○</span>';
        }
        return `<div class="eb-skill-row"><span class="eb-skill-name">${s}</span><span class="eb-skill-dots">${dots}</span></div>`;
    }).join('');

    const density = getContentDensity(data);
    const densityClass = `density-${density}`;

    const section = (title, content) => {
        if (!content || !content.trim()) return '';
        return `<div class="${prefix}-section"><div class="${prefix}-section-title">${title}</div><div class="${prefix}-content">${content.replace(/\n/g, '<br>')}</div></div>`;
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
                        <span class="${prefix}-edu-gpa">${data.undergradGpa || ''} | ${data.degree} (${data.gradYear})</span>
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
            const sidebarHTML = `
                <div class="cr-sidebar">
                    <div class="cr-photo-wrap">${photoHTML}</div>
                    ${section('Contact', contactVerticalHTML)}
                    <div class="cr-section">
                        <div class="cr-section-title">Expertise / Core Skills</div>
                        <div class="cr-content">${skillsHTML}</div>
                    </div>
                    ${section('Languages', data.languages)}
                    ${data.additionalInfo ? section('Interests', data.additionalInfo) : ''}
                </div>
            `;
            const mainHTML = `
                <div class="cr-main">
                    <div class="cr-banner">
                        <div class="cr-name">${data.fullName || 'Your Name'}</div>
                        <div class="cr-role">${data.targetRole || 'Creative Professional'}</div>
                    </div>
                    <div class="cr-right-content">
                        ${section('About Me', data.summary)}
                        <div class="cr-section">
                            <div class="cr-section-title">Education</div>
                            <div class="cr-content">${getStructuredEducationHTML('cr', false)}</div>
                        </div>
                        ${section('Experience', data.experience)}
                        ${section('Projects', data.projects)}
                        ${section('Certifications', data.certifications)}
                        ${section('Achievements', data.achievements)}
                    </div>
                </div>
            `;
            outputHTML = `<div class="cr-resume ${densityClass}">${sidebarHTML}${mainHTML}</div>`;
            break;
        }
        case 'minimalPro': {
            const sidebarHTML = `
                <div class="mp-sidebar">
                    <div class="mp-photo-wrap">${photoHTML}</div>
                    ${section('Contact', contactVerticalHTML)}
                    <div class="mp-section">
                        <div class="mp-section-title">Programs / Skills</div>
                        <div class="mp-content">${skillsHTML}</div>
                    </div>
                    ${section('Languages', data.languages)}
                    ${data.dob ? section('Date of Birth', data.dob) : ''}
                    ${data.additionalInfo ? section('Additional Info', data.additionalInfo) : ''}
                </div>
            `;
            const mainHTML = `
                <div class="mp-main">
                    <div class="mp-header">
                        <div class="mp-name">${data.fullName || 'Your Name'}</div>
                        <div class="mp-role">${data.targetRole || 'Professional'}</div>
                    </div>
                    ${section('About Me', data.summary)}
                    <div class="mp-section">
                        <div class="mp-section-title">Education</div>
                        <div class="mp-content">${getStructuredEducationHTML('mp', true)}</div>
                    </div>
                    ${section('Work Experience', data.experience)}
                    ${section('Projects', data.projects)}
                    ${section('Certifications', data.certifications)}
                    ${section('Achievements', data.achievements)}
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
            const sidebarHTML = `
                <div class="eb-sidebar">
                    ${section('Contact', contactVerticalHTML)}
                    <div class="eb-section">
                        <div class="eb-section-title">Skills</div>
                        <div class="eb-content">${skillsDotsHTML}</div>
                    </div>
                    ${section('Languages', data.languages)}
                </div>
            `;
            const mainHTML = `
                <div class="eb-main">
                    ${headerCardHTML}
                    ${section('Professional Summary', data.summary)}
                    <div class="eb-section">
                        <div class="eb-section-title">Education</div>
                        <div class="eb-content">${getStructuredEducationHTML('eb', true)}</div>
                    </div>
                    ${section('Experience', data.experience)}
                    ${section('Projects', data.projects)}
                    ${section('Certifications', data.certifications)}
                    ${section('Achievements', data.achievements)}
                    ${section('References', data.references)}
                </div>
            `;
            outputHTML = `<div class="eb-resume ${densityClass}">${sidebarHTML}${mainHTML}</div>`;
            break;
        }
        case 'diagonal': {
            const sidebarHTML = `
                <div class="dg-sidebar">
                    <div class="dg-photo-wrap">${photoHTML}</div>
                    <div class="dg-diagonal-divider"></div>
                    <div class="dg-sidebar-content">
                        ${section('Contact', contactVerticalHTML)}
                        <div class="dg-section">
                            <div class="dg-section-title">Skills</div>
                            <div class="dg-content">${skillsHTML}</div>
                        </div>
                        ${section('Languages', data.languages)}
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
                    <div class="dg-section">
                        <div class="dg-section-title">Education</div>
                        <div class="dg-content">${getStructuredEducationHTML('dg', false)}</div>
                    </div>
                    ${section('Experience', data.experience)}
                    ${section('Projects', data.projects)}
                    ${section('Certifications', data.certifications)}
                    ${section('Awards', data.achievements)}
                </div>
            `;
            outputHTML = `<div class="dg-resume ${densityClass}">${sidebarHTML}${mainHTML}</div>`;
            break;
        }
        case 'dualPanel': {
            const dpSkillsRows = (data.skills || []).map((s, idx) => {
                const pcts = [90, 87, 95, 84, 92, 88, 91];
                return `<div class="dp-skill-row"><span>${s}</span><span>${pcts[idx % pcts.length]}%</span></div>`;
            }).join('');

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
                                <div class="dp-lsection">
                                    <div class="dp-pill-label">Languages:</div>
                                    <div class="dp-lcontent">${makeDpLanguageHTML()}</div>
                                </div>
                                <div class="dp-contact-block">
                                    ${contactVerticalHTML}
                                </div>
                            </div>
                        </div>
                        <div class="dp-right">
                            <div class="dp-rsection">
                                <div class="dp-pill-label">Education:</div>
                                <div class="dp-rcontent">${getStructuredEducationHTML('dp', true)}</div>
                            </div>
                            ${data.experience && data.experience.trim() ? `<div class="dp-rsection"><div class="dp-pill-label">Experience:</div><div class="dp-rcontent">${data.experience.replace(/\n/g, '<br>')}</div></div>` : ''}
                            ${data.projects && data.projects.trim() ? `<div class="dp-rsection"><div class="dp-pill-label">Projects:</div><div class="dp-rcontent">${data.projects.replace(/\n/g, '<br>')}</div></div>` : ''}
                            ${data.certifications && data.certifications.trim() ? `<div class="dp-rsection"><div class="dp-pill-label">Certifications:</div><div class="dp-rcontent">${data.certifications.replace(/\n/g, '<br>')}</div></div>` : ''}
                            ${data.achievements && data.achievements.trim() ? `<div class="dp-rsection"><div class="dp-pill-label">Achievements:</div><div class="dp-rcontent">${data.achievements.replace(/\n/g, '<br>')}</div></div>` : ''}
                        </div>
                    </div>
                </div>
            `;
            break;
        }
        case 'campusClub': {
            const sidebarHTML = `
                <div class="cc-sidebar">
                    <div class="cc-photo-wrap">${photoHTML}</div>
                    ${section('Contact', contactVerticalHTML)}
                    <div class="cc-section">
                        <div class="cc-section-title">Skills</div>
                        <div class="cc-content">${skillsHTML}</div>
                    </div>
                    ${section('Languages', data.languages)}
                    ${data.additionalInfo ? section('Interests', data.additionalInfo) : ''}
                </div>
            `;
            const mainHTML = `
                <div class="cc-main">
                    <div class="cc-header">
                        <div class="cc-name">${data.fullName || 'Your Name'}</div>
                        <div class="cc-applying">${data.targetRole || 'Campus Club Member'}</div>
                    </div>
                    ${section('Why I Want To Join', data.motivation)}
                    <div class="cc-section">
                        <div class="cc-section-title">Education</div>
                        <div class="cc-content">${getStructuredEducationHTML('cc', false)}</div>
                    </div>
                    ${section('Relevant Coursework', data.coursework)}
                    ${section('Previous Club Experience', data.campusInvolvement)}
                    ${section('Projects & Contributions', data.projects)}
                    ${section('Achievements', data.achievements)}
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
                            <div class="cm-applying">${data.targetRole || 'Campus Role'}</div>
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
                        <div class="cm-edu-gpa">${data.undergradGpa || ''} (${data.gradYear || ''})</div>
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
            const sidebarHTML = `
                <div class="ca-sidebar">
                    <div class="ca-photo-wrap">${photoHTML}</div>
                    <div class="ca-section">
                        <div class="ca-section-title">Skills</div>
                        <div class="ca-content">${skillsHTML}</div>
                    </div>
                    ${section('Languages', data.languages)}
                    ${section('Contact', contactVerticalHTML)}
                </div>
            `;
            const mainHTML = `
                <div class="ca-main">
                    <div class="ca-header">
                        <div class="ca-name">${data.fullName || 'Your Name'}</div>
                        <div class="ca-status">Current Status: ${state.formData.year || 'Student'} · ${data.degree || ''}</div>
                    </div>
                    ${section('About Me', data.summary)}
                    <div class="ca-section">
                        <div class="ca-section-title">Education</div>
                        <div class="ca-content">${getStructuredEducationHTML('ca', true)}</div>
                    </div>
                    ${section('Why I Want To Join', data.motivation)}
                    ${section('Campus Involvement', data.campusInvolvement)}
                    ${section('Achievements', data.achievements)}
                </div>
            `;
            outputHTML = `<div class="ca-resume ${densityClass}">${sidebarHTML}${mainHTML}</div>`;
            break;
        }
        case 'boldBlue': {
            const sidebarHTML = `
                <div class="bb-sidebar">
                    <div class="bb-photo-wrap">${photoHTML}</div>
                    ${section('Contact', contactVerticalHTML)}
                    <div class="bb-section">
                        <div class="bb-section-title">Expertise</div>
                        <div class="bb-content">${skillsHTML}</div>
                    </div>
                    ${section('Languages', data.languages)}
                </div>
            `;
            const mainHTML = `
                <div class="bb-main">
                    <div class="bb-banner">
                        <div class="bb-name">${data.fullName || 'Your Name'}</div>
                        <div class="bb-role">${data.targetRole || 'Professional'}</div>
                    </div>
                    <div class="bb-right-content">
                        ${section('About Me', data.summary)}
                        <div class="bb-section">
                            <div class="bb-section-title">Education</div>
                            <div class="bb-content">${getStructuredEducationHTML('bb', true)}</div>
                        </div>
                        ${section('Work Experience', data.experience)}
                        ${section('Projects', data.projects)}
                        ${section('Certifications', data.certifications)}
                        ${section('Achievements', data.achievements)}
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
                        <div class="cl-content">${(data.skills || []).join(', ')}</div>
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
    els.zoomLevel.textContent = Math.round(state.zoom * 100) + '%';
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
// DOWNLOAD — Single Source of Truth Export Engine
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
 * Uses the SAME HTML string as the preview — single source of truth.
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

async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    showToast('Preparing PDF…');

    const { clone, cleanup } = createExportClone();

    try {
        // Wait for fonts, images, and CSS layout to settle
        await waitForReadyState(clone);

        // Capture the clone at 3x DPI for high-quality output
        const canvas = await html2canvas(clone, {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794,
            height: 1123,
            windowWidth: 794,
            windowHeight: 1123,
            logging: false,
            onclone: (doc) => {
                // Ensure the cloned element in html2canvas is also 794x1123
                const el = doc.querySelector('.export-clone');
                if (el) {
                    el.style.position = 'static';
                    el.style.left = '0';
                    el.style.top = '0';
                    el.style.width = '794px';
                    el.style.height = '1123px';
                    el.style.overflow = 'hidden';
                }
            }
        });

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW = 210;

        // How many A4 pages does the content span?
        const totalPxH = canvas.height;
        const pageHeightPx = Math.round(canvas.width * (297 / 210));
        const totalPages = Math.ceil(totalPxH / pageHeightPx);

        for (let pg = 0; pg < totalPages; pg++) {
            if (pg > 0) pdf.addPage();
            const srcY  = pg * pageHeightPx;
            const srcH  = Math.min(pageHeightPx, totalPxH - srcY);
            // Slice canvas into individual A4 pages
            const slice = document.createElement('canvas');
            slice.width  = canvas.width;
            slice.height = srcH;
            slice.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
            const sliceData = slice.toDataURL('image/png', 1.0);
            const sliceH = (srcH / canvas.width) * pageW;
            pdf.addImage(sliceData, 'PNG', 0, 0, pageW, sliceH);
        }

        pdf.save(`${state.formData.personalDetails.fullName || 'Resume'}_Resume.pdf`);
        showToast('PDF downloaded successfully!');
    } catch (err) {
        console.error('PDF generation failed:', err);
        showToast('PDF generation failed. Try JPG instead.');
    } finally {
        cleanup();
    }
}

async function downloadJPG() {
    showToast('Preparing JPG…');
    const { clone, cleanup } = createExportClone();

    try {
        await waitForReadyState(clone);

        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794,
            height: 1123,
            windowWidth: 794,
            windowHeight: 1123,
            logging: false,
            onclone: (doc) => {
                const el = doc.querySelector('.export-clone');
                if (el) {
                    el.style.position = 'static';
                    el.style.left = '0';
                    el.style.top = '0';
                    el.style.width = '794px';
                    el.style.height = '1123px';
                    el.style.overflow = 'hidden';
                }
            }
        });
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
    document.querySelectorAll('textarea').forEach(ta => ta.value = '');
    if (els.clubCategory) els.clubCategory.value = '';
    document.querySelectorAll('.quiz-opt').forEach(btn => btn.classList.remove('active'));
    if (els.skillsTags) els.skillsTags.innerHTML = '';
    if (els.photoImg) { els.photoImg.src = ''; els.photoImg.style.display = 'none'; }
    if (els.photoInitials) { els.photoInitials.style.display = 'flex'; els.photoInitials.textContent = '?'; }
    if (els.dynamicFields) Object.values(els.dynamicFields).forEach(el => el.classList.add('hidden'));
    if (els.campusClubFields) els.campusClubFields.classList.add('hidden');
    if (els.editTextarea) els.editTextarea.value = '';
    selectTemplate('modern');
    updateZoom(); updateStepper();

    // Show choice panel, hide everything else
    document.getElementById('choicePanel')?.classList.remove('hidden');
    document.getElementById('uploadPanel')?.classList.add('hidden');
    document.getElementById('mainStepper')?.classList.add('hidden');
    document.getElementById('skillGap')?.classList.add('hidden');
    document.getElementById('resumeEnhanceSection')?.classList.add('hidden');
    if (els.wizardSteps) {
        els.wizardSteps.forEach(el => {
            el.classList.remove('active');
            el.classList.add('hidden');
        });
    }

    // Reset upload panel state
    const pdfDropZone = document.getElementById('pdfDropZone');
    const uploadStatus = document.getElementById('uploadStatus');
    if (pdfDropZone) pdfDropZone.style.display = 'flex';
    if (uploadStatus) uploadStatus.style.display = 'none';

    window.scrollTo({ top: document.getElementById('builder').offsetTop - 80, behavior: 'smooth' });
    showToast('Started new blank resume project! 🚀');
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

    // Resume Builder direct link -> reset to blank project
    const mlBuilder = document.getElementById('mlBuilder');
    if (mlBuilder) {
        mlBuilder.addEventListener('click', () => {
            menu.classList.remove('active');
            resetBuilder();
        });
    }

    // Skill Gap Analyser direct link handler
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

    btn.disabled = true;
    const oldHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enhancing...';
    els.aiGeneratingPopup.classList.add('active');

    const role = state.formData.targetRole || parsed.targetRole || 'Professional';
    const degree = state.formData.personalDetails?.degree || parsed.degree || 'Degree Candidate';
    const presentSkills = (state.formData.skills && state.formData.skills.length > 0) ? state.formData.skills.join(', ') : (parsed.skills ? parsed.skills.join(', ') : 'Relevant Technologies');

    let prompt = '';
    if (!sectionVal) {
        // Section is missing — generate a fresh, tailored section for the candidate's target role
        if (sectionKey === 'certifications') {
            prompt = `You are a professional resume writer. The candidate is targeting the role "${role}" with skills in "${presentSkills}". The resume currently has NO Certifications section. Generate 2-3 industry-standard, realistic certifications relevant to a "${role}" position (e.g. AWS, Meta, Google, Microsoft, IBM, Coursera certificates). Format as concise bullet points or clean list. Return ONLY the new certifications list without intro or markdown blocks.`;
        } else if (sectionKey === 'achievements') {
            prompt = `You are a professional resume writer. The candidate is targeting the role "${role}". The resume has NO Achievements section. Generate 2-3 impressive, realistic academic or professional accomplishments/awards relevant to "${role}" with quantifiable metrics (e.g. hackathon winner, top rank, performance boost). Return ONLY the new achievements list without intro or markdown blocks.`;
        } else if (sectionKey === 'projects') {
            prompt = `You are a professional resume writer. The candidate is targeting the role "${role}". Generate 2 realistic, high-impact projects relevant to "${role}" featuring technologies "${presentSkills}". Format clearly with project titles, key features, and tools used. Return ONLY the projects text.`;
        } else if (sectionKey === 'experience') {
            prompt = `You are a professional resume writer. Generate realistic, relevant professional experience/internship bullet points for a "${role}" candidate. Include company role, responsibilities, and key achievements. Return ONLY the experience text.`;
        } else if (sectionKey === 'summary') {
            prompt = `You are a professional resume writer. Write a powerful, 2-3 sentence ATS-friendly professional summary for a "${role}" candidate specializing in "${presentSkills}". Return ONLY the summary text.`;
        } else if (sectionKey === 'skills') {
            prompt = `You are a professional resume writer. Generate 6-10 industry-standard technical skills for a "${role}" candidate as a comma-separated list. Return ONLY the comma-separated list.`;
        }
        showToast(`Generating new AI ${label} section for your resume... ✨`);
    } else {
        if (sectionKey === 'skills') {
            prompt = `You are a professional resume writer. Format, optimize, and expand this comma-separated list of skills for maximum ATS compatibility: "${sectionVal}". Add 2-3 relevant high-value industry-standard technical skills if applicable. Return ONLY the improved skills as a comma-separated list. No intro, no formatting, no conversational text.`;
        } else {
            prompt = `You are a professional resume writer. Enhance the following resume "${label}" section to sound highly professional, metrics-driven (where possible), grammatically perfect, and optimized for ATS keywords:\n\n"${sectionVal}"\n\nDo NOT invent new qualifications, companies, or credentials. Keep the core details exactly the same. Return ONLY the enhanced content, with no introductory text, conversational filler, markdown formatting, or headers.`;
        }
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
        showToast(`Updated ${label} section in your resume! ✨`);
    } catch (e) {
        console.error(e);
        showToast(`Failed to update ${label} section.`);
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
        showToast('Full resume enhanced successfully! 🚀');
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
    'data analyst': ['SQL', 'Excel', 'Python', 'Pandas', 'Tableau', 'Power BI', 'Statistics', 'Data Visualization', 'Data Cleaning']
};

const commonSkillsList = [
    'Python', 'Java', 'C++', 'C#', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'React', 'Angular', 'Vue', 'Node.js', 'Express',
    'Django', 'Flask', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'GitHub',
    'CI/CD', 'Linux', 'Data Structures', 'Algorithms', 'System Design', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
    'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Pandas', 'Numpy', 'Tableau', 'Power BI', 'Excel', 'Figma', 'Agile', 'Scrum', 'DevOps'
];

const courseRecommendations = {
    'python': [
        { name: 'Python Tutorial for Beginners – CodeWithHarry (Hindi)', platform: 'YouTube', rating: '8M+ views', url: 'https://www.youtube.com/watch?v=gfDE2a7MKjA', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'Python Full Course – Apna College (Hindi)', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/watch?v=ERCMXc8x7mc', price: 'Free', ytChannel: 'Apna College' },
        { name: '100 Days of Code: Python Bootcamp', platform: 'Udemy', rating: '4.7 ★ (180k reviews)', url: 'https://www.udemy.com/course/100-days-of-code/', price: 'Top Rated' },
        { name: 'Python for Everybody – Dr. Chuck', platform: 'Coursera', rating: '4.8 ★ (220k reviews)', url: 'https://www.coursera.org/specializations/python', price: 'Free to Audit' }
    ],
    'javascript': [
        { name: 'Namaste JavaScript – Akshay Saini (Hindi/English)', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP', price: 'Free', ytChannel: 'Akshay Saini' },
        { name: 'JavaScript Tutorial – CodeWithHarry (Hindi)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/watch?v=hKB-YGF14SY', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'The Complete JavaScript Course 2025', platform: 'Udemy', rating: '4.7 ★ (190k reviews)', url: 'https://www.udemy.com/course/the-complete-javascript-course/', price: 'Top Rated' }
    ],
    'typescript': [
        { name: 'TypeScript Full Course – Hitesh Choudhary (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=30LWjhZzg50', price: 'Free', ytChannel: 'Chai aur Code' },
        { name: 'TypeScript Tutorial – CodeWithHarry (Hindi)', platform: 'YouTube', rating: '800k+ views', url: 'https://www.youtube.com/watch?v=GinmHZ1jGBk', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'Understanding TypeScript', platform: 'Udemy', rating: '4.7 ★ (60k reviews)', url: 'https://www.udemy.com/course/understanding-typescript/', price: 'Best Seller' }
    ],
    'react': [
        { name: 'React JS Full Course – Hitesh Choudhary (Hindi)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige', price: 'Free', ytChannel: 'Chai aur Code' },
        { name: 'React JS – CodeWithHarry (Hindi)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=RGKi6LSPDLU', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'React – Thapa Technical (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=fOFVGCNxhEA', price: 'Free', ytChannel: 'Thapa Technical' },
        { name: 'React - The Complete Guide', platform: 'Udemy', rating: '4.6 ★ (150k reviews)', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', price: 'Best Seller' }
    ],
    'angular': [
        { name: 'Angular Tutorial – Thapa Technical (Hindi)', platform: 'YouTube', rating: '1.5M+ views', url: 'https://www.youtube.com/playlist?list=PLwGdqUZWnOp3Vqf1n8QjRMhqwM-j7HGkQ', price: 'Free', ytChannel: 'Thapa Technical' },
        { name: 'Angular – The Complete Guide', platform: 'Udemy', rating: '4.6 ★ (80k reviews)', url: 'https://www.udemy.com/course/the-complete-guide-to-angular-2/', price: 'Best Seller' }
    ],
    'vue': [
        { name: 'Vue JS Crash Course – Traversy Media', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/watch?v=Wy9q22isx3U', price: 'Free', ytChannel: 'Traversy Media' },
        { name: 'Vue - The Complete Guide', platform: 'Udemy', rating: '4.7 ★ (65k reviews)', url: 'https://www.udemy.com/course/vuejs-2-the-complete-guide/', price: 'Best Seller' }
    ],
    'node.js': [
        { name: 'Node.js Tutorial – Sheryians Coding School (Hindi)', platform: 'YouTube', rating: '1.5M+ views', url: 'https://www.youtube.com/watch?v=y18ubz7gOsQ', price: 'Free', ytChannel: 'Sheryians Coding School' },
        { name: 'Node.js Backend – Hitesh Choudhary (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_NS-ZAh6Rl8CIvX3', price: 'Free', ytChannel: 'Chai aur Code' },
        { name: 'NodeJS – The Complete Guide', platform: 'Udemy', rating: '4.7 ★ (100k reviews)', url: 'https://www.udemy.com/course/nodejs-the-complete-guide/', price: 'Best Seller' }
    ],
    'mongodb': [
        { name: 'MongoDB Tutorial – CodeWithHarry (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=oSIv-E60NiU', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'MongoDB – The Complete Developer Guide', platform: 'Udemy', rating: '4.6 ★ (45k reviews)', url: 'https://www.udemy.com/course/mongodb-the-complete-developers-guide/', price: 'Best Seller' }
    ],
    'django': [
        { name: 'Django Full Course – CodeWithHarry (Hindi)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/watch?v=JxzZxdht-XY', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'Python Django – The Practical Guide', platform: 'Udemy', rating: '4.7 ★ (25k reviews)', url: 'https://www.udemy.com/course/python-django-the-practical-guide/', price: 'Best Seller' }
    ],
    'flask': [
        { name: 'Flask Tutorial – CodeWithHarry (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=oA8brF3w5XQ', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'REST APIs with Flask & Python', platform: 'Udemy', rating: '4.7 ★ (30k reviews)', url: 'https://www.udemy.com/course/rest-api-flask-and-python/', price: 'Best Seller' }
    ],
    'machine learning': [
        { name: 'Machine Learning – CampusX (Hindi)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=ZftI2fEz0Fw', price: 'Free', ytChannel: 'CampusX' },
        { name: 'ML Tutorial – codebasics (Hindi/English)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/playlist?list=PLeo1K3hjS3uvCeTYTeyfe0-rN5r8zn9rw', price: 'Free', ytChannel: 'codebasics' },
        { name: 'Machine Learning Specialization – Andrew Ng', platform: 'Coursera', rating: '4.9 ★ (340k reviews)', url: 'https://www.coursera.org/specializations/machine-learning-introduction', price: 'Top Recommended' }
    ],
    'deep learning': [
        { name: 'Deep Learning – CampusX (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=1VSZtNYMntM', price: 'Free', ytChannel: 'CampusX' },
        { name: 'Deep Learning Specialization – Andrew Ng', platform: 'Coursera', rating: '4.9 ★ (150k reviews)', url: 'https://www.coursera.org/specializations/deep-learning', price: 'Top Recommended' }
    ],
    'data science': [
        { name: 'Data Science Full Course – CampusX (Hindi)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/playlist?list=PLKnIA16_RmvbAlyx4_rdtR66B7EHX5k3z', price: 'Free', ytChannel: 'CampusX' },
        { name: 'Data Science – codebasics (Hindi/English)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=3xw3SnFBRNs', price: 'Free', ytChannel: 'codebasics' },
        { name: 'Data Science A-Z', platform: 'Udemy', rating: '4.6 ★ (110k reviews)', url: 'https://www.udemy.com/course/datascience/', price: 'Best Seller' }
    ],
    'data structures': [
        { name: 'DSA Series – Striver/TakeUForward (Hindi/English)', platform: 'YouTube', rating: '6M+ views', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz', price: 'Free', ytChannel: 'take U forward' },
        { name: 'DSA in Java – Kunal Kushwaha (Hindi/English)', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ', price: 'Free', ytChannel: 'Kunal Kushwaha' },
        { name: 'DSA – Love Babbar (Hindi)', platform: 'YouTube', rating: '4M+ views', url: 'https://www.youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA', price: 'Free', ytChannel: 'Love Babbar' },
        { name: 'Master DSA: Interview Prep', platform: 'Udemy', rating: '4.7 ★ (85k reviews)', url: 'https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/', price: 'Best Seller' }
    ],
    'algorithms': [
        { name: 'Algorithms – Abdul Bari (English)', platform: 'YouTube', rating: '10M+ views', url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O', price: 'Free', ytChannel: 'Abdul Bari' },
        { name: 'Algorithms Specialization – Stanford', platform: 'Coursera', rating: '4.8 ★ (35k reviews)', url: 'https://www.coursera.org/specializations/algorithms', price: 'Free to Audit' }
    ],
    'system design': [
        { name: 'System Design – Gaurav Sen (English)', platform: 'YouTube', rating: '4M+ views', url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX', price: 'Free', ytChannel: 'Gaurav Sen' },
        { name: 'System Design – Shrayansh Jain (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=0163cssUxLA', price: 'Free', ytChannel: 'Shrayansh Jain' },
        { name: 'System Design Interview Guide', platform: 'Udemy', rating: '4.6 ★ (15k reviews)', url: 'https://www.udemy.com/course/system-design-interview-guide/', price: 'Highly Rated' }
    ],
    'sql': [
        { name: 'SQL Tutorial – CodeWithHarry (Hindi)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=hlGoQC332VM', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'SQL Full Course – Apna College (Hindi)', platform: 'YouTube', rating: '1.5M+ views', url: 'https://www.youtube.com/watch?v=7S_tz1z_5bA', price: 'Free', ytChannel: 'Apna College' },
        { name: 'The Complete SQL Bootcamp', platform: 'Udemy', rating: '4.7 ★ (170k reviews)', url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/', price: 'Best Seller' }
    ],
    'git': [
        { name: 'Git & GitHub – Kunal Kushwaha (Hindi/English)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/watch?v=apGV9Kg7ics', price: 'Free', ytChannel: 'Kunal Kushwaha' },
        { name: 'Git & GitHub Tutorial – CodeWithHarry (Hindi)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=gwWKnnCMQ5c', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'Git & GitHub Complete Guide', platform: 'Udemy', rating: '4.7 ★ (45k reviews)', url: 'https://www.udemy.com/course/git-and-github-complete-guide/', price: 'Best Seller' }
    ],
    'docker': [
        { name: 'Docker Tutorial – Abhishek Veeramalla (Hindi/English)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/playlist?list=PLdpzxOOAlwvIKMjOl0YEzAa9VhMusFnFt', price: 'Free', ytChannel: 'Abhishek Veeramalla' },
        { name: 'Docker Tutorial – TechWorld with Nana', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE', price: 'Free', ytChannel: 'TechWorld with Nana' },
        { name: 'Docker & Kubernetes: The Practical Guide', platform: 'Udemy', rating: '4.8 ★ (65k reviews)', url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', price: 'Best Seller' }
    ],
    'kubernetes': [
        { name: 'Kubernetes – Abhishek Veeramalla (Hindi/English)', platform: 'YouTube', rating: '1.5M+ views', url: 'https://www.youtube.com/playlist?list=PLdpzxOOAlwvIKMjOl0YEzAa9VhMusFnFt', price: 'Free', ytChannel: 'Abhishek Veeramalla' },
        { name: 'Kubernetes – TechWorld with Nana', platform: 'YouTube', rating: '4M+ views', url: 'https://www.youtube.com/watch?v=X48VuDVv0do', price: 'Free', ytChannel: 'TechWorld with Nana' },
        { name: 'CKA with Practice Tests', platform: 'Udemy', rating: '4.8 ★ (80k reviews)', url: 'https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/', price: 'Best Seller' }
    ],
    'devops': [
        { name: 'DevOps Zero to Hero – Abhishek Veeramalla (Hindi/English)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/playlist?list=PLdpzxOOAlwvIKMjOl0YEzAa9VhMusFnFt', price: 'Free', ytChannel: 'Abhishek Veeramalla' },
        { name: 'DevOps Bootcamp – TrainWithShubham (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=0Gh6kQSmUTE', price: 'Free', ytChannel: 'TrainWithShubham' },
        { name: 'DevOps Beginners to Advanced', platform: 'Udemy', rating: '4.7 ★ (35k reviews)', url: 'https://www.udemy.com/course/decodingdevops/', price: 'Best Seller' }
    ],
    'aws': [
        { name: 'AWS Zero to Hero – Abhishek Veeramalla (Hindi/English)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/playlist?list=PLdpzxOOAlwvIKMjOl0YEzAa9VhMusFnFt', price: 'Free', ytChannel: 'Abhishek Veeramalla' },
        { name: 'AWS Tutorial – Intellipaat (Hindi)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=k1RI5locZE4', price: 'Free', ytChannel: 'Intellipaat' },
        { name: 'Ultimate AWS Cloud Practitioner', platform: 'Udemy', rating: '4.7 ★ (140k reviews)', url: 'https://www.udemy.com/course/aws-certified-cloud-practitioner-new/', price: 'Top Rated' }
    ],
    'networking': [
        { name: 'Computer Networks – Gate Smashers (Hindi)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_', price: 'Free', ytChannel: 'Gate Smashers' },
        { name: 'Networking Full Course – Kunal Kushwaha (Hindi/English)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=IPvYjXCsTg8', price: 'Free', ytChannel: 'Kunal Kushwaha' }
    ],
    'c++': [
        { name: 'C++ Full Course – CodeWithHarry (Hindi)', platform: 'YouTube', rating: '8M+ views', url: 'https://www.youtube.com/watch?v=j8nAHeVKL08', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'C++ Tutorial – Apna College (Hindi)', platform: 'YouTube', rating: '4M+ views', url: 'https://www.youtube.com/watch?v=z9bZufPHFLU', price: 'Free', ytChannel: 'Apna College' },
        { name: 'DSA in C++ – Love Babbar (Hindi)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA', price: 'Free', ytChannel: 'Love Babbar' }
    ],
    'java': [
        { name: 'Java Full Course – CodeWithHarry (Hindi)', platform: 'YouTube', rating: '7M+ views', url: 'https://www.youtube.com/watch?v=UmnCZ7-9yDY', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'Java Full Course – Kunal Kushwaha (Hindi/English)', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/watch?v=rZ41y93P2Qo', price: 'Free', ytChannel: 'Kunal Kushwaha' },
        { name: 'Java Masterclass', platform: 'Udemy', rating: '4.7 ★ (120k reviews)', url: 'https://www.udemy.com/course/java-the-complete-java-developer-course/', price: 'Best Seller' }
    ],
    'html': [
        { name: 'HTML & CSS Full Course – CodeWithHarry (Hindi)', platform: 'YouTube', rating: '10M+ views', url: 'https://www.youtube.com/watch?v=BsDoLVMnmZs', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'HTML Full Course – Sheryians Coding School (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=k7ELO356Npo', price: 'Free', ytChannel: 'Sheryians Coding School' }
    ],
    'css': [
        { name: 'CSS Full Course – CodeWithHarry (Hindi)', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/watch?v=Edsxf_NBFrw', price: 'Free', ytChannel: 'CodeWithHarry' },
        { name: 'CSS Flexbox & Grid – Sheryians Coding School (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=jDDaOFr9nqQ', price: 'Free', ytChannel: 'Sheryians Coding School' }
    ],
    'tensorflow': [
        { name: 'TensorFlow – CampusX (Hindi)', platform: 'YouTube', rating: '500k+ views', url: 'https://www.youtube.com/watch?v=Mubj_fqiAv8', price: 'Free', ytChannel: 'CampusX' },
        { name: 'TensorFlow 2 & Keras – Daniel Bourke', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=tpCFfeUEGs8', price: 'Free', ytChannel: 'Daniel Bourke' }
    ],
    'figma': [
        { name: 'Figma UI/UX Design – DesignCourse', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/watch?v=jwCmIBJ8Jtc', price: 'Free', ytChannel: 'DesignCourse' },
        { name: 'UI/UX – Figma Masterclass', platform: 'Udemy', rating: '4.6 ★ (50k reviews)', url: 'https://www.udemy.com/course/learn-figma/', price: 'Best Seller' }
    ],
    'excel': [
        { name: 'Excel Tutorial – Trump Excel (English)', platform: 'YouTube', rating: '5M+ views', url: 'https://www.youtube.com/watch?v=Vl0H-qTclOg', price: 'Free', ytChannel: 'Trump Excel' },
        { name: 'Microsoft Excel – Zero to Hero', platform: 'Udemy', rating: '4.6 ★ (140k reviews)', url: 'https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/', price: 'Best Seller' }
    ],
    'power bi': [
        { name: 'Power BI Tutorial – codebasics (Hindi/English)', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/playlist?list=PLeo1K3hjS3uva8pk1FI3iK9kCOOS2bHIH', price: 'Free', ytChannel: 'codebasics' },
        { name: 'Microsoft Power BI Desktop', platform: 'Udemy', rating: '4.6 ★ (85k reviews)', url: 'https://www.udemy.com/course/microsoft-power-bi-up-running-with-power-bi-desktop/', price: 'Best Seller' }
    ],
    'tableau': [
        { name: 'Tableau Full Course – Simplilearn (English)', platform: 'YouTube', rating: '2M+ views', url: 'https://www.youtube.com/watch?v=TPMlZxRRaBQ', price: 'Free', ytChannel: 'Simplilearn' },
        { name: 'Tableau Training', platform: 'Udemy', rating: '4.5 ★ (50k reviews)', url: 'https://www.udemy.com/course/tableau10/', price: 'Best Seller' }
    ],
    'communication': [
        { name: 'Spoken English – Dhruv Rathee (Hindi)', platform: 'YouTube', rating: '4M+ views', url: 'https://www.youtube.com/watch?v=FSl0hU6iFac', price: 'Free', ytChannel: 'Dhruv Rathee' },
        { name: 'Public Speaking – TED on Coursera', platform: 'Coursera', rating: '4.8 ★ (30k reviews)', url: 'https://www.coursera.org/learn/public-speaking', price: 'Free to Audit' }
    ],
    'leadership': [
        { name: 'Leadership & Management – Great Learning (Hindi)', platform: 'YouTube', rating: '1M+ views', url: 'https://www.youtube.com/watch?v=N0RKHSt5MCw', price: 'Free', ytChannel: 'Great Learning' },
        { name: 'Leadership Development Specialization', platform: 'Coursera', rating: '4.8 ★ (50k reviews)', url: 'https://www.coursera.org/specializations/leadership-development-for-engineers', price: 'Free to Audit' }
    ],
    'marketing': [
        { name: 'Digital Marketing Full Course – Google Digital Garage', platform: 'YouTube', rating: '3M+ views', url: 'https://www.youtube.com/watch?v=VoX97altFMg', price: 'Free', ytChannel: 'Google Digital Garage' },
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

    showToast('Skill Gap Analyser ready! Enter your target role and click Analyse. 🎯');
}

// Close skill gap modal (scratch flow) — return to step 4 preview
function closeSkillGapModal() {
    const skillGap = document.getElementById('skillGap');
    skillGap.classList.add('hidden');
    skillGap.classList.remove('skill-gap-modal');
    // Scroll back to preview step
    window.scrollTo({ top: document.getElementById('builder').offsetTop - 100, behavior: 'smooth' });
}

function runGapAnalysis() {
    const roleInput = document.getElementById('gapRoleInput').value.trim();
    const jdInput = document.getElementById('gapJdInput').value.trim();

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
        // Default core skills if no role match
        reqSkills = ['Git', 'Communication', 'Problem Solving', 'Data Analysis', 'Project Management'];
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
    if (score >= 80) atsLabel = 'Excellent Fit 🚀';
    else if (score >= 60) atsLabel = 'Good Fit 👍';
    else if (score >= 40) atsLabel = 'Moderate Fit ⚠️';
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
        : '<p style="font-size:0.8rem;color:var(--gray);">No missing skills! You are a perfect match. 🎉</p>';

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
                    name: `${skill} Full Course (Hindi) – YouTube Search`,
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
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing Skill Gaps & Generating AI Roadmap...';
    roadmapBox.innerHTML = '<div class="roadmap-loading"><i class="fas fa-brain fa-spin"></i> AI mentor is building a 100% personalized 12-week roadmap for ' + role + '...</div>';

    const presentSkills = (state.formData.skills && state.formData.skills.length > 0) ? state.formData.skills.join(', ') : 'Fundamental Tech Knowledge';
    const missingSkillsStr = missing.length > 0 ? missing.join(', ') : 'Advanced Production Tools & Industry Standards';

    const prompt = `You are an elite AI technical career strategist and hiring mentor.
The candidate is applying for the position: "${role}".
Current Candidate Skills: ${presentSkills}
Critical Missing Skills Identified from ATS Skill Gap Analysis: ${missingSkillsStr}

Please generate a highly customized 12-Week (3-Month) Skill Mastery Roadmap specifically tailored to help this candidate master ${missingSkillsStr} for the "${role}" role.

Structure:
MONTH 1: FOUNDATIONS & CORE CONCEPTS (Weeks 1 - 4)
• Focus on mastering core fundamentals of ${missingSkillsStr}.

MONTH 2: INTERMEDIATE ARCHITECTURE & REAL-WORLD PROJECTS (Weeks 5 - 8)
• Hands-on project implementation combining present skills (${presentSkills}) with newly learned tools (${missingSkillsStr}).

MONTH 3: PRODUCTION ATS CAPSTONE PROJECTS & INTERVIEW PREPARATION (Weeks 9 - 12)
• Advanced portfolio project deployment, resume optimization, and mock interview questions for ${role}.

Rules:
- Make every single week specific to the missing skills (${missingSkillsStr}) and target role (${role}).
- Format clearly in clean plain text with bold bullet points. Do NOT use HTML or markdown code blocks.`;

    try {
        const response = await fetch('/api/ai-write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: 'roadmap', context: prompt })
        });
        
        const resData = await response.json();
        if (!response.ok || !resData.success) {
            throw new Error(resData.message || 'AI Roadmap service temporarily busy.');
        }
        
        roadmapBox.innerHTML = `<pre class="roadmap-text">${resData.content}</pre>`;
        showToast(`AI Roadmap generated for ${role}! 🚀`);
    } catch (e) {
        console.error(e);
        roadmapBox.innerHTML = `<div class="roadmap-hint" style="color:#ef4444; padding: 16px; text-align: center;"><i class="fas fa-exclamation-circle"></i> <strong>AI Roadmap Generation Error:</strong> ${e.message || 'AI service is temporarily busy. Please click Generate AI Roadmap again.'}</div>`;
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
// ENTRY FLOW: Choice Panel → Upload / Scratch
// ============================================
function initEntryFlow() {
    const choiceUpload = document.getElementById('choiceUpload');
    const choiceScratch = document.getElementById('choiceScratch');
    const backToChoiceBtn = document.getElementById('backToChoiceBtn');
    const pdfDropZone = document.getElementById('pdfDropZone');
    const pdfFileInput = document.getElementById('pdfFileInput');

    // Choice: Upload PDF
    if (choiceUpload) {
        choiceUpload.addEventListener('click', () => {
            document.getElementById('choicePanel').classList.add('hidden');
            document.getElementById('uploadPanel').classList.remove('hidden');
            window.scrollTo({ top: document.getElementById('builder').offsetTop - 80, behavior: 'smooth' });
        });
    }

    // Choice: Create From Scratch (Blank New Project)
    if (choiceScratch) {
        choiceScratch.addEventListener('click', () => {
            resetBuilder();
            state.flow = 'scratch';
            state.totalSteps = 4;
            document.getElementById('choicePanel').classList.add('hidden');
            document.getElementById('mainStepper').classList.remove('hidden');
            goToStep(1);
        });
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
    statusTitle.textContent = 'Uploading & extracting PDF...';
    statusDesc.textContent = 'Using server-side extraction for best results';

    try {
        let rawText = '';

        // ── Strategy 1: server-side pdf-parse (most reliable) ──
        try {
            const formData = new FormData();
            formData.append('pdf', file);
            const serverResp = await fetch('/api/extract-pdf', { method: 'POST', body: formData });
            if (serverResp.ok) {
                const serverData = await serverResp.json();
                if (serverData.text && serverData.text.length > 50) {
                    rawText = serverData.text;
                    statusDesc.textContent = `Extracted ${serverData.pages} page(s) via server`;
                }
            }
        } catch (serverErr) {
            console.warn('Server extraction failed, trying client-side:', serverErr.message);
        }

        // ── Strategy 2: client-side PDF.js fallback ──
        if (!rawText || rawText.length < 50) {
            statusDesc.textContent = 'Trying client-side extraction...';
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

        statusTitle.textContent = 'AI is structuring your resume...';
        statusDesc.textContent = 'Parsing sections with Groq AI';

        // Use AI to parse the raw text into structured JSON
        const parsePrompt = `You are an expert resume parser. Extract ALL structured information from the following raw resume text and return it as a JSON object with these exact keys:\n{\n  "fullName": "",\n  "email": "",\n  "phone": "",\n  "location": "",\n  "college": "",\n  "degree": "",\n  "gradYear": "",\n  "education": "",\n  "skills": [],\n  "languages": "",\n  "targetRole": "",\n  "summary": "",\n  "experience": "",\n  "projects": "",\n  "certifications": "",\n  "achievements": "",\n  "linkedin": "",\n  "github": ""\n}\n\nRules:\n- skills must be an array of strings\n- experience, projects, certifications, achievements: preserve full multi-line text as-is\n- education: format as 'College Name\\nDegree (Grad Year)' or leave blank\n- languages: comma-separated list of languages spoken\n- Return ONLY the raw JSON. No markdown code blocks, no explanation, no extra text.\n- If a field is not found, use an empty string or empty array\n\nResume text:\n${rawText.substring(0, 12000)}`;

        let parsedData = null;
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

        statusTitle.textContent = 'Setting up your profile...';
        statusDesc.textContent = 'Pre-filling forms with extracted data';

        state.flow = 'upload';

        // Pre-fill form fields if AI parsed data
        if (parsedData) {
            const fields = ['fullName','email','phone','location','college','degree','gradYear','targetRole','summary','linkedin','github'];
            fields.forEach(f => {
                const el = document.getElementById(f);
                if (el && parsedData[f]) el.value = parsedData[f];
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

        await new Promise(r => setTimeout(r, 500));

        // Navigate to Skill Gap Analyser
        const targetRole = (parsedData && parsedData.targetRole) || '';
        showSkillGapSection(targetRole, 'upload');

        showToast('Resume parsed successfully! 🎉 Analyse your skill gaps below.');

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
        showToast('Auto-extract failed — please paste your resume text below.');
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
            const parsePrompt = `You are an expert resume parser. Extract structured information from the following raw resume text and return it as a JSON object with these exact keys:\n{\n  "fullName": "",\n  "email": "",\n  "phone": "",\n  "location": "",\n  "college": "",\n  "degree": "",\n  "gradYear": "",\n  "skills": [],\n  "targetRole": "",\n  "summary": "",\n  "experience": "",\n  "projects": "",\n  "certifications": "",\n  "achievements": "",\n  "linkedin": "",\n  "github": ""\n}\nRules: skills must be an array. Return ONLY raw JSON.\nResume text:\n${text.substring(0, 4000)}`;

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
                ['fullName','email','phone','location','college','degree','gradYear','targetRole','summary','linkedin','github'].forEach(f => {
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
            showToast('Resume loaded! Analyse skill gaps below. 🎯');
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
    showToast('Resume loaded! Enhance, review and download your improved resume. ✨');
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
            const { jsPDF } = window.jspdf;
            await waitForReadyState(clone);
            const canvas = await html2canvas(clone, {
                scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false,
                width: 794, height: 1123, windowWidth: 794, windowHeight: 1123,
                onclone: (doc) => {
                    const el = doc.querySelector('.export-clone');
                    if (el) {
                        el.style.position = 'static';
                        el.style.left = '0';
                        el.style.top = '0';
                        el.style.width = '794px';
                        el.style.height = '1123px';
                        el.style.overflow = 'hidden';
                    }
                }
            });
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = 210;
            const totalPxH = canvas.height;
            const pageHeightPx = Math.round(canvas.width * (297 / 210));
            const totalPages = Math.ceil(totalPxH / pageHeightPx);

            for (let pg = 0; pg < totalPages; pg++) {
                if (pg > 0) pdf.addPage();
                const srcY  = pg * pageHeightPx;
                const srcH  = Math.min(pageHeightPx, totalPxH - srcY);
                const slice = document.createElement('canvas');
                slice.width  = canvas.width;
                slice.height = srcH;
                slice.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
                const sliceData = slice.toDataURL('image/png', 1.0);
                const sliceH = (srcH / canvas.width) * pageW;
                pdf.addImage(sliceData, 'PNG', 0, 0, pageW, sliceH);
            }
            pdf.save('enhanced_resume.pdf');
        } catch (err) { showToast('PDF generation failed.'); }
        finally { cleanup(); }
    });
    if (dlJPG) dlJPG.addEventListener('click', async () => {
        const sheet = document.getElementById('enhResumeSheet');
        if (!sheet) return;
        showToast('Generating image...');
        const { clone, cleanup } = createExportClone(sheet.innerHTML);
        try {
            await waitForReadyState(clone);
            const canvas = await html2canvas(clone, {
                scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false,
                width: 794, height: 1123, windowWidth: 794, windowHeight: 1123,
                onclone: (doc) => {
                    const el = doc.querySelector('.export-clone');
                    if (el) {
                        el.style.position = 'static';
                        el.style.left = '0';
                        el.style.top = '0';
                        el.style.width = '794px';
                        el.style.height = '1123px';
                        el.style.overflow = 'hidden';
                    }
                }
            });
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
            showToast('Resume enhanced successfully with AI! ✨');
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
            showToast(`${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)} section enhanced! ✨`);
        }
    } catch (err) {
        showToast('Enhancement failed. Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = origHTML;
    }
}
