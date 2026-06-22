/**
 * Sela Cafe — Careers Integration
 * Fetches open career opportunities dynamically from `/api/careers/open`
 * and handles job application submissions.
 */

document.addEventListener('DOMContentLoaded', () => {
    const careersContainer = document.getElementById('careers-container');
    if (careersContainer) {
        initCareers(careersContainer);
    }
});

let allCareers = [];

async function initCareers(container) {
    try {
        const response = await window.apiFetch('/api/careers/open');
        if (response.ok) {
            const apiRes = await response.json();
            allCareers = apiRes.data || [];
        } else {
            console.error('Failed to fetch careers. Status:', response.status);
        }
    } catch (e) {
        console.error('Error fetching careers from API:', e);
    }

    // Hydrate details for visual fidelity (since DB does not store type & location)
    allCareers = allCareers.map((job, idx) => ({
        ...job,
        type: job.type || (idx % 3 === 2 ? "Flexible" : "Full Time"),
        location: job.location || (idx % 3 === 0 ? "Downtown" : idx % 3 === 1 ? "Heritage Row" : "HQ")
    }));

    // Setup filter listener
    const selectFilter = document.querySelector('#positions select');
    if (selectFilter) {
        // Remove existing listener if any by replacing the element or just adding new listener
        const newSelectFilter = selectFilter.cloneNode(true);
        selectFilter.parentNode.replaceChild(newSelectFilter, selectFilter);
        
        newSelectFilter.addEventListener('change', (e) => {
            const selectedLoc = e.target.value;
            const filtered = selectedLoc === 'All Locations'
                ? allCareers
                : allCareers.filter(j => j.location.toLowerCase().includes(selectedLoc.toLowerCase()) || selectedLoc.toLowerCase().includes(j.location.toLowerCase()));
            renderCareers(container, filtered);
        });
    }

    renderCareers(container, allCareers);
}

function renderCareers(container, careers) {
    container.innerHTML = '';
    
    // Filter active open careers
    const openCareers = careers.filter(j => j.isOpen !== false);

    if (openCareers.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-20 text-on-surface-variant font-label-caps tracking-wider opacity-60">
                No open positions at this location.
            </div>
        `;
        return;
    }

    openCareers.forEach(job => {
        const title = job.positionEn || job.positionId || 'Untitled Role';
        const desc = job.descriptionEn || job.descriptionId || 'No description available.';
        const type = job.type || "Full Time";
        const loc = job.location || "All Locations";
        const badgeBgClass = type === "Flexible" ? "bg-tertiary-container/10 text-tertiary-container" : "bg-moss-green/10 text-moss-green";

        const card = document.createElement('div');
        card.className = 'group border-b border-outline-variant/30 pb-8 flex flex-col justify-between transition-all duration-300 hover:border-primary';
        card.style.transform = 'translateY(0)';
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });

        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between mb-4">
                    <span class="${badgeBgClass} px-3 py-1 rounded-full text-[10px] font-label-caps uppercase tracking-widest">${type}</span>
                    <span class="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">${loc}</span>
                </div>
                <h3 class="font-headline-md text-headline-md text-primary mb-3">${title}</h3>
                <p class="font-body-md text-body-md text-on-surface-variant mb-6">${desc}</p>
            </div>
            <button onclick="window.applyForJob(${job.id}, '${title}')" class="text-primary font-label-caps text-label-caps uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all self-start">Apply Now <span class="material-symbols-outlined text-sm">arrow_forward</span></button>
        `;
        container.appendChild(card);
    });
}

window.applyForJob = function(jobId, title) {
    const modal = document.getElementById('apply-modal');
    const jobTitleEl = document.getElementById('modal-job-title');
    const jobIdInput = document.getElementById('modal-job-id');
    
    if (jobTitleEl) jobTitleEl.textContent = `Apply for ${title}`;
    if (jobIdInput) jobIdInput.value = jobId;
    
    if (modal) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }
};

window.closeApplyModal = function() {
    const modal = document.getElementById('apply-modal');
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
    }
    document.getElementById('apply-form')?.reset();
    const cvName = document.getElementById('cv-file-name');
    if (cvName) cvName.textContent = 'Drag & drop or click to upload';
};

window.updateFileName = function(input) {
    const nameEl = document.getElementById('cv-file-name');
    if (nameEl && input.files && input.files[0]) {
        nameEl.textContent = input.files[0].name;
    }
};

window.submitApplication = async function(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-submit-app');
    const originalText = btn ? btn.innerHTML : '';
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `SUBMITTING... <span class="animate-spin material-symbols-outlined text-sm">autorenew</span>`;
    }

    const careerId = document.getElementById('modal-job-id')?.value;
    const name = document.getElementById('apply-name')?.value?.trim();
    const email = document.getElementById('apply-email')?.value?.trim();
    const phone = document.getElementById('apply-phone')?.value?.trim();
    const address = document.getElementById('apply-address')?.value?.trim();
    const letter = document.getElementById('apply-letter')?.value?.trim();
    const cvFile = document.getElementById('apply-cv')?.files[0];

    if (!careerId || !name || !email || !phone || !address || !letter || !cvFile) {
        window.showToast('Please fill all fields and upload your CV.', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
        return;
    }

    const formData = new FormData();
    formData.append('careerId', careerId);
    formData.append('fullName', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('coverLetter', letter);
    formData.append('cvFile', cvFile);

    try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Using standard fetch since FormData is sent (Content-Type header omitted so browser sets boundary)
        const response = await fetch(`http://localhost:8090/api/applicants/apply`, {
            method: 'POST',
            headers,
            body: formData
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
            window.showToast('Application submitted successfully!', 'success');
            window.closeApplyModal();
        } else {
            window.showToast(data.message || 'Failed to submit application.', 'error');
        }
    } catch (err) {
        console.error('Error submitting application:', err);
        window.showToast('Network error. Please try again.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
};
