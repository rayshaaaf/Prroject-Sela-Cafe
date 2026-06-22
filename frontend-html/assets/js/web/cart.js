/**
 * Sela Cafe — Cart Module
 * Renders cart from localStorage, handles CRUD, updates totals, and syncs UI.
 */

const SERVICE_FEE_PCT = 0.10; // 10%

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

// ─── Load & Render Cart ───────────────────────────────────────────────────────
function getCart() {
    try { 
        return JSON.parse(localStorage.getItem('cart') || '[]'); 
    } catch (e) { 
        return []; 
    }
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

    if (countEl) countEl.textContent = `${totalItems} ITEM${totalItems !== 1 ? 'S' : ''}`;

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-center bg-paper-white border border-outline/10 h-full">
            <span class="material-symbols-outlined text-[64px] mb-6 text-outline/30">shopping_bag</span>
            <h3 class="font-headline-md text-headline-md text-deep-espresso mb-4">Your ritual is empty</h3>
            <p class="font-body-md text-on-surface-variant mb-10 max-w-sm">Discover our artisan menu and curate your first heritage selection.</p>
            <button onclick="window.location.href='menu.html'" class="bg-deep-espresso text-paper-white font-label-caps tracking-widest px-10 py-4 hover:bg-primary transition-all pressed-state">
                EXPLORE MENU
            </button>
        </div>`;
        
        if (subtotalEl) subtotalEl.textContent = 'Rp 0';
        if (serviceFeeEl) serviceFeeEl.textContent = 'Rp 0';
        if (grandTotalEl) grandTotalEl.textContent = 'Rp 0';
        if (checkoutBtn) { 
            checkoutBtn.disabled = true; 
            checkoutBtn.classList.add('opacity-40', 'cursor-not-allowed'); 
            checkoutBtn.classList.remove('hover:bg-primary', 'pressed-state');
        }
        return;
    }

    if (checkoutBtn) { 
        checkoutBtn.disabled = false; 
        checkoutBtn.classList.remove('opacity-40', 'cursor-not-allowed'); 
        checkoutBtn.classList.add('hover:bg-primary', 'pressed-state');
    }

    // Build cart item HTML to match Sela Cafe's premium visual standard
    container.innerHTML = cart.map((item, index) => `
    <div class="group relative flex flex-col sm:flex-row gap-8 p-6 bg-paper-white border border-outline/10 transition-all duration-300 hover:border-outline/30 shadow-sm hover:shadow-md" data-index="${index}">
        
        <button onclick="removeItem(${index})"
                class="absolute top-6 right-6 text-on-surface-variant/40 hover:text-error transition-colors bg-transparent border-none p-1 cursor-pointer z-10"
                aria-label="Remove ${item.name}">
            <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
        
        <div class="w-full sm:w-32 md:w-40 aspect-square overflow-hidden bg-surface-container shrink-0 border border-outline/5">
            <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                 src="${item.imageUrl || 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=300'}"
                 alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=300'"/>
        </div>
        
        <div class="flex-1 flex flex-col justify-between py-2">
            <div class="mb-6 pr-10">
                <span class="font-label-caps text-[10px] text-moss-green tracking-widest uppercase block mb-2">Artisan Preparation</span>
                <h3 class="font-headline-md text-[24px] text-deep-espresso leading-tight">${item.name}</h3>
            </div>
            
            <div class="flex items-end justify-between mt-auto">
                <div class="flex items-center border border-outline/20 bg-surface-container-low">
                    <button onclick="changeQty(${index}, -1)" class="px-3 py-2 hover:bg-surface-container transition-colors text-on-surface-variant hover:text-deep-espresso pressed-state">
                        <span class="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span class="font-label-md text-[14px] text-deep-espresso min-w-[2.5rem] text-center font-semibold">${item.quantity || 1}</span>
                    <button onclick="changeQty(${index}, 1)" class="px-3 py-2 hover:bg-surface-container transition-colors text-on-surface-variant hover:text-deep-espresso pressed-state">
                        <span class="material-symbols-outlined text-[16px]">add</span>
                    </button>
                </div>
                
                <span class="font-label-md text-[16px] text-deep-espresso font-semibold">
                    ${formatIDR(item.price * (item.quantity || 1))}
                </span>
            </div>
        </div>
    </div>
    `).join('');

    // Update Summary Calcs
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
    
    const newQty = (cart[index].quantity || 1) + delta;
    
    if (newQty < 1) {
        removeItem(index); // Remove item if quantity goes below 1
    } else {
        cart[index].quantity = newQty;
        saveCart(cart);
        renderCart();
    }
};

window.removeItem = function(index) {
    const cart = getCart();
    if (!cart[index]) return;
    const name = cart[index].name;
    
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    
    if (typeof window.showToast === 'function') {
        window.showToast(`${name} removed from your ritual.`, 'default');
    }
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

// Global exposure for menu additions
window.handleMenuAddToCart = function(id, name, price, imageUrl) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.name === name);
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({ id, name, price, imageUrl, quantity: 1 });
    }
    
    saveCart(cart);
    
    if (typeof window.showToast === 'function') {
        window.showToast(`${name} added to your bag.`, 'success');
    }
    
    updateNavbarBadge();
};