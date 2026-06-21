/**
 * Sela Cafe — Customer Favorites Script
 * Fetches favorites and resolves catalog details.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!window.isAuthenticated()) {
        window.location.href = '../web/login.html?redirect=../customer/favorites.html';
        return;
    }
    loadCustomerFavorites();
});

async function loadCustomerFavorites() {
    const grid = document.getElementById('favorites-grid');
    if (!grid) return;

    try {
        // Fetch favorites and menus in parallel
        const [favRes, menuRes] = await Promise.all([
            window.apiFetch('/api/favorites/my'),
            window.apiFetch('/api/menus/getAll')
        ]);

        if (favRes.ok && menuRes.ok) {
            const favData = await favRes.json();
            const menuData = await menuRes.json();

            const favorites = favData.data || [];
            const menus = menuData.data || [];

            if (favorites.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-24 opacity-60">
                        <span class="material-symbols-outlined text-5xl mb-4 text-outline-muted">favorite_border</span>
                        <p class="font-headline-md text-headline-md text-deep-espresso">No favorites yet</p>
                        <p class="font-body-md text-on-surface-variant mt-2 max-w-xs mx-auto">Explore our menu and save your favorite selections for quick access.</p>
                    </div>
                `;
                return;
            }

            // Map favorites to menu details
            const items = favorites.map(fav => {
                const menu = menus.find(m => m.id === fav.menuId);
                return {
                    id: fav.id,
                    menuId: fav.menuId,
                    name: menu ? menu.nameId : fav.menuNameId,
                    category: menu ? menu.categoryName : 'COFFEE',
                    description: menu ? menu.descriptionId : 'Handcrafted specialty coffee blend.',
                    price: menu ? menu.price : 0,
                    imageUrl: menu ? menu.imageUrl : fav.imageUrl,
                    isAvailable: menu ? menu.isAvailable : true,
                    stock: menu ? menu.stock : 0
                };
            });

            grid.innerHTML = items.map(item => {
                const isOutOfStock = !item.isAvailable || item.stock <= 0;
                return `
                    <div class="product-card group relative flex flex-col justify-between h-full bg-paper-white border border-outline-muted p-8 transition-all hover:shadow-lg">
                        <div class="relative aspect-[4/5] bg-surface-container overflow-hidden mb-8">
                            <img class="w-full h-full object-cover image-warm-hover" src="${item.imageUrl}" alt="${item.name}">
                            <button class="absolute top-4 right-4 w-10 h-10 bg-paper-white rounded-full flex items-center justify-center shadow-md text-primary hover:scale-105 active:scale-95 transition-all" onclick="event.preventDefault(); removeFavoriteItem(${item.menuId})">
                                <span class="material-symbols-outlined active-heart" style="font-variation-settings: 'FILL' 1, 'wght' 300;">favorite</span>
                            </button>
                            ${isOutOfStock ? `
                                <div class="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center">
                                    <span class="bg-error text-white font-label-caps text-[10px] tracking-widest px-3 py-1.5">Habis</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="flex-grow flex flex-col justify-between">
                            <div>
                                <span class="font-label-caps text-label-caps text-outline mb-2 block uppercase">${item.category}</span>
                                <h3 class="font-headline-md text-headline-md text-deep-espresso mb-4 leading-tight">${item.name}</h3>
                                <p class="font-body-md text-on-surface-variant leading-relaxed mb-6 italic">"${item.description}"</p>
                            </div>
                            <div class="flex justify-between items-center pt-4 border-t border-outline-muted">
                                <span class="font-label-md text-label-md text-primary font-semibold">Rp ${Number(item.price).toLocaleString('id-ID')}</span>
                                <button onclick="event.preventDefault(); quickAddFavorite(${item.menuId}, '${item.name.replace(/'/g, "\\'")}', ${item.price}, '${item.imageUrl}')" 
                                        ${isOutOfStock ? 'disabled' : ''}
                                        class="px-6 py-3 border border-deep-espresso text-deep-espresso font-label-caps text-[10px] tracking-widest hover:bg-deep-espresso hover:text-white transition-all duration-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-deep-espresso disabled:cursor-not-allowed">
                                    QUICK ADD
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Hover effect for image treatments (30% grayscale warm up)
            const favImgs = grid.querySelectorAll('img');
            favImgs.forEach(img => {
                img.style.filter = 'grayscale(30%)';
                img.style.transition = 'filter 0.5s ease';
                img.parentElement.addEventListener('mouseenter', () => {
                    img.style.filter = 'grayscale(0%)';
                });
                img.parentElement.addEventListener('mouseleave', () => {
                    img.style.filter = 'grayscale(30%)';
                });
            });

        } else {
            grid.innerHTML = `<div class="col-span-full text-center py-16 text-error">Failed to load favorites.</div>`;
        }
    } catch (e) {
        console.error(e);
        grid.innerHTML = `<div class="col-span-full text-center py-16 text-error">Error connecting to server.</div>`;
    }
}

async function removeFavoriteItem(menuId) {
    try {
        const res = await window.apiFetch(`/api/favorites/removed/${menuId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            window.showToast('Favorite removed.', 'success');
            loadCustomerFavorites();
        } else {
            const data = await res.json().catch(() => ({}));
            window.showToast(data.message || 'Failed to remove favorite.', 'error');
        }
    } catch (e) {
        console.error(e);
        window.showToast('Error removing favorite.', 'error');
    }
}

window.quickAddFavorite = function(id, name, price, imageUrl) {
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

    // Refresh navbar badge
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder && typeof window.injectNavbar === 'function') {
        window.injectNavbar(navbarPlaceholder);
    }

    window.showToast(`${name} added to your bag.`, 'success');
};
