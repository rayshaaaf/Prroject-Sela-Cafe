/**
 * Sela Cafe - Menu Management Script (PRODUCTION ARCHITECTURE)
 */

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
        stock: "OUT_OF_STOCK"
    }
];

let allProducts = [];
let currentCategory = 'all';
let searchQuery = '';
let currentSort = 'popular';
let favoriteMenuIds = new Set();

document.addEventListener('DOMContentLoaded', () => {
    initMenuPage();
});

/**
 * 1. Tarik Data Backend Java API
 */
async function initMenuPage() {
    // 1. Tampilkan dari cache atau dummy secara instan agar tidak lag
    const cached = sessionStorage.getItem('all_menus');
    if (cached) {
        try {
            allProducts = JSON.parse(cached);
        } catch (e) {
            allProducts = [];
        }
    }
    
    if (allProducts.length === 0) {
        allProducts = DUMMY_PRODUCTS;
    }

    // Render secara instan
    renderTodaysPicks();
    renderFullMenu();
    setupMenuEventListeners();

    // 2. Fetch background (Stale-While-Revalidate)
    try {
        const response = await window.apiFetch('/api/menus/getAll');
        if (response.ok) {
            const apiRes = await response.json();
            const backendProducts = apiRes.data || [];
            
            if (backendProducts.length > 0) {
                const freshProducts = backendProducts.map(p => ({
                    id: p.id,
                    name: p.nameId || p.name || 'Artisan Brew',
                    price: p.price || 0,
                    category: p.categoryName || p.category || 'coffee',
                    description: p.descriptionId || p.description || 'Handcrafted specialty curation.',
                    imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop',
                    stock: p.isAvailable && p.stock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'
                }));

                // Bandingkan isi untuk mencegah kedipan / re-render berlebih
                if (JSON.stringify(allProducts) !== JSON.stringify(freshProducts)) {
                    allProducts = freshProducts;
                    sessionStorage.setItem('all_menus', JSON.stringify(allProducts));
                    renderTodaysPicks();
                    renderFullMenu();
                }
            }
        }
    } catch (e) {
        console.warn('Background database sync failed, using cached/offline fallback.', e);
    }

    // Load favorites in background
    if (window.isAuthenticated()) {
        try {
            const favRes = await window.apiFetch('/api/favorites/my');
            if (favRes.ok) {
                const apiRes = await favRes.json();
                favoriteMenuIds = new Set((apiRes.data || []).map(f => f.menuId));
                renderFullMenu();
            }
        } catch (e) {
            console.error(e);
        }
    }
}

/**
 * 2. Render Grid Utama + Cerdas Menangani Kata "kopi" & Fallback English
 */
function renderFullMenu() {
    const productsGrid = document.getElementById('full-menu-grid');
    const counterDisplay = document.getElementById('menu-counter');
    if (!productsGrid) return;

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

    if (currentSort === 'low-high') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'high-low') {
        filtered.sort((a, b) => b.price - a.price);
    }

    if (counterDisplay) {
        counterDisplay.textContent = `Showing ${filtered.length} items`;
    }

    if (filtered.length === 0) {
        productsGrid.className = "px-margin-mobile md:px-margin-desktop py-12 col-span-full flex flex-col items-center justify-center text-center fade-in-smooth";
        productsGrid.innerHTML = `
            <div class="max-w-md space-y-4">
                <span class="material-symbols-outlined text-[48px] text-outline">hourglass_empty</span>
                <h4 class="font-headline-md text-headline-md text-primary">Item Not Found</h4>
                <p class="font-body-md text-on-surface-variant">We couldn't find any items matching your criteria. Please try a different keyword or check your spelling.</p>
            </div>
        `;
        return;
    }

    productsGrid.className = "px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-x-gutter gap-y-16 fade-in-smooth";

    productsGrid.innerHTML = filtered.map(product => {
        const isOutOfStock = product.stock === 'OUT_OF_STOCK';
        return `
            <div class="group flex flex-col justify-between">
                <div>
                    <div class="relative aspect-square mb-6 overflow-hidden bg-surface-container rounded-lg">
                        <a href="detailmenu.html?id=${product.id}">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${product.imageUrl}" alt="${product.name}"/>
                        </a>
                        <button onclick="event.preventDefault(); toggleMenuFavorite(${product.id}, this)"
                                class="absolute top-4 right-4 w-10 h-10 bg-paper-white/80 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-paper-white transition-colors cursor-pointer">
                            <span class="material-symbols-outlined text-[20px] ${favoriteMenuIds.has(product.id) ? 'text-error' : 'text-primary'}"
                                  style="font-variation-settings: 'FILL' ${favoriteMenuIds.has(product.id) ? '1' : '0'}, 'wght' 300;">favorite</span>
                        </button>
                        ${isOutOfStock ? `<div class="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center"><span class="bg-error text-white font-label-caps text-[10px] tracking-widest px-3 py-1.5 rounded-sm">Sold Out</span></div>` : ''}
                    </div>
                    <div class="flex justify-between items-start mb-2 gap-2">
                        <a href="detailmenu.html?id=${product.id}" class="hover:underline">
                            <h5 class="font-headline-md text-[20px] text-primary line-clamp-1">${product.name}</h5>
                        </a>
                        <span class="font-label-md text-primary pl-2 whitespace-nowrap">Rp ${Number(product.price).toLocaleString('id-ID')}</span>
                    </div>
                    <div class="flex items-center gap-1 mb-3">
                        <span class="material-symbols-outlined text-[14px] text-tertiary-fixed-dim" style="font-variation-settings: 'FILL' 1;">star</span>
                        <span class="font-label-md text-[12px] text-on-surface-variant">4.9</span>
                    </div>
                </div>
                <button onclick="handleMenuAddToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.imageUrl}')"
                        ${isOutOfStock ? 'disabled' : ''}
                        class="w-full py-3 border border-outline text-primary font-label-caps text-[11px] hover:bg-primary hover:text-on-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer rounded-sm">
                    ${isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                </button>
            </div>
        `;
    }).join('');
}

/**
 * 3. Fungsi Pemicu Pencarian Global (Diikat Melalui Atribut oninput HTML)
 */
window.executeSearchRealTime = function(val) {
    searchQuery = val;
    renderFullMenu();
};

/**
 * 4. 24h Rotational Daily Selection Algorithm (Today's Picks)
 */
function getDailyPicks(products) {
    if (products.length <= 3) return products;
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    let selectedPicks = [];
    let indices = new Set();
    let attempt = 0;
    while (indices.size < 3 && attempt < 100) {
        const pseudoRandomHash = Math.abs(Math.sin(dateSeed + attempt));
        const index = Math.floor(pseudoRandomHash * products.length);
        if (!indices.has(index)) {
            indices.add(index);
            selectedPicks.push(products[index]);
        }
        attempt++;
    }
    return selectedPicks;
}

function renderTodaysPicks() {
    const picksGrid = document.getElementById('todays-picks-grid');
    if (!picksGrid || allProducts.length === 0) return;

    const picks = getDailyPicks(allProducts);

    picksGrid.innerHTML = picks.map(product => {
        const isOutOfStock = product.stock === 'OUT_OF_STOCK';
        return `
            <div class="flex flex-col justify-between">
                <div>
                    <a href="detailmenu.html?id=${product.id}" class="relative aspect-[3/4] mb-6 overflow-hidden bg-surface-container group block rounded-lg">
                        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${product.imageUrl}" alt="${product.name}">
                        <div class="absolute top-4 left-4 bg-secondary text-on-secondary px-3 py-1 font-label-caps text-[10px] tracking-widest">Barista Recommendation</div>
                        ${isOutOfStock ? `<div class="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center"><span class="bg-error text-white font-label-caps text-[10px] tracking-widest px-3 py-1.5 rounded-sm">Sold Out</span></div>` : ''}
                    </a>
                    <div class="flex justify-between items-start mb-2 gap-2">
                        <a href="detailmenu.html?id=${product.id}" class="hover:underline">
                            <h3 class="font-headline-md text-headline-md text-primary line-clamp-1">${product.name}</h3>
                        </a>
                        <span class="font-label-md text-label-md text-primary whitespace-nowrap">Rp ${Number(product.price).toLocaleString('id-ID')}</span>
                    </div>
                    <p class="font-body-md text-on-surface-variant mb-6 line-clamp-2">${product.description}</p>
                </div>
                <button onclick="handleMenuAddToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.imageUrl}')"
                        ${isOutOfStock ? 'disabled' : ''}
                        class="w-full py-4 bg-primary text-on-primary font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer rounded-sm">
                    ${isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                </button>
            </div>
        `;
    }).join('');
}

function setupMenuEventListeners() {
    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            executeSearchRealTime(e.target.value);
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

window.filterCategory = function(category, element) {
    currentCategory = category;
    const tabs = document.querySelectorAll('#category-tabs-container button');
    tabs.forEach(tab => tab.className = "font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors pb-2 whitespace-nowrap cursor-pointer");
    element.className = "font-label-caps text-label-caps text-primary border-b-2 border-primary pb-2 whitespace-nowrap cursor-pointer";
    renderFullMenu();
};

window.handleMenuAddToCart = function(id, name, price, imageUrl) {
    let cart = [];
    try {
        const cartStr = localStorage.getItem('cart');
        if (cartStr) cart = JSON.parse(cartStr);
    } catch (e) { cart = []; }

    const idx = cart.findIndex(item => item.id === id);
    if (idx > -1) cart[idx].quantity += 1;
    else cart.push({ id, name, price, imageUrl, quantity: 1 });

    localStorage.setItem('cart', JSON.stringify(cart));
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder && typeof window.injectNavbar === 'function') window.injectNavbar(navbarPlaceholder);
    if (typeof window.showToast === 'function') window.showToast(`${name} successfully added to bag.`, 'success');
};

window.toggleMenuFavorite = async function(productId, btnEl) {
    if (!window.isAuthenticated()) {
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
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
                icon.classList.remove('text-error');
                icon.classList.add('text-primary');
                if (typeof window.showToast === 'function') window.showToast('Removed from favorites.', 'success');
            } else {
                favoriteMenuIds.add(productId);
                icon.style.fontVariationSettings = "'FILL' 1, 'wght' 300";
                icon.classList.add('text-error');
                icon.classList.remove('text-primary');
                if (typeof window.showToast === 'function') window.showToast('Added to favorites.', 'success');
            }
        }
    } catch (err) { console.error(err); }
};