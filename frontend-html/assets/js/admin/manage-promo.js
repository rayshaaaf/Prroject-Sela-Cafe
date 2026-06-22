/**
 * Sela Cafe - Promo Inventory Management Script (REAL-DATABASE CONNECTED)
 */

let allPromos = [];
let currentFilter = 'all';
let searchQuery = '';
let currentSort = 'newest';

let currentPage = 1;
const itemsPerPage = 6; // 6 cards per page for nicer spacing

document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof window.checkAdminAuth === 'function') {
            window.checkAdminAuth();
        }
    } catch (authError) {
        console.warn("Auth check deferred:", authError);
    }
    fetchAdminPromos();
    setupAdminPromoListeners();
});

async function fetchAdminPromos() {
    try {
        const response = await window.apiFetch('/api/promos/getAll');
        if (response.ok) {
            const apiRes = await response.json();
            allPromos = apiRes.data || [];
        }
    } catch (e) {
        console.error('Error fetching promos:', e);
    }
    renderAdminPromos();
}

function renderAdminPromos() {
    const targetGrid = document.getElementById('admin-promo-grid');
    const pagContainer = document.getElementById('admin-promo-pagination');
    if (!targetGrid) return;

    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    // 1. Filter Promos
    let filtered = allPromos.filter(promo => {
        // Status filter logic
        const promoStart = promo.startDate || '';
        const promoEnd = promo.endDate || '';
        
        let matchesStatus = true;
        if (currentFilter === 'active') {
            matchesStatus = promo.isActive && promoStart <= today && today <= promoEnd;
        } else if (currentFilter === 'scheduled') {
            matchesStatus = promo.isActive && promoStart > today;
        } else if (currentFilter === 'expired') {
            matchesStatus = !promo.isActive || today > promoEnd;
        }

        // Search logic
        const query = searchQuery.toLowerCase().trim();
        const titleIdMatch = (promo.titleId || '').toLowerCase().includes(query);
        const titleEnMatch = (promo.titleEn || '').toLowerCase().includes(query);
        const codeMatch = (promo.promoCode || '').toLowerCase().includes(query);
        const matchesSearch = titleIdMatch || titleEnMatch || codeMatch;

        return matchesStatus && matchesSearch;
    });

    // 2. Sort Promos
    if (currentSort === 'newest') {
        filtered.sort((a, b) => b.id - a.id);
    } else if (currentSort === 'ending-soon') {
        filtered.sort((a, b) => {
            if (!a.endDate) return 1;
            if (!b.endDate) return -1;
            return new Date(a.endDate) - new Date(b.endDate);
        });
    } else if (currentSort === 'highest-discount') {
        filtered.sort((a, b) => (b.discountPct || 0) - (a.discountPct || 0));
    }

    if (filtered.length === 0) {
        if (pagContainer) pagContainer.innerHTML = '';
        targetGrid.className = "py-12 col-span-full flex flex-col items-center justify-center text-center fade-in-smooth";
        targetGrid.innerHTML = `
            <div class="max-w-md space-y-4">
                <span class="material-symbols-outlined text-[48px] text-outline">percent</span>
                <h4 class="font-headline-md text-headline-md text-primary">No Promos Found</h4>
                <p class="font-body-md text-on-surface-variant">There are no active promos matching your current search or tab filters.</p>
            </div>
        `;
        return;
    }

    // 3. Paginate
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    targetGrid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-smooth";

    // Render Cards
    targetGrid.innerHTML = paginatedItems.map(promo => {
        // Evaluate status for badges
        let badgeHTML = '';
        const promoStart = promo.startDate || '';
        const promoEnd = promo.endDate || '';
        
        if (promo.isActive && promoStart <= today && today <= promoEnd) {
            badgeHTML = `<span class="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-sm text-[10px] font-label-caps tracking-wider">ACTIVE</span>`;
        } else if (promo.isActive && promoStart > today) {
            badgeHTML = `<span class="bg-surface-container-highest text-primary px-2 py-0.5 rounded-sm text-[10px] font-label-caps tracking-wider">SCHEDULED</span>`;
        } else {
            badgeHTML = `<span class="bg-error-container text-on-error-container px-2 py-0.5 rounded-sm text-[10px] font-label-caps tracking-wider">EXPIRED</span>`;
        }

        const promoImage = promo.imageUrl || 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=400';
        const startFmt = formatDateString(promo.startDate);
        const endFmt = formatDateString(promo.endDate);

        return `
            <div class="group flex flex-col justify-between border border-outline-variant/30 rounded-xl bg-white shadow-xs overflow-hidden">
                <div>
                    <div class="relative h-40 bg-surface-container overflow-hidden">
                        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${promoImage}" alt="${promo.titleEn || promo.titleId}"/>
                        <div class="absolute top-3 left-3 flex gap-2">
                            ${badgeHTML}
                            <span class="bg-deep-espresso text-paper-white px-2 py-0.5 rounded-sm text-[10px] font-label-caps tracking-wider">${promo.discountPct}% OFF</span>
                        </div>
                    </div>
                    
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-3">
                            <span class="bg-heritage-cream/70 text-on-primary-fixed border border-outline-variant/50 px-3 py-1 font-label-caps text-xs rounded-lg select-all tracking-wider">${promo.promoCode || 'NOCODE'}</span>
                        </div>
                        
                        <h5 class="font-headline-md text-[20px] text-primary mb-2">${promo.titleEn || promo.titleId}</h5>
                        <p class="text-xs text-on-surface-variant leading-relaxed mb-4 line-clamp-2">${promo.descriptionEn || promo.descriptionId || ''}</p>
                        
                        <div class="flex items-center gap-1.5 text-[11px] font-label-caps text-outline">
                            <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                            <span>${startFmt} - ${endFmt}</span>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2 p-6 border-t border-outline-variant/20 bg-surface-container-low/30">
                    <a href="edit-promo.html?id=${promo.id}" class="text-center py-2 bg-surface-container border border-outline text-primary font-label-caps text-[10px] tracking-wider hover:bg-primary hover:text-white transition-all rounded-md">
                        EDIT
                    </a>
                    <button onclick="deletePromoCuration(${promo.id})" class="py-2 border border-error/40 text-error font-label-caps text-[10px] tracking-wider hover:bg-error hover:text-white transition-all rounded-md cursor-pointer">
                        DELETE
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Pagination render
    if (pagContainer) {
        if (totalPages <= 1) {
            pagContainer.innerHTML = '';
        } else {
            let pagHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const isActive = i === currentPage;
                pagHTML += `
                    <button onclick="changeAdminPromoPage(${i})" class="w-9 h-9 flex items-center justify-center font-label-md text-xs tracking-wider cursor-pointer transition-all border ${isActive ? 'bg-primary text-white border-primary font-bold' : 'border-outline-variant text-primary hover:bg-surface-container'} rounded-md">
                        ${i}
                    </button>
                `;
            }
            pagContainer.innerHTML = pagHTML;
        }
    }
}

function formatDateString(dateString) {
    if (!dateString) return 'Always';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

window.changeAdminPromoPage = function(pageNumber) {
    currentPage = pageNumber;
    renderAdminPromos();
    document.getElementById('admin-promo-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.filterAdminPromo = function(filter, element) {
    currentFilter = filter;
    currentPage = 1;
    const tabs = document.querySelectorAll('#promo-tabs-container button');
    tabs.forEach(tab => tab.className = "font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors pb-2 whitespace-nowrap cursor-pointer");
    element.className = "font-label-caps text-label-caps text-primary border-b-2 border-primary pb-2 whitespace-nowrap cursor-pointer";
    renderAdminPromos();
};

window.deletePromoCuration = async function(id) {
    if (!confirm('Are you sure you want to delete this promo?')) return;
    
    try {
        const response = await window.apiFetch(`/api/promos/delete/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            if (typeof window.showToast === 'function') {
                window.showToast('Promo code successfully deleted.', 'success');
            }
            fetchAdminPromos(); // Refresh from DB
        }
    } catch (e) {
        console.error('Delete promo failure.', e);
    }
};

function setupAdminPromoListeners() {
    const searchInp = document.getElementById('admin-promo-search');
    if (searchInp) {
        searchInp.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            currentPage = 1;
            renderAdminPromos();
        });
    }

    const sortSel = document.getElementById('admin-promo-sort');
    if (sortSel) {
        sortSel.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderAdminPromos();
        });
    }
}
