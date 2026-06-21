/**
 * Sela Cafe - Menu Management Script (DUMMY DATA MODE)
 * Fully synchronized with menu.html layout and global cart components.
 */

// 1. DATABASE DUMMY DATA LOKAL (Sesuai dengan produk awal Sela Cafe)
const DUMMY_PRODUCTS = [
    {
        id: 1,
        name: "Hazelnut Velvet Latte",
        price: 95000,
        category: "coffee",
        description: "A smooth blend of our signature espresso with toasted hazelnut essence and micro-foamed milk.",
        imageUrl: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop",
        stock: "AVAILABLE"
    },
    {
        id: 2,
        name: "Almond Croissant",
        price: 78000,
        category: "pastry",
        description: "Double-baked pastry filled with rich almond frangipane and topped with toasted slivers.",
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop",
        stock: "AVAILABLE"
    },
    {
        id: 3,
        name: "Ceremonial Matcha",
        price: 105000,
        category: "tea",
        description: "Uji-grade matcha whisked with oat milk for a creamy, earthy, and perfectly balanced finish.",
        imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600&auto=format&fit=crop",
        stock: "AVAILABLE"
    },
    {
        id: 4,
        name: "Signature Flat White",
        price: 82000,
        category: "coffee",
        description: "A crisp rosetta latte art with perfectly balanced sweetness and a velvety finish.",
        imageUrl: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=600&auto=format&fit=crop",
        stock: "AVAILABLE"
    },
    {
        id: 5,
        name: "24h Cold Brew",
        price: 98000,
        category: "coffee",
        description: "Cold brew coffee served with a large clear ice sphere, garnished with dried orange.",
        imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=600&auto=format&fit=crop",
        stock: "AVAILABLE"
    },
    {
        id: 6,
        name: "Dark Choc Sea Salt",
        price: 65000,
        category: "dessert",
        description: "The subtle salt flakes perfectly elevate the dark cocoa notes.",
        imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop",
        stock: "OUT_OF_STOCK" // Contoh item habis
    }
];

// State Management Global untuk Filter & Pencarian
let allProducts = [];
let currentCategory = 'all';
let searchQuery = '';
let currentSort = 'popular';

document.addEventListener('DOMContentLoaded', () => {
    initMenuPage();
});

let favoriteMenuIds = new Set();

/**
 * 2. Inisialisasi Utama Halaman Menu
 */
async function initMenuPage() {
    // 1. Coba load dari backend
    try {
        const response = await window.apiFetch('/api/menus/getAll');
        if (response.ok) {
            const apiRes = await response.json();
            const backendProducts = apiRes.data || [];
            if (backendProducts.length > 0) {
                // Map backend format to allProducts structure
                allProducts = backendProducts.map(p => ({
                    id: p.id,
                    name: p.nameId,
                    price: p.price,
                    category: p.categoryName || 'coffee',
                    description: p.descriptionId || 'Handcrafted specialty coffee blend.',
                    imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop',
                    stock: p.isAvailable && p.stock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'
                }));
            } else {
                allProducts = DUMMY_PRODUCTS;
            }
        } else {
            allProducts = DUMMY_PRODUCTS;
        }
    } catch (e) {
        console.error('Failed to fetch menus from backend, using dummy data', e);
        allProducts = DUMMY_PRODUCTS;
    }

    // 2. Coba load favorites jika user login
    if (window.isAuthenticated()) {
        try {
            const favRes = await window.apiFetch('/api/favorites/my');
            if (favRes.ok) {
                const apiRes = await favRes.json();
                const favorites = apiRes.data || [];
                favoriteMenuIds = new Set(favorites.map(f => f.menuId));
            }
        } catch (e) {
            console.error('Failed to fetch user favorites', e);
        }
    }
    
    // Render
    renderTodaysPicks();
    renderFullMenu();
    setupMenuEventListeners();
}

/**
 * 3. Render Bagian "Today's Picks" (3 Menu Teratas)
 */
function renderTodaysPicks() {
    const picksGrid = document.getElementById('todays-picks-grid');
    if (!picksGrid || allProducts.length === 0) return;

    // Ambil 3 produk pertama untuk rekomendasi barista
    const picks = allProducts.slice(0, 3);

    picksGrid.innerHTML = picks.map(product => {
        const isOutOfStock = product.stock === 'OUT_OF_STOCK';
        
        return `
            <div class="flex flex-col">
                <div class="relative aspect-[3/4] mb-6 overflow-hidden bg-surface-container group">
                    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                         src="${product.imageUrl}" alt="${product.name}">
                    <div class="absolute top-4 left-4 bg-secondary text-on-secondary px-3 py-1 font-label-caps text-[10px] tracking-widest">Barista Recommendation</div>
                    ${isOutOfStock ? `
                        <div class="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center">
                            <span class="bg-error text-white font-label-caps text-[10px] tracking-widest px-3 py-1.5">Habis</span>
                        </div>
                    ` : ''}
                </div>
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-headline-md text-headline-md">${product.name}</h3>
                    <span class="font-label-md text-label-md text-primary">Rp ${Number(product.price).toLocaleString('id-ID')}</span>
                </div>
                <p class="font-body-md text-on-surface-variant mb-6">${product.description}</p>
                <button onclick="handleMenuAddToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.imageUrl}')"
                        ${isOutOfStock ? 'disabled' : ''}
                        class="w-full py-4 bg-primary text-on-primary font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
                    ${isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                </button>
            </div>
        `;
    }).join('');
}

/**
 * 4. Render Bagian Utama "Full Menu Grid" + Fitur Filter Kategori & Search
 */
function renderFullMenu() {
    const productsGrid = document.getElementById('full-menu-grid');
    if (!productsGrid) return;

    // Filter data berdasarkan kategori aktif dan input pencarian
    let filtered = allProducts.filter(product => {
        const matchesCategory = currentCategory === 'all' || 
            (product.category && product.category.toLowerCase() === currentCategory.toLowerCase());
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Sistem Pengurutan (Sorting) Ringkas
    if (currentSort === 'low-high') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'high-low') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'newest') {
        filtered.sort((a, b) => b.id - a.id);
    }

    if (filtered.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-16 opacity-60">
                <span class="material-symbols-outlined text-4xl mb-2">search_off</span>
                <p class="font-body-md text-on-surface-variant">Menu tidak ditemukan. Sila cari kata kunci lain.</p>
            </div>`;
        return;
    }

    productsGrid.innerHTML = filtered.map(product => {
        const isOutOfStock = product.stock === 'OUT_OF_STOCK';
        
        return `
            <div class="group flex flex-col justify-between">
                <div>
                    <div class="relative aspect-square mb-6 overflow-hidden bg-surface-container">
                        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                             src="${product.imageUrl}" alt="${product.name}"/>
                        <button onclick="event.preventDefault(); toggleMenuFavorite(${product.id}, this)"
                                class="absolute top-4 right-4 w-10 h-10 bg-paper-white/80 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-paper-white transition-colors">
                            <span class="material-symbols-outlined text-[20px] ${favoriteMenuIds.has(product.id) ? 'text-error active-heart' : 'text-primary'}"
                                  style="font-variation-settings: 'FILL' ${favoriteMenuIds.has(product.id) ? '1' : '0'}, 'wght' 300;">favorite</span>
                        </button>
                        ${isOutOfStock ? `
                            <div class="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center">
                                <span class="bg-error text-white font-label-caps text-[10px] tracking-widest px-3 py-1.5">Habis</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="flex justify-between items-start mb-2">
                        <h5 class="font-headline-md text-[20px] text-primary line-clamp-1">${product.name}</h5>
                        <span class="font-label-md text-primary pl-2 whitespace-nowrap">Rp ${Number(product.price).toLocaleString('id-ID')}</span>
                    </div>
                    <div class="flex items-center gap-1 mb-3">
                        <span class="material-symbols-outlined text-[14px] text-tertiary-fixed-dim" style="font-variation-settings: 'FILL' 1;">star</span>
                        <span class="font-label-md text-[12px] text-on-surface-variant">4.9</span>
                    </div>
                </div>
                <button onclick="handleMenuAddToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.imageUrl}')"
                        ${isOutOfStock ? 'disabled' : ''}
                        class="w-full py-3 border border-outline text-primary font-label-caps text-[11px] hover:bg-primary hover:text-on-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    ${isOutOfStock ? 'Habis' : 'Add to Cart'}
                </button>
            </div>
        `;
    }).join('');
}

/**
 * 5. Event Listeners Kontrol Konten
 */
function setupMenuEventListeners() {
    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderFullMenu();
        });
    }

    const sortSelect = document.getElementById('menu-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderFullMenu();
        });
    }
}

/**
 * Filter Kategori via Tab Menu Utama
 */
window.filterCategory = function(category, element) {
    currentCategory = category;
    
    const tabs = document.querySelectorAll('#category-tabs-container button');
    tabs.forEach(tab => {
        tab.className = "font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors pb-1 whitespace-nowrap";
    });

    element.className = "font-label-caps text-label-caps text-primary border-b-2 border-primary pb-1 whitespace-nowrap";
    renderFullMenu();
};

/**
 * Filter Kategori via Tombol Cepat Bulat di Bagian Atas (Hero)
 */
window.filterByQuickCategory = function(category) {
    const tabs = document.querySelectorAll('#category-tabs-container button');
    tabs.forEach(tab => {
        const tabText = tab.textContent.trim().toLowerCase();
        if (tabText === category || (category === 'all' && tabText === 'all items')) {
            tab.click();
            tab.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
};

/**
 * Tambah Item ke LocalStorage Keranjang & Sinkronkan Navbar Counter
 */
window.handleMenuAddToCart = function(id, name, price, imageUrl) {
    let cart = [];
    try {
        const cartStr = localStorage.getItem('cart');
        if (cartStr) cart = JSON.parse(cartStr);
    } catch (e) {
        cart = [];
    }

    const existingIndex = cart.findIndex(item => item.id === id);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ id, name, price, imageUrl, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Panggil ulang komponen global navbar biar badge-nya langsung terupdate nilainya
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder && typeof window.injectNavbar === 'function') {
        window.injectNavbar(navbarPlaceholder);
    }

    showToastNotification(`${name} added to your bag.`);
};

function showToastNotification(msg) {
    let toast = document.getElementById('menu-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'menu-toast';
        toast.className = 'fixed bottom-8 right-8 bg-primary text-paper-white text-[11px] font-label-caps tracking-widest px-6 py-4 shadow-xl z-[100] transition-all duration-300 transform translate-y-4 opacity-0 border border-outline-variant/20';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.remove('opacity-0', 'translate-y-4');
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
    }, 2500);
}

window.toggleMenuFavorite = async function(productId, btnEl) {
    if (!window.isAuthenticated()) {
        const currentPath = window.location.pathname;
        window.location.href = `login.html?redirect=${encodeURIComponent(currentPath)}`;
        return;
    }

    const isFavorited = favoriteMenuIds.has(productId);
    const url = isFavorited ? `/api/favorites/removed/${productId}` : `/api/favorites/add/${productId}`;
    const method = isFavorited ? 'DELETE' : 'POST';

    try {
        const res = await window.apiFetch(url, { method });
        if (res.ok) {
            const icon = btnEl.querySelector('.material-symbols-outlined');
            if (isFavorited) {
                favoriteMenuIds.delete(productId);
                icon.style.fontVariationSettings = "'FILL' 0, 'wght' 300";
                icon.classList.remove('text-error', 'active-heart');
                icon.classList.add('text-primary');
                showToastNotification('Removed from favorites.');
            } else {
                favoriteMenuIds.add(productId);
                icon.style.fontVariationSettings = "'FILL' 1, 'wght' 300";
                icon.classList.add('text-error', 'active-heart');
                icon.classList.remove('text-primary');
                showToastNotification('Added to favorites.');
            }
        } else {
            showToastNotification('Failed to update favorite status.');
        }
    } catch (err) {
        console.error(err);
        showToastNotification('Error connecting to favorites service.');
    }
};