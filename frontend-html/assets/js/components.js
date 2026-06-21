/**
 * Sela Cafe — Shared Components
 * Master visual reference: promo.html
 * Navbar & Footer structure extracted directly from promo.html.
 * Functional enhancements (real hrefs, active state, cart badge,
 * auth-aware profile) added without altering any visual classes.
 */

const API_BASE_URL = 'http://localhost:8090';

// ─── Global API Fetch Wrapper ─────────────────────────────────────────────────
window.apiFetch = async function(path, options = {}) {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    const token = localStorage.getItem('token');
    options.headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    try {
        const response = await fetch(url, options);
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
        }
        return response;
    } catch (error) {
        console.error(`API Fetch Error: ${url}`, error);
        throw error;
    }
};

// ─── Auth Helpers ─────────────────────────────────────────────────────────────
window.isAuthenticated = function() { return !!localStorage.getItem('token'); };
window.logout = function() { localStorage.clear(); window.location.href = 'login.html'; };

// ─── Cart Count ───────────────────────────────────────────────────────────────
window.getCartCount = function() {
    try {
        const cartStr = localStorage.getItem('cart');
        if (!cartStr) return 0;
        return JSON.parse(cartStr).reduce((sum, item) => sum + (item.quantity || 1), 0);
    } catch (e) { return 0; }
};

// ─── Toast Notification ───────────────────────────────────────────────────────
window.showToast = function(msg, type = 'default') {
    let toast = document.getElementById('sela-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'sela-toast';
        toast.className = 'fixed bottom-8 right-8 text-[11px] font-label-caps tracking-widest px-6 py-4 shadow-xl z-[200] transition-all duration-300 transform translate-y-4 opacity-0 pointer-events-none';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = toast.className.replace(/bg-\S+\s?/g, '').replace(/text-\S+\s?/g, '');
    if (type === 'error') {
        toast.classList.add('bg-error', 'text-white');
    } else if (type === 'success') {
        toast.classList.add('bg-moss-green', 'text-white');
    } else {
        toast.classList.add('bg-primary', 'text-paper-white');
    }
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.transform = 'translateY(1rem)';
        toast.style.opacity = '0';
    }, 2800);
};

// ─── Main Initialization ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) injectNavbar(navbarPlaceholder);

    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) injectFooter(footerPlaceholder);

    if (!document.querySelector('.grain-overlay')) {
        const grain = document.createElement('div');
        grain.className = 'grain-overlay';
        document.body.appendChild(grain);
    }
});

// ─── Navbar Injection (promo.html as master) ──────────────────────────────────
window.injectNavbar = function(container) {
    const currentPath = window.location.pathname.toLowerCase();
    const isHome     = /home\.html$/.test(currentPath) || currentPath.endsWith('/') || currentPath === '';
    const isMenu     = /menu\.html$/.test(currentPath) || /detailmenu\.html$/.test(currentPath);
    const isPromo    = /promo\.html$/.test(currentPath);
    const isCareer   = /career\.html$/.test(currentPath);
    const isLocations = /locations\.html$/.test(currentPath);

    const auth      = window.isAuthenticated();
    const userName  = localStorage.getItem('userName') || 'Guest';
    const cartCount = window.getCartCount();

    // Active link class — matches promo.html active style exactly
    const activeClass   = 'text-deep-espresso dark:text-primary-fixed border-b border-deep-espresso dark:border-primary-fixed pb-1 font-label-caps tracking-widest';
    const inactiveClass = 'text-on-surface-variant font-label-caps tracking-widest hover:text-deep-espresso transition-colors';

    const cartBadge = cartCount > 0
        ? `<span class="absolute -top-1.5 -right-1.5 bg-moss-green text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">${cartCount}</span>`
        : '';

    const personIcon = auth
        ? `<div class="relative group">
                <button class="hover:opacity-80 transition-all duration-300 active:scale-95 flex items-center gap-1" aria-label="Account menu">
                    <span class="material-symbols-outlined">person</span>
                    <span class="hidden lg:inline text-xs font-label-caps tracking-wide">${userName.split(' ')[0]}</span>
                </button>
                <div class="absolute right-0 top-full mt-2 w-48 bg-paper-white border border-outline-variant/30 shadow-md py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50">
                    <a href="order-tracking.html" class="block px-4 py-2 text-xs font-label-caps text-on-surface hover:bg-surface-container transition-colors">My Orders</a>
                    <button onclick="window.logout()" class="w-full text-left block px-4 py-2 text-xs font-label-caps text-error hover:bg-surface-container transition-colors">Sign Out</button>
                </div>
           </div>`
        : `<a href="login.html" class="hover:opacity-80 transition-all duration-300 active:scale-95" aria-label="Login">
               <span class="material-symbols-outlined">person</span>
           </a>`;

    // Exact promo.html navbar structure — only hrefs and active classes differ per page
    container.innerHTML = `
    <header class="sticky top-0 w-full z-50 bg-surface/95 dark:bg-surface-container/95 backdrop-blur-md border-b border-outline/10 dark:border-outline/20">
        <div class="flex justify-between items-center w-full px-6 md:px-margin-desktop py-6 max-w-container-max mx-auto">

            <a href="home.html" class="font-headline-md text-headline-md tracking-tight text-deep-espresso dark:text-primary-fixed select-none hover:opacity-85 transition-opacity" aria-label="Sela Cafe Home">
                Sela Cafe
            </a>

            <nav class="hidden md:flex items-center gap-8" aria-label="Main navigation">
                <a href="home.html"      class="${isHome      ? activeClass : inactiveClass}">Home</a>
                <a href="menu.html"      class="${isMenu      ? activeClass : inactiveClass}">Menu</a>
                <a href="promo.html"     class="${isPromo     ? activeClass : inactiveClass}">Promo</a>
                <a href="career.html"    class="${isCareer    ? activeClass : inactiveClass}">Career</a>
                <a href="locations.html" class="${isLocations ? activeClass : inactiveClass}">Locations</a>
            </nav>

            <div class="flex items-center gap-6 text-deep-espresso">
                <a href="menu.html" class="hover:opacity-80 transition-all duration-300 active:scale-95" aria-label="Search menu">
                    <span class="material-symbols-outlined">search</span>
                </a>

                <a href="cart.html" class="hover:opacity-80 transition-all duration-300 active:scale-95 relative" aria-label="Shopping bag">
                    <span class="material-symbols-outlined">shopping_bag</span>
                    ${cartBadge}
                </a>

                ${personIcon}
            </div>

        </div>
    </header>
    `;
};

// ─── Footer Injection (promo.html as master) ──────────────────────────────────
function injectFooter(container) {
    container.innerHTML = `
    <footer class="bg-deep-espresso dark:bg-surface-container-lowest border-t border-outline/20 w-full">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-gutter px-6 md:px-margin-desktop py-20 max-w-container-max mx-auto">

            <div class="col-span-1 md:col-span-1">
                <div class="font-headline-lg text-headline-lg text-paper-white dark:text-deep-espresso mb-6">Sela Cafe</div>
                <p class="font-body-md text-on-primary-container opacity-60 mb-8 max-w-xs">
                    Cultivating heritage in every cup through artisan roasting and community focused spaces.
                </p>
            </div>

            <div>
                <h4 class="font-label-caps text-label-caps text-paper-white dark:text-deep-espresso tracking-widest mb-8">JOURNEY</h4>
                <ul class="space-y-4">
                    <li><a class="text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors" href="home.html">Our Story</a></li>
                    <li><a class="text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors" href="locations.html">Locations</a></li>
                    <li><a class="text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors" href="#">Sustainability</a></li>
                </ul>
            </div>

            <div>
                <h4 class="font-label-caps text-label-caps text-paper-white dark:text-deep-espresso tracking-widest mb-8">PARTNERSHIP</h4>
                <ul class="space-y-4">
                    <li><a class="text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors" href="#">Wholesale</a></li>
                    <li><a class="text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors" href="career.html">Career</a></li>
                    <li><a class="text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors" href="#">Press Kit</a></li>
                </ul>
            </div>

            <div>
                <h4 class="font-label-caps text-label-caps text-paper-white dark:text-deep-espresso tracking-widest mb-8">LEGAL</h4>
                <ul class="space-y-4">
                    <li><a class="text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors" href="#">Privacy</a></li>
                    <li><a class="text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors" href="#">Terms</a></li>
                </ul>
            </div>

        </div>
        <div class="px-6 md:px-margin-desktop py-8 border-t border-white/5 max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <span class="font-label-caps text-[10px] text-on-primary-container opacity-40">© 2026 Sela Cafe. Cultivating heritage in every cup.</span>
            <div class="flex gap-6">
                <a class="text-on-primary-container opacity-40 hover:opacity-100 transition-opacity" href="#" aria-label="Website"><span class="material-symbols-outlined text-lg">public</span></a>
                <a class="text-on-primary-container opacity-40 hover:opacity-100 transition-opacity" href="#" aria-label="Chat"><span class="material-symbols-outlined text-lg">chat</span></a>
                <a class="text-on-primary-container opacity-40 hover:opacity-100 transition-opacity" href="#" aria-label="Share"><span class="material-symbols-outlined text-lg">share</span></a>
            </div>
        </div>
    </footer>
    `;
}