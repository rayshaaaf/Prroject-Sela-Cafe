/**
 * Sela Cafe - Manage Menu Product Inventory Management Script (REAL-DATABASE CONNECTED)
 */

let allProducts = [];
let currentCategory = 'all';
let searchQuery = '';
let currentSort = 'popular';

// Aturan Segmentasi Halaman (Max 10 item per page)
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.checkAdminAuth === 'function') {
        window.checkAdminAuth();
    }
    fetchAdminCatalogInventory();
    setupAdminCatalogListeners();
});

/**
 * 1. Tarik Data Utama dari API Backend Java Rest
 */
async function fetchAdminCatalogInventory() {
    try {
        const response = await window.apiFetch('/api/menus/getAll');
        if (response.ok) {
            const apiRes = await response.json();
            const backendProducts = apiRes.data || [];
            
            allProducts = backendProducts.map(p => ({
                id: p.id,
                name: p.nameId || p.name || 'Artisan Brew',
                price: p.price || 0,
                category: p.categoryName || p.category || 'coffee',
                description: p.descriptionId || p.description || 'Handcrafted specialty curation.',
                imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop',
                isAvailable: p.isAvailable && p.stock > 0
            }));
        }
    } catch (e) {
        console.error('Anomalous drop intercept on admin menu loop fetch.', e);
    }
    
    renderAdminMenuCatalog();
}

/**
 * 2. Render Grid Katalog Inventory dengan Dukungan Real-Time Search & Pagination 10 Items
 */
function renderAdminMenuCatalog() {
    const targetGrid = document.getElementById('admin-menu-grid');
    const pagContainer = document.getElementById('admin-menu-pagination');
    if (!targetGrid) return;

    // Filter Kategori & Kata Kunci Multi Bahasa Cerdas
    let filtered = allProducts.filter(product => {
        const matchesCategory = currentCategory === 'all' || 
            (product.category && product.category.toLowerCase() === currentCategory.toLowerCase());
        
        const cleanQuery = searchQuery.toLowerCase().trim();
        const isKopiQuery = cleanQuery === 'kopi' || cleanQuery === 'coffee';

        const matchesSearch = product.name.toLowerCase().includes(cleanQuery) || 
            product.description.toLowerCase().includes(cleanQuery) ||
            (isKopiQuery && product.category.toLowerCase() === 'coffee');

        return matchesCategory && matchesSearch;
    });

    // Urutkan Sesuai Sort Option Terpilih
    if (currentSort === 'low-high') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'high-low') {
        filtered.sort((a, b) => b.price - a.price);
    }

    // Fallback jika tidak ada hasil pencarian
    if (filtered.length === 0) {
        if (pagContainer) pagContainer.innerHTML = '';
        targetGrid.className = "py-12 col-span-full flex flex-col items-center justify-center text-center fade-in-smooth";
        targetGrid.innerHTML = `
            <div class="max-w-md space-y-4">
                <span class="material-symbols-outlined text-[48px] text-outline">hourglass_empty</span>
                <h4 class="font-headline-md text-headline-md text-primary">No Selections Found</h4>
                <p class="font-body-md text-on-surface-variant">The requested artisan selections are currently unavailable. Please verify your keywords or explore another category.</p>
            </div>
        `;
        return;
    }

    // Hitung Segmentasi Halaman Maksimal 10 Item
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    targetGrid.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-gutter gap-y-16 fade-in-smooth";

    // Suntik Struktur Grid
    targetGrid.innerHTML = paginatedItems.map(product => {
        return `
            <div class="group flex flex-col justify-between border border-outline-variant/30 p-4 rounded-xl bg-white shadow-xs">
                <div>
                    <div class="relative aspect-square mb-4 overflow-hidden bg-surface-container rounded-lg">
                        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${product.imageUrl}" alt="${product.name}"/>
                        <span class="absolute top-3 left-3 text-[10px] font-label-caps tracking-wider px-2 py-1 shadow-sm rounded-sm ${product.isAvailable ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}">
                            ${product.isAvailable ? 'ACTIVE' : 'OUT OF STOCK'}
                        </span>
                    </div>
                    <div class="flex justify-between items-start mb-2 gap-2">
                        <h5 class="font-headline-md text-[18px] text-primary line-clamp-1">${product.name}</h5>
                        <span class="font-label-md text-primary whitespace-nowrap text-sm font-semibold">Rp ${Number(product.price).toLocaleString('id-ID')}</span>
                    </div>
                    <p class="text-xs text-on-surface-variant leading-relaxed mb-4 line-clamp-2">${product.description}</p>
                </div>
                <div class="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/20 mt-2">
                    <a href="edit-menu.html?id=${product.id}" class="w-full text-center py-2 bg-surface-container border border-outline text-primary font-label-caps text-[10px] tracking-wider hover:bg-primary hover:text-white transition-all rounded-md">
                        EDIT
                    </a>
                    <button onclick="toggleProductAvailability(${product.id}, ${product.isAvailable})" class="w-full py-2 border font-label-caps text-[10px] tracking-wider transition-all rounded-md cursor-pointer ${product.isAvailable ? 'border-error/40 text-error hover:bg-error hover:text-white' : 'border-secondary/40 text-secondary hover:bg-secondary hover:text-white'}">
                        ${product.isAvailable ? 'DISABLE' : 'ACTIVATE'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Menggambar Navigasi Angka Halaman Dinamis
    if (pagContainer) {
        if (totalPages <= 1) {
            pagContainer.innerHTML = '';
        } else {
            let pagHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const isActive = i === currentPage;
                pagHTML += `
                    <button onclick="changeAdminCatalogPage(${i})" class="w-9 h-9 flex items-center justify-center font-label-md text-xs tracking-wider cursor-pointer transition-all border ${isActive ? 'bg-primary text-white border-primary font-bold' : 'border-outline-variant text-primary hover:bg-surface-container'} rounded-md">
                        ${i}
                    </button>
                `;
            }
            pagContainer.innerHTML = pagHTML;
        }
    }
}

window.changeAdminCatalogPage = function(pageNumber) {
    currentPage = pageNumber;
    renderAdminMenuCatalog();
    document.getElementById('admin-menu-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.filterAdminCategory = function(category, element) {
    currentCategory = category;
    currentPage = 1;
    const tabs = document.querySelectorAll('#category-tabs-container button');
    tabs.forEach(tab => tab.className = "font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors pb-2 whitespace-nowrap cursor-pointer");
    element.className = "font-label-caps text-label-caps text-primary border-b-2 border-primary pb-2 whitespace-nowrap cursor-pointer";
    renderAdminMenuCatalog();
};

window.toggleProductAvailability = async function(id, currentStatus) {
    try {
        const getResponse = await window.apiFetch(`/api/menus/getById/${id}`);
        if (!getResponse.ok) {
            console.error('Failed to retrieve menu details for toggle.');
            return;
        }
        const apiRes = await getResponse.json();
        const menu = apiRes.data;
        if (!menu) return;

        const menuPayload = {
            nameId: menu.nameId,
            nameEn: menu.nameEn,
            descriptionId: menu.descriptionId,
            descriptionEn: menu.descriptionEn,
            price: parseFloat(menu.price),
            stock: currentStatus ? 0 : 100, // Toggle stock to toggle isAvailable status
            categoryId: menu.categoryId,
            imageUrl: menu.imageUrl
        };

        const response = await window.apiFetch(`/api/menus/update/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(menuPayload)
        });
        
        if (response.ok) {
            if (typeof window.showToast === 'function') {
                window.showToast('Product visibility metrics successfully shifted.', 'success');
            }
            fetchAdminCatalogInventory(); // Refresh array dari database
        }
    } catch (e) {
        console.error('Inventory deployment failure.', e);
    }
};

function setupAdminCatalogListeners() {
    const searchInp = document.getElementById('admin-menu-search');
    if (searchInp) {
        searchInp.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            currentPage = 1;
            renderAdminMenuCatalog();
        });
    }

    const sortSel = document.getElementById('admin-menu-sort');
    if (sortSel) {
        sortSel.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderAdminMenuCatalog();
        });
    }
}

window.handleAdminLogOut = function() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
};