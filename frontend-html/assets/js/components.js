/**
 * Sela Cafe — Shared Components (FINAL UTUH & INTEGRATED VERSION)
 * Master visual reference: promo.html
 */

const API_BASE_URL = `http://${window.location.hostname}:8090`;

// ─── Global API Fetch Wrapper ─────────────────────────────────────────────────
window.getLoginRedirectPath = function() {
    const currentPath = window.location.pathname.toLowerCase();
    if (currentPath.includes('/admin/') || currentPath.includes('/customer/') || currentPath.includes('/cashier/') || currentPath.includes('/kitchen/') || currentPath.includes('/courier/')) {
        return '../web/login.html';
    }
    return 'login.html';
};

window.apiFetch = async function(path, options = {}) {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (headers['Content-Type'] === 'multipart/form-data' || headers['Content-Type'] === null || headers['Content-Type'] === 'none') {
        delete headers['Content-Type'];
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;
    options.headers = headers;
    try {
        const response = await fetch(url, options);
        if (response.status === 401) {
            window.clearAuthSession();
            window.location.href = window.getLoginRedirectPath();
        }
        return response;
    } catch (error) {
        console.error(`API Fetch Error: ${url}`, error);
        throw error;
    }
};

// Helper to clear auth session keys while preserving user avatars and cart items
window.clearAuthSession = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
};

// ─── Auth Helpers ─────────────────────────────────────────────────────────────
window.isAuthenticated = function() { return !!localStorage.getItem('token'); };
window.checkAdminAuth = function() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || !role || role.toUpperCase() !== 'ADMIN') {
        window.clearAuthSession();
        window.location.href = window.getLoginRedirectPath();
    }
};
window.logout = function() {
    window.clearAuthSession();
    window.location.href = window.getLoginRedirectPath();
};

// ─── Cart Count ───────────────────────────────────────────────────────────────
window.getCartCount = function() {
    try {
        const cartStr = localStorage.getItem('cart');
        if (!cartStr) return 0;
        return JSON.parse(cartStr).reduce((sum, item) => sum + (item.quantity || 1), 0);
    } catch (e) { return 0; }
};

// ─── Toast Notification (Premium Minimalist Redesign) ────────────────────────
window.showToast = function(msg, type = 'default') {
    let toast = document.getElementById('sela-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'sela-toast';
        toast.className = 'fixed bottom-8 right-8 text-[11px] font-label-caps tracking-widest px-6 py-4 shadow-xl z-[200] rounded-xl border flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform translate-y-4 opacity-0 pointer-events-none';
        document.body.appendChild(toast);
    }
    
    toast.className = toast.className.replace(/bg-\S+\s?/g, '').replace(/text-\S+\s?/g, '').replace(/border-\S+\s?/g, '');
    
    let iconStr = '';
    if (type === 'error') {
        toast.classList.add('bg-error', 'text-white', 'border-error/20');
        iconStr = `<span class="material-symbols-outlined text-[16px]">error</span>`;
    } else if (type === 'success') {
        toast.classList.add('bg-deep-espresso', 'text-paper-white', 'border-white/10');
        iconStr = `<span class="material-symbols-outlined text-primary-fixed text-[16px]">check_circle</span>`;
    } else {
        toast.classList.add('bg-surface-container-highest', 'text-deep-espresso', 'border-outline-variant/30');
        iconStr = `<span class="material-symbols-outlined text-[16px]">info</span>`;
    }
    
    toast.innerHTML = `${iconStr}<span>${msg}</span>`;
    
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    toast.classList.remove('pointer-events-none');
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.transform = 'translateY(1rem)';
        toast.style.opacity = '0';
        toast.classList.add('pointer-events-none');
    }, 3200);
};

// ─── Custom Premium Alert Modal ──────────────────────────────────────────────
window.showAlertModal = function(title, message, type = 'error') {
    let modal = document.getElementById('sela-alert-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'sela-alert-modal';
        modal.className = 'fixed inset-0 bg-deep-espresso/50 backdrop-blur-sm z-[250] flex items-center justify-center opacity-0 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]';
        modal.innerHTML = `
            <div class="bg-paper-white border border-outline-variant/30 w-full max-w-md mx-4 p-8 md:p-10 shadow-2xl relative transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform scale-95 translate-y-4" id="sela-alert-modal-content">
                <button onclick="window.closeAlertModal()" class="absolute top-6 right-6 text-on-surface-variant hover:text-deep-espresso transition-colors p-2 hover:bg-surface-container rounded-full cursor-pointer">
                    <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
                <div class="flex flex-col items-center text-center gap-4">
                    <div id="sela-alert-icon-container" class="w-16 h-16 rounded-full flex items-center justify-center mb-2">
                        <span id="sela-alert-icon" class="material-symbols-outlined text-[32px]">error</span>
                    </div>
                    <h3 id="sela-alert-title" class="font-headline-md text-headline-md text-deep-espresso">Alert</h3>
                    <p id="sela-alert-message" class="font-body-md text-on-surface-variant text-sm leading-relaxed"></p>
                    <button onclick="window.closeAlertModal()" class="mt-6 w-full bg-deep-espresso text-white py-3 font-label-caps text-xs tracking-widest hover:bg-black transition-all active:scale-95">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) window.closeAlertModal();
        });
    }

    const titleEl = document.getElementById('sela-alert-title');
    const msgEl = document.getElementById('sela-alert-message');
    const iconEl = document.getElementById('sela-alert-icon');
    const iconContainer = document.getElementById('sela-alert-icon-container');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    iconContainer.className = 'w-16 h-16 rounded-full flex items-center justify-center mb-2';

    if (type === 'success') {
        iconContainer.classList.add('bg-secondary-container', 'text-on-secondary-container');
        if (iconEl) iconEl.textContent = 'check_circle';
    } else if (type === 'warning') {
        iconContainer.classList.add('bg-tertiary-fixed', 'text-on-tertiary-fixed');
        if (iconEl) iconEl.textContent = 'warning';
    } else { 
        iconContainer.classList.add('bg-error-container', 'text-on-error-container');
        if (iconEl) iconEl.textContent = 'error';
    }

    modal.classList.remove('pointer-events-none', 'opacity-0');
    document.body.classList.add('overflow-hidden');

    setTimeout(() => {
        const content = document.getElementById('sela-alert-modal-content');
        if (content) {
            content.classList.remove('scale-95', 'translate-y-4');
            content.classList.add('scale-100', 'translate-y-0');
        }
    }, 20);
};

window.closeAlertModal = function() {
    const modal = document.getElementById('sela-alert-modal');
    const content = document.getElementById('sela-alert-modal-content');
    if (modal && content) {
        content.classList.remove('scale-100', 'translate-y-0');
        content.classList.add('scale-95', 'translate-y-4');
        setTimeout(() => {
            modal.classList.add('opacity-0', 'pointer-events-none');
            document.body.classList.remove('overflow-hidden');
        }, 300);
    }
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

    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');
    if (tableParam) {
        localStorage.setItem('scannedTable', tableParam);
    }
});

// ─── Navbar Injection (Search Icon Removed) ──────────────────────────────────
window.injectNavbar = function(container) {
    const currentPath = window.location.pathname.toLowerCase();
    const isInCustomer = currentPath.includes('/customer/');
    const webPrefix = isInCustomer ? '../web/' : '';
    const customerPrefix = isInCustomer ? '' : '../customer/';

    const isHome      = /home\.html$/.test(currentPath) || /homepage\.html$/.test(currentPath) || currentPath.endsWith('/') || currentPath === '';
    const isMenu      = /menu\.html$/.test(currentPath) || /detailmenu\.html$/.test(currentPath);
    const isPromo     = /promo\.html$/.test(currentPath);
    const isCareer    = /career\.html$/.test(currentPath);
    const isLocations = /locations\.html$/.test(currentPath);

    const auth      = window.isAuthenticated();
    const userName  = localStorage.getItem('userName') || 'Guest';
    const cartCount = window.getCartCount();

    const activeClass   = 'text-deep-espresso dark:text-primary-fixed border-b border-deep-espresso dark:border-primary-fixed pb-1 font-label-caps tracking-widest';
    const inactiveClass = 'text-on-surface-variant font-label-caps tracking-widest hover:text-deep-espresso transition-colors';

    const cartBadge = cartCount > 0
        ? `<span class="absolute -top-1.5 -right-1.5 bg-moss-green text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">${cartCount}</span>`
        : '';

    const userId = localStorage.getItem('userId');
    const savedAvatar = userId ? localStorage.getItem('userAvatar_' + userId) : null;
    const avatarHtml = savedAvatar
        ? `<img src="${savedAvatar}" class="w-6 h-6 rounded-full object-cover border border-outline-variant/30" alt="Avatar" />`
        : `<span class="material-symbols-outlined">person</span>`;

    const personIcon = auth
        ? `<div class="relative group">
                <button class="hover:opacity-80 transition-all duration-300 active:scale-95 flex items-center gap-1" aria-label="Account menu">
                    ${avatarHtml}
                    <span class="hidden lg:inline text-xs font-label-caps tracking-wide">${userName.split(' ')[0]}</span>
                </button>
                <div class="absolute right-0 top-full mt-2 w-48 bg-paper-white border border-outline-variant/30 shadow-md py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50">
                    <a href="${customerPrefix}profile.html" class="block px-4 py-2 text-xs font-label-caps text-on-surface hover:bg-surface-container transition-colors">Profile</a>
                    <a href="${customerPrefix}favorites.html" class="block px-4 py-2 text-xs font-label-caps text-on-surface hover:bg-surface-container transition-colors">Favorites</a>
                    <a href="${customerPrefix}reviews.html" class="block px-4 py-2 text-xs font-label-caps text-on-surface hover:bg-surface-container transition-colors">Reviews</a>
                    <div class="h-[1px] bg-outline-variant/30 my-1"></div>
                    <button onclick="window.logout()" class="w-full text-left block px-4 py-2 text-xs font-label-caps text-error hover:bg-surface-container transition-colors">Sign Out</button>
                </div>
           </div>`
        : `<a href="${webPrefix}login.html" class="hover:opacity-80 transition-all duration-300 active:scale-95" aria-label="Login">
               <span class="material-symbols-outlined">person</span>
           </a>`;

    const homeLink = auth ? `${customerPrefix}homepage.html` : `${webPrefix}home.html`;

    // Bagian ikon search (magnifying glass) sudah dihapus secara permanen di sini
    container.innerHTML = `
    <header class="fixed top-0 left-0 w-full z-50 bg-surface/95 dark:bg-surface-container/95 backdrop-blur-md border-b border-outline/10 dark:border-outline/20">
        <div class="flex justify-between items-center w-full px-6 md:px-margin-desktop py-6 max-w-container-max mx-auto">
            <a href="${homeLink}" class="font-headline-md text-headline-md tracking-tight text-deep-espresso dark:text-primary-fixed select-none hover:opacity-85 transition-opacity" aria-label="Sela Cafe Home">Sela Cafe</a>
            <nav class="hidden md:flex items-center gap-8" aria-label="Main navigation">
                <a href="${homeLink}"      class="${isHome      ? activeClass : inactiveClass}">Home</a>
                <a href="${webPrefix}menu.html"      class="${isMenu      ? activeClass : inactiveClass}">Menu</a>
                <a href="${webPrefix}promo.html"     class="${isPromo     ? activeClass : inactiveClass}">Promo</a>
                <a href="${webPrefix}career.html"    class="${isCareer    ? activeClass : inactiveClass}">Career</a>
                <a href="${webPrefix}locations.html" class="${isLocations ? activeClass : inactiveClass}">Locations</a>
            </nav>
            <div class="flex items-center gap-6 text-deep-espresso">
                <a href="${webPrefix}cart.html" class="hover:opacity-80 transition-all duration-300 active:scale-95 relative" aria-label="Shopping bag">
                    <span class="material-symbols-outlined">shopping_bag</span>${cartBadge}
                </a>
                ${personIcon}
            </div>
        </div>
    </header>
    `;
    document.body.style.paddingTop = "80px";
};

// ─── Footer Injection ─────────────────────────────────────────────────────────
function injectFooter(container) {
    const currentPath = window.location.pathname.toLowerCase();
    const isInCustomer = currentPath.includes('/customer/');
    const webPrefix = isInCustomer ? '../web/' : '';
    const customerPrefix = isInCustomer ? '' : '../customer/';
    const homeLink = window.isAuthenticated() ? `${customerPrefix}homepage.html` : `${webPrefix}home.html`;

    container.innerHTML = `
    <footer class="bg-deep-espresso dark:bg-surface-container-lowest border-t border-outline/20 w-full">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-gutter px-6 md:px-margin-desktop py-20 max-w-container-max mx-auto">
            <div class="col-span-1 md:col-span-1">
                <a href="${homeLink}" class="font-headline-lg text-headline-lg text-paper-white dark:text-deep-espresso mb-6 block hover:opacity-80 transition-opacity">Sela Cafe</a>
                <p class="font-body-md text-on-primary-container opacity-60 mb-8 max-w-xs">Cultivating heritage in every cup through artisan roasting and community focused spaces.</p>
            </div>
            <div>
                <h4 class="font-label-caps text-label-caps text-paper-white dark:text-deep-espresso tracking-widest mb-8">JOURNEY</h4>
                <ul class="space-y-4">
                    <li><button onclick="openFooterModal('story')" class="text-left text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors cursor-pointer bg-transparent border-none p-0">Our Story</button></li>
                    <li><a class="text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors block" href="${webPrefix}locations.html">Locations</a></li>
                    <li><button onclick="openFooterModal('sustainability')" class="text-left text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors cursor-pointer bg-transparent border-none p-0">Sustainability</button></li>
                </ul>
            </div>
            <div>
                <h4 class="font-label-caps text-label-caps text-paper-white dark:text-deep-espresso tracking-widest mb-8">PARTNERSHIP</h4>
                <ul class="space-y-4">
                    <li><button onclick="openFooterModal('wholesale')" class="text-left text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors cursor-pointer bg-transparent border-none p-0">Wholesale</button></li>
                    <li><a class="text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors block" href="${webPrefix}career.html">Career</a></li>
                    <li><button onclick="openFooterModal('press')" class="text-left text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors cursor-pointer bg-transparent border-none p-0">Press Kit</button></li>
                </ul>
            </div>
            <div>
                <h4 class="font-label-caps text-label-caps text-paper-white dark:text-deep-espresso tracking-widest mb-8">LEGAL</h4>
                <ul class="space-y-4">
                    <li><button onclick="openFooterModal('privacy')" class="text-left text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors cursor-pointer bg-transparent border-none p-0">Privacy</button></li>
                    <li><button onclick="openFooterModal('terms')" class="text-left text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors cursor-pointer bg-transparent border-none p-0">Terms</button></li>
                </ul>
            </div>
        </div>
        <div class="px-6 md:px-margin-desktop py-8 border-t border-white/5 max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <span class="font-label-caps text-[10px] text-on-primary-container opacity-40">© 2026 Sela Cafe. Cultivating heritage in every cup.</span>
            <div class="flex gap-6">
                <button onclick="openFooterModal('website')" class="text-on-primary-container opacity-40 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Website"><span class="material-symbols-outlined text-lg">public</span></button>
                <button onclick="openFooterModal('chat')" class="text-on-primary-container opacity-40 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Chat"><span class="material-symbols-outlined text-lg">chat</span></button>
                <button onclick="openFooterModal('share')" class="text-on-primary-container opacity-40 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Share"><span class="material-symbols-outlined text-lg">share</span></button>
            </div>
        </div>
    </footer>
    `;
}

// ─── Modal Architecture (English Curation & Scroll Locking) ──────────────────
window.openFooterModal = function(type) {
    let modal = document.getElementById('sela-footer-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'sela-footer-modal';
        modal.className = 'fixed inset-0 bg-deep-espresso/50 backdrop-blur-sm z-[250] flex items-center justify-center opacity-0 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]';
        
        modal.innerHTML = `
            <div class="bg-paper-white border border-outline-variant/30 w-full max-w-xl mx-4 p-10 shadow-2xl relative transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform scale-95 translate-y-4" id="sela-modal-content">
                <button onclick="closeFooterModal()" class="absolute top-6 right-6 text-on-surface-variant hover:text-deep-espresso transition-colors p-2 hover:bg-surface-container rounded-full cursor-pointer">
                    <span class="material-symbols-outlined text-[22px]">close</span>
                </button>
                <div id="sela-modal-body" class="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const modalBody = document.getElementById('sela-modal-body');
    const currentUrl = window.location.href;
    let content = '';

    switch(type) {
        case 'search_bar':
            content = `
                <span class="font-label-caps text-primary tracking-[0.2em] text-[10px] uppercase mb-2 block">Quick Finder</span>
                <h3 class="font-headline-md text-deep-espresso mb-4">Search Our Menu</h3>
                <div class="sela-line-h mb-6 opacity-20"></div>
                <div class="relative mb-6">
                    <input type="text" id="sela-menu-search-input" placeholder="Type your favorite coffee (e.g., Espresso, Latte)..." class="form-input pl-11 text-sm w-full bg-surface-container-low" oninput="executeMenuSearch()">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
                </div>
                <div id="search-results-container" class="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                    <p class="text-xs font-body-md text-on-surface-variant italic">Start typing to filter artisan brews...</p>
                </div>
            `;
            break;

        case 'story':
        case 'story_heritage':
            content = `
                <span class="font-label-caps text-moss-green tracking-[0.2em] text-[10px] uppercase mb-2 block">Chronicle 01</span>
                <h2 class="font-headline-lg text-deep-espresso mb-6">The Heritage Pour</h2>
                <div class="sela-line-h mb-6 opacity-20"></div>
                <div class="flex flex-col gap-4 font-body-md text-on-surface-variant leading-relaxed text-justify">
                    <p>Our manual filter methods are an exacting replication of the 1924 extraction blueprints. We bypassed standard high-yield metrics to honor a ritual that allows aromatic oils to bloom natively inside the glass vessel.</p>
                    <p>Utilizing high-density untreated paper matrices and custom glass cones, each pour is timed manually by our craft baristas down to the single drop interval.</p>
                </div>
            `;
            break;

        case 'story_umber':
            content = `
                <span class="font-label-caps text-moss-green tracking-[0.2em] text-[10px] uppercase mb-2 block">Chronicle 02</span>
                <h2 class="font-headline-lg text-deep-espresso mb-6">Umber & Archive</h2>
                <div class="sela-line-h mb-6 opacity-20"></div>
                <div class="flex flex-col gap-4 font-body-md text-on-surface-variant leading-relaxed text-justify">
                    <p>The roasting phase at Sela is governed by empirical study. By cataloging roasting environment logs from early century archives alongside data-driven bean core probe analysis, we discover the exact thermodynamic inflection point where natural amino acids structure into complex dark-chocolate and citrus oils.</p>
                </div>
            `;
            break;

        case 'story_space':
            content = `
                <span class="font-label-caps text-moss-green tracking-[0.2em] text-[10px] uppercase mb-2 block">Chronicle 03</span>
                <h2 class="font-headline-lg text-deep-espresso mb-6">The Third Space</h2>
                <div class="sela-line-h mb-6 opacity-20"></div>
                <div class="flex flex-col gap-4 font-body-md text-on-surface-variant leading-relaxed text-justify">
                    <p>We approach interior architecture as a core brewing variable. Sound-absorbent structural walls, localized acoustic soundscapes, and raw, untamed wooden touchpoints are mathematically placed to strip away outside friction, welcoming long, immersive dialogues.</p>
                </div>
            `;
            break;

        case 'methodology':
            content = `
                <span class="font-label-caps text-primary tracking-[0.2em] text-[10px] uppercase mb-2 block">The Framework</span>
                <h2 class="font-headline-lg text-deep-espresso mb-6">Our Methodology</h2>
                <div class="sela-line-h mb-6 opacity-20"></div>
                <div class="flex flex-col gap-4 font-body-md text-on-surface-variant leading-relaxed text-justify">
                    <p>Our brewing blueprint is anchored in absolute thermal equilibrium. We cross-examine old-world manual pouring intuition with contemporary mathematical variables to establish an unbreakable consistency template.</p>
                    <div class="bg-surface-container p-5 border border-outline-variant/30 my-2">
                        <h4 class="font-label-caps text-deep-espresso text-[11px] mb-3 tracking-wide">CORE PARADIGMS</h4>
                        <ul class="space-y-2 text-xs font-body-md text-on-surface-variant">
                            <li>⚡ <b>Thermodynamic Stability:</b> Water maintained at precise 93.5°C intervals.</li>
                            <li>📊 <b>Volumetric Precision:</b> Tailored water-to-coffee ratios calculated per lot.</li>
                            <li>⏱️ <b>Extraction Ledger:</b> Controlled saturation periods locked at exactly 28 seconds.</li>
                        </ul>
                    </div>
                </div>
            `;
            break;

        case 'roastery_showcase':
            content = `
                <span class="font-label-caps text-moss-green tracking-[0.2em] text-[10px] uppercase mb-2 block">Seasonal Curation</span>
                <h2 class="font-headline-lg text-deep-espresso mb-6">Roastery Micro-Lots</h2>
                <div class="sela-line-h mb-6 opacity-20"></div>
                <p class="font-body-md text-on-surface-variant mb-6 leading-relaxed">Our roasting philosophy rejects massive commercial blending. Instead, we source small, trace-verified micro-lots during peak harvest seasons and roast them in strict daily volumes.</p>
                <div class="grid grid-cols-1 gap-3 font-label-md text-xs">
                    <div class="border border-outline-variant/30 p-4 bg-surface-container-low flex justify-between items-center">
                        <div>
                            <span class="text-primary font-bold block text-sm">Gayo Avant-Garde</span>
                            <span class="text-on-surface-variant italic font-normal">Anaerobic Natural / Altitude: 1,600m</span>
                        </div>
                        <span class="text-moss-green font-bold">Notes: Passion Fruit, Umber</span>
                    </div>
                </div>
            `;
            break;

        case 'sustainability':
            content = `
                <span class="font-label-caps text-moss-green tracking-[0.2em] text-[10px] uppercase mb-2 block">Ethical Mindset</span>
                <h2 class="font-headline-lg text-deep-espresso mb-6">Nurturing the Ecosystem</h2>
                <div class="sela-line-h mb-6 opacity-20"></div>
                <p class="font-body-md text-on-surface-variant mb-6 leading-relaxed">Our environmental commitment dictates every aspect of our workflow. We design architectural spaces that respect the earth and foster community engagement.</p>
            `;
            break;

        case 'wholesale':
            content = `
                <span class="font-label-caps text-primary tracking-[0.2em] text-[10px] uppercase mb-2 block">B2B Solutions</span>
                <h2 class="font-headline-lg text-deep-espresso mb-6">Wholesale Partnership</h2>
                <div class="sela-line-h mb-6 opacity-20"></div>
                <p class="font-body-md text-on-surface-variant mb-6 leading-relaxed">Bring Sela Cafe's signature specialty standard to your commercial space. We offer comprehensive, tailored micro-lot supply chains alongside professional extraction frameworks.</p>
            `;
            break;

        case 'press':
            content = `
                <span class="font-label-caps text-outline tracking-[0.2em] text-[10px] uppercase mb-2 block">Media Resources</span>
                <h2 class="font-headline-lg text-deep-espresso mb-6">Press Kit Assets</h2>
                <div class="sela-line-h mb-6 opacity-20"></div>
                <p class="font-body-md text-on-surface-variant mb-6 leading-relaxed">Official media kit repository containing unified brand typography vectors, high-resolution heritage interior photography vaults, and editorial overview documentation.</p>
            `;
            break;

        case 'privacy':
            content = `
                <span class="font-label-caps text-outline tracking-[0.2em] text-[10px] uppercase mb-2 block">Legal Directive</span>
                <h2 class="font-headline-lg text-deep-espresso mb-4">Privacy Policy</h2>
                <div class="sela-line-h mb-6 opacity-20"></div>
                <p class="font-body-md text-on-surface-variant text-[13px] leading-relaxed">We solely process mandatory data credentials required to fulfill digital orders and secure the platform.</p>
            `;
            break;

        case 'terms':
            content = `
                <span class="font-label-caps text-outline tracking-[0.2em] text-[10px] uppercase mb-2 block">Legal Directive</span>
                <h2 class="font-headline-lg text-deep-espresso mb-4">Terms & Conditions</h2>
                <div class="sela-line-h mb-6 opacity-20"></div>
                <p class="font-body-md text-on-surface-variant text-[13px] leading-relaxed">By engaging with the Sela Cafe ecosystem, you agree to comply with our live queue sequencing. Orders cannot be altered once extraction starts.</p>
            `;
            break;

        case 'website':
            content = `
                <span class="font-label-caps text-primary tracking-[0.2em] text-[10px] uppercase mb-2 block">Our Presence</span>
                <h3 class="font-headline-md text-deep-espresso mb-4">Sela Cafe Network</h3>
                <div class="sela-line-h mb-6 opacity-20"></div>
                <p class="font-body-md text-on-surface-variant mb-6 leading-relaxed">Our physical retail network and flagship spaces currently operating across major regions:</p>
                <div class="flex flex-col gap-3 font-label-md text-xs">
                    <div class="border border-outline-variant/30 p-4 bg-surface-container-low flex justify-between items-center">
                        <div>
                            <span class="text-primary font-bold block">Sela Flagship Roastery</span>
                            <span class="text-on-surface-variant">Cihampelas, West Java — Main Production & Sensory Lab</span>
                        </div>
                    </div>
                    <div class="border border-outline-variant/30 p-4 bg-surface-container-low flex justify-between items-center">
                        <div>
                            <span class="text-primary font-bold block">Sela Heritage Space</span>
                            <span class="text-on-surface-variant">Kota Tua, Jakarta — Historical Brew Hub</span>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'chat':
            content = `
                <span class="font-label-caps text-moss-green tracking-[0.2em] text-[10px] uppercase mb-2 block">Direct Support</span>
                <h3 class="font-headline-md text-deep-espresso mb-4">Customer Care</h3>
                <div class="sela-line-h mb-6 opacity-20"></div>
                <p class="font-body-md text-on-surface-variant mb-6 leading-relaxed">Having issues with your digital order or active table checkout? Connect directly with our team on WhatsApp for immediate concierge assistance.</p>
                <a href="https://wa.me/6281234567890" target="_blank" class="w-full text-center bg-moss-green text-white py-4 font-label-caps text-xs tracking-widest hover:opacity-90 transition-opacity block rounded-sm">
                    Contact Us via WhatsApp
                </a>
            `;
            break;

        case 'share':
            content = `
                <h3 class="font-label-caps text-label-caps text-deep-espresso tracking-widest mb-4">Share Sela Cafe</h3>
                <div class="sela-line-h mb-4"></div>
                <p class="font-body-md text-on-surface-variant mb-4">Copy the address below to share this sensory space with your network:</p>
                <div class="flex gap-2">
                    <input type="text" value="${currentUrl}" id="share-url-input" readonly class="form-input text-xs flex-1 bg-surface-container/30">
                    <button onclick="copyShareUrl()" class="btn-primary btn-sm text-xs">Copy</button>
                </div>
            `;
            break;
    }

    modalBody.innerHTML = content;
    modal.classList.remove('pointer-events-none', 'opacity-0');
    document.body.classList.add('overflow-hidden'); 

    setTimeout(() => {
        const modalContent = document.getElementById('sela-modal-content');
        if (modalContent) {
            modalContent.classList.remove('scale-95', 'translate-y-4');
            modalContent.classList.add('scale-100', 'translate-y-0');
        }
    }, 20);
};

window.closeFooterModal = function() {
    const modal = document.getElementById('sela-footer-modal');
    const content = document.getElementById('sela-modal-content');
    if (modal && content) {
        content.classList.remove('scale-100', 'translate-y-0');
        content.classList.add('scale-95', 'translate-y-4');
        setTimeout(() => {
            modal.classList.add('opacity-0', 'pointer-events-none');
            document.body.classList.remove('overflow-hidden');
        }, 300);
    }
};

window.copyShareUrl = function() {
    const copyText = document.getElementById('share-url-input');
    if (copyText) {
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(copyText.value);
        window.closeFooterModal();
        if (typeof window.showToast === 'function') window.showToast('Link copied to clipboard successfully!', 'success');
    }
};

// Real-Time Menu Filter Handler
window.executeMenuSearch = function() {
    const query = document.getElementById('sela-menu-search-input').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results-container');
    
    const mockDb = [
        { name: 'Espresso Avant-Garde', desc: 'Pure 9.2 Bar short extraction micro-lot.', price: 'Rp 32.000', link: 'menu.html' },
        { name: 'Kamojang Reserve Latte', desc: 'Silky microfoam over double espresso shot.', price: 'Rp 42.000', link: 'menu.html' },
        { name: 'Heritage Pour Over', desc: '1924 manual filter method, seasonal single-origin.', price: 'Rp 38.000', link: 'menu.html' },
        { name: 'Cold Brew Archive', desc: '16-hour slow steep clean extraction caffeine profile.', price: 'Rp 35.000', link: 'menu.html' }
    ];

    if (!query) {
        resultsContainer.innerHTML = '<p class="text-xs font-body-md text-on-surface-variant italic">Start typing to filter artisan brews...</p>';
        return;
    }

    const filtered = mockDb.filter(item => item.name.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query));

    if (filtered.length === 0) {
        resultsContainer.innerHTML = '<p class="text-xs font-body-md text-error italic">No matches found for your criteria.</p>';
        return;
    }

    resultsContainer.innerHTML = filtered.map(item => `
        <a href="${item.link}" class="border border-outline-variant/30 p-3 bg-surface-container-low flex justify-between items-center hover:bg-surface-container transition-colors rounded-lg block decoration-none text-on-surface">
            <div>
                <span class="text-primary font-bold block text-sm">${item.name}</span>
                <span class="text-on-surface-variant text-xs leading-none">${item.desc}</span>
            </div>
            <span class="font-label-md text-xs font-bold text-moss-green">${item.price}</span>
        </a>
    `).join('');
};

window.addEventListener('click', function(e) {
    const modal = document.getElementById('sela-footer-modal');
    if (e.target === modal) window.closeFooterModal();
});