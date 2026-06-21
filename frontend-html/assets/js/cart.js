/**
 * Sela Cafe — Cart Module
 * Renders cart from localStorage, handles CRUD, and updates totals.
 */

const SERVICE_FEE_PCT = 0.10; // 10%

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

// ─── Load & Render Cart ───────────────────────────────────────────────────────
function getCart() {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
    catch (e) { return []; }
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateNavbarBadge();
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const countEl   = document.getElementById('cart-item-count');
    const subtotalEl = document.getElementById('cart-subtotal');
    const serviceFeeEl = document.getElementById('cart-service-fee');
    const grandTotalEl = document.getElementById('cart-grand-total');
    const checkoutBtn  = document.getElementById('btn-checkout');

    const cart = getCart();
    const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);

    if (countEl) countEl.textContent = `${totalItems} ITEM${totalItems !== 1 ? 'S' : ''} IN BASKET`;

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-32 text-center">
            <span class="material-symbols-outlined text-6xl mb-6 opacity-30">shopping_bag</span>
            <h3 class="font-headline-md text-headline-md text-deep-espresso mb-3">Your ritual is empty</h3>
            <p class="font-body-md text-on-surface-variant mb-8">Discover our artisan menu and add your first selection.</p>
            <a href="menu.html" class="bg-deep-espresso text-paper-white font-label-caps text-label-caps tracking-widest px-8 py-4 hover:opacity-90 transition-all">
                Browse Menu
            </a>
        </div>`;
        if (subtotalEl) subtotalEl.textContent = 'Rp 0';
        if (serviceFeeEl) serviceFeeEl.textContent = 'Rp 0';
        if (grandTotalEl) grandTotalEl.textContent = 'Rp 0';
        if (checkoutBtn) { checkoutBtn.disabled = true; checkoutBtn.classList.add('opacity-40', 'cursor-not-allowed'); }
        return;
    }

    if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.classList.remove('opacity-40', 'cursor-not-allowed'); }

    // Build cart item HTML
    container.innerHTML = cart.map((item, index) => `
    <div class="group relative flex flex-col sm:flex-row gap-6 p-6 bg-paper-white border border-outline-muted transition-all hover:border-outline" data-index="${index}">
        <button onclick="removeItem(${index})"
                class="absolute top-4 right-4 text-on-surface-variant/40 hover:text-error transition-colors"
                aria-label="Remove ${item.name}">
            <span class="material-symbols-outlined text-sm">close</span>
        </button>
        <div class="w-full sm:w-40 h-40 overflow-hidden bg-surface-container shrink-0">
            <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                 src="${item.imageUrl || 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=300'}"
                 alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=300'"/>
        </div>
        <div class="flex-1 flex flex-col justify-between gap-4">
            <div>
                <h3 class="font-headline-md text-headline-md text-deep-espresso mb-1">${item.name}</h3>
                <span class="font-label-md text-label-md text-on-surface-variant">Artisan Preparation</span>
            </div>
            <div class="flex items-center justify-between">
                <!-- Quantity controls -->
                <div class="flex items-center border border-outline-muted">
                    <button onclick="changeQty(${index}, -1)"
                            class="px-3 py-2 hover:bg-surface-container transition-colors"
                            aria-label="Decrease quantity">
                        <span class="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span class="px-5 font-label-md text-label-md min-w-[2.5rem] text-center">${item.quantity || 1}</span>
                    <button onclick="changeQty(${index}, 1)"
                            class="px-3 py-2 hover:bg-surface-container transition-colors"
                            aria-label="Increase quantity">
                        <span class="material-symbols-outlined text-sm">add</span>
                    </button>
                </div>
                <!-- Item price -->
                <span class="font-label-caps text-label-md text-deep-espresso font-semibold">
                    ${formatIDR(item.price * (item.quantity || 1))}
                </span>
            </div>
        </div>
    </div>
    `).join('');

    // Update summary
    const subtotal = cart.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
    const fee = Math.round(subtotal * SERVICE_FEE_PCT);
    const total = subtotal + fee;

    if (subtotalEl) subtotalEl.textContent = formatIDR(subtotal);
    if (serviceFeeEl) serviceFeeEl.textContent = formatIDR(fee);
    if (grandTotalEl) grandTotalEl.textContent = formatIDR(total);
}

// ─── Cart CRUD ────────────────────────────────────────────────────────────────
window.changeQty = function(index, delta) {
    const cart = getCart();
    if (!cart[index]) return;
    cart[index].quantity = Math.max(1, (cart[index].quantity || 1) + delta);
    saveCart(cart);
    renderCart();
};

window.removeItem = function(index) {
    const cart = getCart();
    if (!cart[index]) return;
    const name = cart[index].name;
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    if (typeof window.showToast === 'function') window.showToast(`${name} removed.`);
};

// ─── Navbar Badge Sync ────────────────────────────────────────────────────────
function updateNavbarBadge() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder && typeof window.injectNavbar === 'function') {
        window.injectNavbar(navbarPlaceholder);
    }
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function formatIDR(amount) {
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

// Also expose so menu.js can reuse
window.handleMenuAddToCart = function(id, name, price, imageUrl) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === id || item.name === name);
    if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({ id, name, price, imageUrl, quantity: 1 });
    }
    saveCart(cart);
    if (typeof window.showToast === 'function') {
        window.showToast(`${name} added to your bag.`);
    }
    updateNavbarBadge();
};
