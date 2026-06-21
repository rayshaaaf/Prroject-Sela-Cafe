/**
 * Sela Cafe — Dynamic Content Integration
 * Handles dynamic content fetching for:
 * - Promos (promo.html)
 * - Careers (career.html)
 * - Locations (locations.html)
 * With elegant, high-end fallbacks if backend is offline.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Promo Page Integration
    const promosContainer = document.getElementById('promos-container');
    if (promosContainer) {
        initPromos(promosContainer);
    }

    // 2. Career Page Integration
    const careersContainer = document.getElementById('careers-container');
    if (careersContainer) {
        initCareers(careersContainer);
    }

    // 3. Locations Page Integration
    const locationsContainer = document.getElementById('locations-container');
    if (locationsContainer) {
        initLocations(locationsContainer);
    }
});

// ─── Promos Module ─────────────────────────────────────────────────────────────
const FALLBACK_PROMOS = [
    {
        id: 1,
        titleEn: "Student Special",
        titleId: "Spesial Mahasiswa",
        descriptionEn: "Fuel your focus with a 15% discount on all hand-crafted beverages upon presentation of a valid student identity.",
        descriptionId: "Fokus belajar dengan diskon 15% untuk semua minuman buatan tangan dengan menunjukkan kartu mahasiswa.",
        promoCode: "STUDENT15",
        discountPct: 15,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFZUxVsxmPHxvqQofCogiSq3R662JeZorPbxFEHxmb1KpAPE0srY4cvlp3tflWRo3HapYMCLy8poKumcjopJKwEXM3tr7BX4x9dYi-s8CN6rsP73wbI2p5vms3-n0ylkCoqEY8DRGHdmjBm22hcr5wppWtnA33vY3JE6Y9zBAChQUd0i8JG5viQncfCkO1bOEu_Ry0MAkB8uKkN8wU3ECu_JX1xoQxRHLC1_wIvxBdxqUz3c0JbSfeFm3ft7617F-I_H93zPFkQn2y",
        endDate: "2026-12-31",
        tag: "SAVINGS",
        caption: "Available Daily"
    },
    {
        id: 2,
        titleEn: "Morning Coffee Deal",
        titleId: "Promo Kopi Pagi",
        descriptionEn: "Start your journey with us. Enjoy any classic brew and a pastry of your choice for a special morning price.",
        descriptionId: "Mulai hari bersam kami. Nikmati seduhan klasik pilihan dan pastri dengan harga khusus pagi hari.",
        promoCode: "MORNING20",
        discountPct: 20,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuClSN0WSw5QW51YJPeEqOSeTX1QSTCoe6tBQLSFN9ffJw7izfHeg-PLeYwWRQ0xVXvI-oIfbJERicCaFHeeWxJGSYx5uiYnTTyUNW_bPoG9wbTVhD86g1_H9jjYzRbIp2JBZeETeGOCVYe_RdsQyzMjiUDQMQVMZ0HU4nTdrUH3jVqF-Fm5kNmdWgldS_LmH--x0oYbc5prYbyj9jwxDo8co6Yp6b8obbgTJVe4Scsx--JQg1n9e0QV6vgRAxuZSluxE5_67uPl9NFa",
        endDate: "2026-12-31",
        tag: "MORNINGS",
        caption: "Before 10:00 AM"
    },
    {
        id: 3,
        titleEn: "Roaster's Choice",
        titleId: "Pilihan Roaster",
        descriptionEn: "Take the Sela experience home. 20% off our seasonal bean collections when you purchase two or more bags.",
        descriptionId: "Bawa pulang pengalaman Sela. Diskon 20% koleksi biji kopi musiman saat beli 2 pack atau lebih.",
        promoCode: "ROASTER20",
        discountPct: 20,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJ4v61TFfEnq8jdcrZKoy5lchuUnYltJUujp5fB9GzRooZ7_JZngdIBbt8vG_SfV3yKKhmst2dtzJnVuOpVCoHlLqpNuZ9C4EamsGJetP6g9yX5wdxellrNn0HjZX59Erp260ZGXCEDUF7v7oeCISPe1Uqn0LDJWl2pWCr_C9nyPocbWcm9BPm_EZLSQYbUvSTLzQG36QsQ6YHBQUfIy80gqQzsxiASscRHaDSp2lS1UFSWzzChZOsSahbpfDGEC2GgKO-Rl8pT16k",
        endDate: "2026-12-31",
        tag: "RETAIL",
        caption: "Limited Availability"
    }
];

async function initPromos(container) {
    let promos = [];
    try {
        const response = await window.apiFetch('/api/promos/getAll');
        if (response.ok) {
            const apiRes = await response.json();
            promos = apiRes.data || [];
        }
    } catch (e) {
        console.warn('Failed to load promos from API, using premium fallback.', e);
    }

    if (!promos || promos.length === 0) {
        promos = FALLBACK_PROMOS;
    }

    renderPromos(container, promos);
}

function renderPromos(container, promos) {
    container.innerHTML = '';
    promos.forEach(promo => {
        const title = promo.titleEn || promo.titleId;
        const desc = promo.descriptionEn || promo.descriptionId;
        const tag = promo.discountPct ? `${promo.discountPct}% OFF` : (promo.tag || 'SAVINGS');
        const codeText = promo.promoCode ? `Use Code: ${promo.promoCode}` : 'Limited Availability';
        const img = promo.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFZUxVsxmPHxvqQofCogiSq3R662JeZorPbxFEHxmb1KpAPE0srY4cvlp3tflWRo3HapYMCLy8poKumcjopJKwEXM3tr7BX4x9dYi-s8CN6rsP73wbI2p5vms3-n0ylkCoqEY8DRGHdmjBm22hcr5wppWtnA33vY3JE6Y9zBAChQUd0i8JG5viQncfCkO1bOEu_Ry0MAkB8uKkN8wU3ECu_JX1xoQxRHLC1_wIvxBdxqUz3c0JbSfeFm3ft7617F-I_H93zPFkQn2y';

        const card = document.createElement('div');
        card.className = 'group border border-outline/10 bg-paper-white overflow-hidden transition-all duration-500 hover:border-outline/30';
        card.style.transform = 'translateY(0)';
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });

        card.innerHTML = `
            <div class="relative h-64 overflow-hidden">
                <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="${img}" alt="${title}"/>
                <div class="absolute top-4 left-4 px-3 py-1 bg-moss-green text-paper-white font-label-caps text-[10px] tracking-widest">${tag}</div>
            </div>
            <div class="p-8">
                <span class="font-label-caps text-[11px] text-on-surface-variant opacity-60 mb-2 block uppercase tracking-widest">${codeText}</span>
                <h3 class="font-headline-md text-headline-md text-deep-espresso mb-4">${title}</h3>
                <p class="font-body-md text-on-surface-variant mb-8 line-clamp-2">${desc}</p>
                <button onclick="window.showToast('Promo Code Copied: ${promo.promoCode || 'SELA'}', 'success')" class="w-full border border-deep-espresso text-deep-espresso py-4 font-label-caps text-xs tracking-widest hover:bg-deep-espresso hover:text-paper-white transition-all pressed-state">CLAIM OFFER</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// ─── Careers Module ────────────────────────────────────────────────────────────
const FALLBACK_CAREERS = [
    {
        id: 1,
        positionEn: "Lead Barista",
        descriptionEn: "Expert in espresso craft, workflow management, and team mentoring. 2+ years experience preferred.",
        requirementsEn: "Expert calibration, Latte art skills, leadership traits.",
        isOpen: true,
        type: "Full Time",
        location: "Downtown"
    },
    {
        id: 2,
        positionEn: "Store Supervisor",
        descriptionEn: "Leadership role overseeing daily operations, inventory, and ensuring elite hospitality standards.",
        requirementsEn: "Hospitality degree or 2+ years supervisor experience.",
        isOpen: true,
        type: "Full Time",
        location: "Heritage Row"
    },
    {
        id: 3,
        positionEn: "Kitchen Crew",
        descriptionEn: "Creating our artisan food menu. Focus on seasonal ingredients and beautiful presentation.",
        requirementsEn: "Culinary background, prep speed, creative plating.",
        isOpen: true,
        type: "Flexible",
        location: "Heritage Row"
    },
    {
        id: 4,
        positionEn: "Roastery Assistant",
        descriptionEn: "Assist in our artisan roasting process. Learn the science behind our signature heritage profiles.",
        requirementsEn: "Roasting basics, inventory management, high-volume capacity.",
        isOpen: true,
        type: "Full Time",
        location: "HQ"
    },
    {
        id: 5,
        positionEn: "Marketing Specialist",
        descriptionEn: "Help tell the Sela story to the world. Manage digital presence and community engagement.",
        requirementsEn: "Content marketing, graphic design, social media copywriting.",
        isOpen: true,
        type: "Full Time",
        location: "HQ"
    },
    {
        id: 6,
        positionEn: "Quality Control",
        descriptionEn: "Ensure every bean meets our heritage standards through rigorous cupping and analysis.",
        requirementsEn: "Cupping credentials, sensory evaluation, detailed reporting.",
        isOpen: true,
        type: "Full Time",
        location: "HQ"
    }
];

async function initCareers(container) {
    let careers = [];
    try {
        const response = await window.apiFetch('/api/careers/open');
        if (response.ok) {
            const apiRes = await response.json();
            careers = apiRes.data || [];
        }
    } catch (e) {
        console.warn('Failed to load careers from API, using premium fallback.', e);
    }

    if (!careers || careers.length === 0) {
        careers = FALLBACK_CAREERS;
    } else {
        // Enforce mock tags and locations for premium visual matching if not provided
        careers = careers.map((job, idx) => ({
            ...job,
            type: job.type || (idx % 3 === 2 ? "Flexible" : "Full Time"),
            location: job.location || (idx % 3 === 0 ? "Downtown" : idx % 3 === 1 ? "Heritage Row" : "HQ")
        }));
    }

    // Set up filter listener
    const selectFilter = document.querySelector('#positions select');
    if (selectFilter) {
        selectFilter.addEventListener('change', (e) => {
            const selectedLoc = e.target.value;
            const filtered = selectedLoc === 'All Locations'
                ? careers
                : careers.filter(j => j.location.toLowerCase().includes(selectedLoc.toLowerCase()) || selectedLoc.toLowerCase().includes(j.location.toLowerCase()));
            renderCareers(container, filtered);
        });
    }

    renderCareers(container, careers);
}

function renderCareers(container, careers) {
    container.innerHTML = '';
    if (careers.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-20 text-on-surface-variant font-label-caps tracking-wider opacity-60">
                No open positions at this location.
            </div>
        `;
        return;
    }

    careers.forEach(job => {
        const title = job.positionEn || job.positionId;
        const desc = job.descriptionEn || job.descriptionId;
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
            <button onclick="applyForJob(${job.id}, '${title}')" class="text-primary font-label-caps text-label-caps uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">Apply Now <span class="material-symbols-outlined text-sm">arrow_forward</span></button>
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

        const response = await fetch(`http://localhost:8090/api/applicants/apply`, {
            method: 'POST',
            headers,
            body: formData
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
            window.showToast('Application submitted successfully!', 'success');
            closeApplyModal();
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

// ─── Locations Module ──────────────────────────────────────────────────────────
const FALLBACK_LOCATIONS = [
    {
        id: 1,
        name: "Sela Cafe Braga",
        city: "Bandung",
        addressEn: "Jl. Braga No. 12, Bandung",
        addressId: "Jl. Braga No. 12, Bandung",
        phone: "+62 22 123456",
        openHours: "Daily: 07:00 — 22:00",
        isOpen: true,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnxk08Xcd2iw63tvIXlib-cVGld0EkJhxyJEJFlBIzvlfxjRSp7OMY67TGbx20pBOD4xZvKdyrL_grCnal4R7nu-_H98C7iOfkICiuiVMsPmPJLT7h_igFkKrw2KV0e6iIjqGxBd5dcWoxi3DDZhZrOSSVOFPU_EgaII-GB3haHnYWwkfTdv7GEAs5NaP_uM0-_9GhGiHPz2rWUgc1FY3HqKFJ-Yv7bjdktKmE3XUK3PGlDIGwpLAcYyZwvPks0nV3gOYyhnz2w4D-",
        mapsUrl: "https://maps.google.com",
        tag: "Historic District",
        amenities: ["FREE WIFI", "INDOOR/OUTDOOR", "MEETING SPACE"],
        description: "Immerse yourself in the colonial charm of Bandung's most iconic street. Our Braga branch is housed in a meticulously restored 1920s building, featuring high ceilings and original mosaic flooring."
    },
    {
        id: 2,
        name: "Sela Cafe Dago",
        city: "Bandung",
        addressEn: "Jl. Ir. H. Juanda No. 240, Bandung",
        addressId: "Jl. Ir. H. Juanda No. 240, Bandung",
        phone: "+62 22 654321",
        openHours: "Daily: 08:00 — 23:00",
        isOpen: true,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2AYMl44swD2Hs3NHPNgkaePyFw6n0Roy6uxsUo5glSYTan8Qm-3xRe_Bwd_dyFPMK6LUQFAcjmPr9fAWf-iS_M7jWzaoZUypwnJs767EPjBAmVEtBWwYMR0obSNITZfyGvKs6JI-Bmijc9PvzoBo_OU8KyH5P7oe4s47_Pbzhz7lhfpM-BeA9oRzVWHm7XX-t49mGf5ms5cPC6JuhCyHsaHy2goWWyQ0RKFk7HNZVoWgSgBKHfJxySAuFNMZW6tLwyIMtU40XJR4T",
        mapsUrl: "https://maps.google.com",
        tag: "Mountain View",
        amenities: ["MOUNTAIN VIEW", "AMPHITHEATER"],
        description: "Perched on the highlands, our Dago location offers breathtaking views of the valley. A minimalist sanctuary where the crisp mountain air complements our signature dark roasts."
    },
    {
        id: 3,
        name: "Sela Cafe Cihampelas",
        city: "Bandung",
        addressEn: "Jl. Cihampelas No. 158, Bandung",
        addressId: "Jl. Cihampelas No. 158, Bandung",
        phone: "+62 22 987654",
        openHours: "Daily: 07:00 — 21:00",
        isOpen: true,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCU4mAXwh9HCmXrfD1F67_HcuMv1uNcVASDFT3w6K3StFpWKCptnqjiI6RPZx2Hxm0LoHZGl4OktB7gvgFtYhxmBQdT3gidX5U2qFxQUFUQIE9ePCvqUt9nPzbS48WLlSftzq1xUmLo_0t_L72UbtZv7EGvJ9foWDdEdO1_GG3qdItz2ewfHBF4WCZGy0AabkwlmjdrulX0WFYTD2wGhvk6A-T5W8lcye1QYxrFmbC3QkSMZ7fDVJBH1G63iOQc1qz1O1o9HU9pBEU_",
        mapsUrl: "https://maps.google.com",
        tag: "Urban Pulse",
        amenities: ["COMMUNITY DESK", "URBAN TERRACE"],
        description: "A modern industrial haven nestled in the heart of the city's creative district. Designed for thinkers, makers, and dreamers who need a quiet corner in a fast-paced world."
    }
];

async function initLocations(container) {
    let locations = [];
    try {
        const response = await window.apiFetch('/api/locations/open');
        if (response.ok) {
            const apiRes = await response.json();
            locations = apiRes.data || [];
        }
    } catch (e) {
        console.warn('Failed to load locations from API, using premium fallback.', e);
    }

    if (!locations || locations.length === 0) {
        locations = FALLBACK_LOCATIONS;
    } else {
        // Hydrate details for visual fidelity
        locations = locations.map((loc, idx) => {
            const fallbackMatch = FALLBACK_LOCATIONS.find(f => f.name.toLowerCase().includes(loc.name.toLowerCase()) || loc.name.toLowerCase().includes(f.name.toLowerCase()));
            return {
                ...loc,
                description: fallbackMatch ? fallbackMatch.description : `Experience the finest specialty coffee in ${loc.city}. Located at ${loc.addressEn || loc.addressId}, our sanctuary is designed to help you slow down and savor the craft.`,
                tag: fallbackMatch ? fallbackMatch.tag : (idx % 3 === 0 ? "Historic District" : idx % 3 === 1 ? "Mountain View" : "Urban Pulse"),
                amenities: fallbackMatch ? fallbackMatch.amenities : ["FREE WIFI", "INDOOR/OUTDOOR"],
                mapsUrl: loc.mapsUrl || "https://maps.google.com"
            };
        });
    }

    renderLocations(container, locations);
}

function renderLocations(container, locations) {
    container.innerHTML = '';
    locations.forEach((loc, idx) => {
        const name = loc.name;
        const address = loc.addressEn || loc.addressId;
        const hours = loc.openHours || 'Daily: 07:00 — 22:00';
        const img = loc.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnxk08Xcd2iw63tvIXlib-cVGld0EkJhxyJEJFlBIzvlfxjRSp7OMY67TGbx20pBOD4xZvKdyrL_grCnal4R7nu-_H98C7iOfkICiuiVMsPmPJLT7h_igFkKrw2KV0e6iIjqGxBd5dcWoxi3DDZhZrOSSVOFPU_EgaII-GB3haHnYWwkfTdv7GEAs5NaP_uM0-_9GhGiHPz2rWUgc1FY3HqKFJ-Yv7bjdktKmE3XUK3PGlDIGwpLAcYyZwvPks0nV3gOYyhnz2w4D-';
        const desc = loc.description;
        const tag = loc.tag;
        const amenitiesHTML = (loc.amenities || []).map(a => `<span class="bg-heritage-cream px-3 py-1 font-label-caps text-[10px] text-primary">${a}</span>`).join('\n');

        const isEven = idx % 2 === 0;
        
        const card = document.createElement('div');
        card.className = 'grid grid-cols-1 md:grid-cols-12 gap-12 items-center';

        if (isEven) {
            card.innerHTML = `
                <div class="md:col-span-7 order-2 md:order-1">
                    <div class="aspect-[4/3] overflow-hidden">
                        <img class="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700" src="${img}" alt="${name}">
                    </div>
                </div>
                <div class="md:col-span-5 order-1 md:order-2 flex flex-col justify-center">
                    <span class="font-label-caps text-label-caps text-moss-green mb-4">${tag}</span>
                    <h3 class="font-headline-lg text-headline-lg text-deep-espresso mb-6">${name}</h3>
                    <p class="font-body-md text-on-surface-variant mb-8 leading-relaxed">${desc}</p>
                    <div class="space-y-4 mb-10">
                        <div class="flex items-center gap-4 text-on-surface">
                            <span class="material-symbols-outlined text-outline">location_on</span>
                            <span class="font-label-md text-label-md">${address}</span>
                        </div>
                        <div class="flex items-center gap-4 text-on-surface">
                            <span class="material-symbols-outlined text-outline">schedule</span>
                            <span class="font-label-md text-label-md">${hours}</span>
                        </div>
                        <div class="flex gap-3 pt-4">
                            ${amenitiesHTML}
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <button onclick="window.showToast('${name} Phone: ${loc.phone || 'N/A'}', 'default')" class="flex-1 border border-primary py-4 font-label-caps text-label-caps hover:bg-primary hover:text-white transition-all">View Details</button>
                        <button onclick="window.open('${loc.mapsUrl}', '_blank')" class="flex-1 bg-primary text-white py-4 font-label-caps text-label-caps hover:opacity-90 transition-all">Get Directions</button>
                    </div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="md:col-span-5 flex flex-col justify-center">
                    <span class="font-label-caps text-label-caps text-moss-green mb-4">${tag}</span>
                    <h3 class="font-headline-lg text-headline-lg text-deep-espresso mb-6">${name}</h3>
                    <p class="font-body-md text-on-surface-variant mb-8 leading-relaxed">${desc}</p>
                    <div class="space-y-4 mb-10">
                        <div class="flex items-center gap-4 text-on-surface">
                            <span class="material-symbols-outlined text-outline">location_on</span>
                            <span class="font-label-md text-label-md">${address}</span>
                        </div>
                        <div class="flex items-center gap-4 text-on-surface">
                            <span class="material-symbols-outlined text-outline">schedule</span>
                            <span class="font-label-md text-label-md">${hours}</span>
                        </div>
                        <div class="flex gap-3 pt-4">
                            ${amenitiesHTML}
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <button onclick="window.showToast('${name} Phone: ${loc.phone || 'N/A'}', 'default')" class="flex-1 border border-primary py-4 font-label-caps text-label-caps hover:bg-primary hover:text-white transition-all">View Details</button>
                        <button onclick="window.open('${loc.mapsUrl}', '_blank')" class="flex-1 bg-primary text-white py-4 font-label-caps text-label-caps hover:opacity-90 transition-all">Get Directions</button>
                    </div>
                </div>
                <div class="md:col-span-7">
                    <div class="aspect-[4/3] overflow-hidden">
                        <img class="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700" src="${img}" alt="${name}">
                    </div>
                </div>
            `;
        }

        container.appendChild(card);
    });
}
