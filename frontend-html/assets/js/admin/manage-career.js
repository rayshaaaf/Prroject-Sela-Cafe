// manage-career.js

// Check Admin Authentication
window.checkAdminAuth();

// Global State
let allCareers = [];
let allApplicants = [];
let currentStatusFilter = 'all';

// Load Data from Backend
async function loadCareersAndApplicants() {
    try {
        const careersRes = await apiFetch('/api/careers');
        const applicantsRes = await apiFetch('/api/applicants');

        if (careersRes.ok && applicantsRes.ok) {
            const careersData = await careersRes.json();
            const applicantsData = await applicantsRes.json();

            allCareers = careersData.data || [];
            allApplicants = applicantsData.data || [];

            executeFiltering();
        } else {
            showToast('Failed to fetch data from server', 'error');
        }
    } catch (error) {
        console.error('Error loading careers & applicants:', error);
        showToast('System connection error', 'error');
    }
}

// Helper: Badge Status
const getCareerBadge = (isOpen) => {
    if (isOpen) {
        return '<span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-caps text-[10px]">Active</span>';
    } else {
        return '<span class="bg-error-container text-error px-3 py-1 rounded-full font-label-caps text-[10px]">Closed</span>';
    }
};

// Render Careers Grid
const renderCareers = (data) => {
    const grid = document.getElementById('admin-career-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-outline font-label-md">No roles found.</div>';
        return;
    }

    data.forEach(job => {
        const jobApplicantsCount = allApplicants.filter(app => app.careerId === job.id).length;

        grid.innerHTML += `
            <div class="border border-outline-variant/50 rounded-xl p-6 bg-white flex flex-col justify-between hover:shadow-lg transition-shadow fade-in-smooth group">
                <div class="flex justify-between items-start mb-4">
                    ${getCareerBadge(job.isOpen)}
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button onclick="openEditCareerModal(${job.id})" class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors" title="Edit">
                            <span class="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onclick="deleteCareer(${job.id})" class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-error hover:text-white transition-colors" title="Delete">
                            <span class="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    </div>
                </div>
                <div class="mb-4">
                    <h3 class="font-headline-md text-[20px] text-deep-espresso leading-tight mb-1">${job.positionEn}</h3>
                    <p class="text-xs text-on-surface-variant font-mono mb-3">${job.positionId}</p>
                    
                    <p class="font-label-caps text-[9px] text-outline mb-1">DESCRIPTION BRIEF</p>
                    <p class="text-xs text-on-surface-variant line-clamp-3 mb-4 leading-relaxed">${job.descriptionEn}</p>
                    
                    <p class="font-label-caps text-[9px] text-outline mb-1">KEY REQUIREMENTS</p>
                    <p class="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">${job.requirementsEn.split('\n').join(', ') || '-'}</p>
                </div>
                <div class="sela-line my-4"></div>
                <div class="flex justify-between items-center">
                    <div>
                        <p class="font-label-caps text-[9px] text-outline mb-0.5">STATUS</p>
                        <p class="font-label-md text-[11px] text-deep-espresso">${job.isOpen ? 'OPEN' : 'CLOSED'}</p>
                    </div>
                    <button onclick="openApplicantsModal(${job.id})" class="text-right hover:opacity-80 transition-all cursor-pointer">
                        <p class="font-label-caps text-[9px] text-outline mb-0.5">APPLICANTS</p>
                        <p class="font-body-md text-moss-green font-bold text-base flex items-center gap-1">
                            ${jobApplicantsCount} <span class="text-xs font-normal text-outline">people</span>
                            <span class="material-symbols-outlined text-sm">chevron_right</span>
                        </p>
                    </button>
                </div>
            </div>
        `;
    });
};

// Filter Tabs Logic
window.filterAdminCareer = function(status, btn) {
    currentStatusFilter = status;
    
    // Reset styling all tab buttons
    const btns = document.getElementById('career-tabs-container').getElementsByTagName('button');
    for (let b of btns) {
        b.className = "font-label-caps text-[12px] text-on-surface-variant hover:text-primary transition-colors pb-2 whitespace-nowrap cursor-pointer";
    }
    // Set active button style
    btn.className = "font-label-caps text-[12px] text-primary border-b-2 border-primary pb-2 whitespace-nowrap cursor-pointer";
    
    executeFiltering();
};

// Search & Filter Union
const executeFiltering = () => {
    const searchKeyword = document.getElementById('admin-career-search').value.toLowerCase().trim();
    
    const filtered = allCareers.filter(job => {
        const matchesStatus = (
            currentStatusFilter === 'all' || 
            (currentStatusFilter === 'active' && job.isOpen) || 
            (currentStatusFilter === 'closed' && !job.isOpen)
        );
        const matchesSearch = 
            job.positionEn.toLowerCase().includes(searchKeyword) || 
            job.positionId.toLowerCase().includes(searchKeyword) ||
            job.descriptionEn.toLowerCase().includes(searchKeyword);
            
        return matchesStatus && matchesSearch;
    });

    renderCareers(filtered);
};

// --- Career Add/Edit Modal Handlers ---
window.openAddCareerModal = function() {
    document.getElementById('career-id').value = '';
    document.getElementById('career-form').reset();
    document.getElementById('career-modal-title').textContent = 'Post New Job';
    document.getElementById('career-is-open').checked = true;
    
    const modal = document.getElementById('career-modal');
    const content = document.getElementById('career-modal-content');
    modal.classList.remove('pointer-events-none', 'opacity-0');
    content.classList.remove('scale-95', 'translate-y-4');
    content.classList.add('scale-100', 'translate-y-0');
};

window.openEditCareerModal = function(id) {
    const job = allCareers.find(c => c.id === id);
    if (!job) return;

    document.getElementById('career-id').value = job.id;
    document.getElementById('career-position-id').value = job.positionId;
    document.getElementById('career-position-en').value = job.positionEn;
    document.getElementById('career-desc-id').value = job.descriptionId;
    document.getElementById('career-desc-en').value = job.descriptionEn;
    document.getElementById('career-reqs-id').value = job.requirementsId;
    document.getElementById('career-reqs-en').value = job.requirementsEn;
    document.getElementById('career-is-open').checked = job.isOpen;

    document.getElementById('career-modal-title').textContent = 'Edit Job Posting';
    
    const modal = document.getElementById('career-modal');
    const content = document.getElementById('career-modal-content');
    modal.classList.remove('pointer-events-none', 'opacity-0');
    content.classList.remove('scale-95', 'translate-y-4');
    content.classList.add('scale-100', 'translate-y-0');
};

window.closeCareerModal = function() {
    const modal = document.getElementById('career-modal');
    const content = document.getElementById('career-modal-content');
    content.classList.remove('scale-100', 'translate-y-0');
    content.classList.add('scale-95', 'translate-y-4');
    setTimeout(() => {
        modal.classList.add('pointer-events-none', 'opacity-0');
    }, 200);
};

window.saveCareer = async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('career-id').value;
    const payload = {
        positionId: document.getElementById('career-position-id').value,
        positionEn: document.getElementById('career-position-en').value,
        descriptionId: document.getElementById('career-desc-id').value,
        descriptionEn: document.getElementById('career-desc-en').value,
        requirementsId: document.getElementById('career-reqs-id').value,
        requirementsEn: document.getElementById('career-reqs-en').value,
        isOpen: document.getElementById('career-is-open').checked
    };

    try {
        let res;
        if (id) {
            // Update
            res = await apiFetch(`/api/careers/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            // Create
            res = await apiFetch('/api/careers', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        if (res.ok) {
            showToast(id ? 'Career updated successfully' : 'Career posted successfully', 'success');
            closeCareerModal();
            loadCareersAndApplicants();
        } else {
            const errData = await res.json();
            showToast(errData.message || 'Operation failed', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Error saving career details', 'error');
    }
};

window.deleteCareer = async function(id) {
    if (!confirm('Are you sure you want to delete this job posting? This cannot be undone.')) return;

    try {
        const res = await apiFetch(`/api/careers/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            showToast('Career posting deleted', 'success');
            loadCareersAndApplicants();
        } else {
            showToast('Failed to delete career', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Error deleting career', 'error');
    }
};

// --- Applicants Modal Handlers ---
window.openApplicantsModal = function(careerId) {
    const job = allCareers.find(c => c.id === careerId);
    if (!job) return;

    document.getElementById('applicants-modal-title').textContent = `Applicants List`;
    document.getElementById('applicants-modal-subtitle').textContent = job.positionEn;

    const jobApplicants = allApplicants.filter(app => app.careerId === careerId);
    const tbody = document.getElementById('applicants-table-body');
    const emptyState = document.getElementById('applicants-empty-state');
    
    tbody.innerHTML = '';
    
    if (jobApplicants.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        jobApplicants.forEach(app => {
            const formattedDate = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            }) : '-';

            tbody.innerHTML += `
                <tr class="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                    <td class="py-4 px-4 font-bold text-deep-espresso">${app.fullName}</td>
                    <td class="py-4 px-4">
                        <div class="flex flex-col text-xs text-on-surface-variant">
                            <span>${app.email}</span>
                            <span>${app.phone}</span>
                        </div>
                    </td>
                    <td class="py-4 px-4 text-xs font-mono text-outline">${formattedDate}</td>
                    <td class="py-4 px-4 text-center">
                        <div class="flex items-center justify-center gap-2">
                            <button onclick="viewCoverLetter('${app.fullName}', \`${app.coverLetter ? app.coverLetter.replace(/`/g, '\\`').replace(/\$/g, '\\$') : ''}\`)" class="bg-surface-container hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-label-caps tracking-wider transition-colors flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">description</span> Read Letter
                            </button>
                            <button onclick="downloadCv(${app.id}, '${app.fullName}')" class="bg-[#c5e8cc] hover:bg-[#386641] hover:text-white text-[#2f4d39] px-3 py-1.5 rounded-lg text-xs font-label-caps tracking-wider transition-colors flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">download</span> CV
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    const modal = document.getElementById('applicants-modal');
    const content = document.getElementById('applicants-modal-content');
    modal.classList.remove('pointer-events-none', 'opacity-0');
    content.classList.remove('scale-95', 'translate-y-4');
    content.classList.add('scale-100', 'translate-y-0');
};

window.closeApplicantsModal = function() {
    const modal = document.getElementById('applicants-modal');
    const content = document.getElementById('applicants-modal-content');
    content.classList.remove('scale-100', 'translate-y-0');
    content.classList.add('scale-95', 'translate-y-4');
    setTimeout(() => {
        modal.classList.add('pointer-events-none', 'opacity-0');
    }, 200);
};

// CV Download Handler via Blob
window.downloadCv = async function(applicantId, fullName) {
    try {
        const res = await apiFetch(`/api/applicants/${applicantId}/cv`);
        if (!res.ok) throw new Error('CV download failed');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CV_${fullName.trim().replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error(err);
        showToast('Failed to download CV file', 'error');
    }
};

// Cover Letter Popup Modal
window.viewCoverLetter = function(fullName, text) {
    document.getElementById('message-modal-title').textContent = `Cover Letter - ${fullName}`;
    document.getElementById('message-modal-body').textContent = text || 'No cover letter provided.';

    const modal = document.getElementById('message-modal');
    const content = document.getElementById('message-modal-content');
    modal.classList.remove('pointer-events-none', 'opacity-0');
    content.classList.remove('scale-95', 'translate-y-4');
    content.classList.add('scale-100', 'translate-y-0');
};

window.closeMessageModal = function() {
    const modal = document.getElementById('message-modal');
    const content = document.getElementById('message-modal-content');
    content.classList.remove('scale-100', 'translate-y-0');
    content.classList.add('scale-95', 'translate-y-4');
    setTimeout(() => {
        modal.classList.add('pointer-events-none', 'opacity-0');
    }, 200);
};

// Dom Initialization
document.addEventListener("DOMContentLoaded", () => {
    loadCareersAndApplicants();

    const searchInput = document.getElementById('admin-career-search');
    if (searchInput) {
        searchInput.addEventListener('input', executeFiltering);
    }
});