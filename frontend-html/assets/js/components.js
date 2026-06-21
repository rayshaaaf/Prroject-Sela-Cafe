/**
 * Sela Cafe Standardized Components & API client
 */

const API_BASE_URL = 'http://localhost:8090';

// Central API Fetch Wrapper
window.apiFetch = async function(path, options = {}) {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    const token = localStorage.getItem('token');
    
    // Set default headers
    options.headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Inject Authorization token if present
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, options);
        if (response.status === 401) {
            // Token expired or invalid, clear auth state and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole');
            window.location.href = 'login.html';
        }
        return response;
    } catch (error) {
        console.error(`API Fetch Error: ${url}`, error);
        throw error;
    }
};

// Check if user is logged in
window.isAuthenticated = function() {
    return !!localStorage.getItem('token');
};

// Sign Out
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
};

// Cart Helpers
window.getCartCount = function() {
    try {
        const cartStr = localStorage.getItem('cart');
        if (!cartStr) return 0;
        const cart = JSON.parse(cartStr);
        return Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
    } catch (e) {
        return 0;
    }
};

// Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Navbar
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        injectNavbar(navbarPlaceholder);
    }
    
    // 2. Inject Footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        injectFooter(footerPlaceholder);
    }

    // 3. Inject Grain Overlay if not present
    if (!document.querySelector('.grain-overlay')) {
        const grain = document.createElement('div');
        grain.className = 'grain-overlay';
        document.body.appendChild(grain);
    }
});

// Inject Navbar Markup & Setup Event Listeners
function injectNavbar(container) {
    const currentPath = window.location.pathname.toLowerCase();
    
    // Menggunakan regex .test() agar aman dari case-sensitive nama file (misal: Home.html atau home.html)
    const isHome = /home\.html$/.test(currentPath) || currentPath.endsWith('/') || currentPath === '';
    const isMenu = /menu\.html$/.test(currentPath) || /detailmenu\.html$/.test(currentPath);
    const isPromo = /promo\.html$/.test(currentPath);
    const isCareer = /career\.html$/.test(currentPath);
    const isLocations = /locations\.html$/.test(currentPath);

    const auth = window.isAuthenticated();
    const userName = localStorage.getItem('userName') || 'Ritualist';
    
    const cartCount = window.getCartCount();
    const cartBadgeHtml = cartCount > 0 
        ? `<span class="absolute -top-1.5 -right-1.5 bg-moss-green text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">${cartCount}</span>` 
        : '';

    const navbarHtml = `
    <header class="sticky top-0 w-full z-50 bg-surface/95 dark:bg-surface-container/95 backdrop-blur-md border-b border-outline/10 dark:border-outline/20">
        <div class="flex justify-between items-center w-full px-6 md:px-margin-desktop py-5 max-w-container-max mx-auto">
            <a href="home.html" class="font-headline-md text-headline-md tracking-tight text-deep-espresso dark:text-primary-fixed select-none hover:opacity-85 transition-opacity">
                Sela Cafe
            </a>
            
            <nav class="hidden md:flex items-center gap-8">
                <a href="home.html" class="${isHome ? 'text-deep-espresso dark:text-primary-fixed border-b-2 border-deep-espresso dark:border-primary-fixed pb-1 font-label-caps tracking-widest' : 'text-on-surface-variant font-label-caps tracking-widest hover:text-deep-espresso transition-colors'}">Home</a>
                <a href="menu.html" class="${isMenu ? 'text-deep-espresso dark:text-primary-fixed border-b-2 border-deep-espresso dark:border-primary-fixed pb-1 font-label-caps tracking-widest' : 'text-on-surface-variant font-label-caps tracking-widest hover:text-deep-espresso transition-colors'}">Menu</a>
                <a href="promo.html" class="${isPromo ? 'text-deep-espresso dark:text-primary-fixed border-b-2 border-deep-espresso dark:border-primary-fixed pb-1 font-label-caps tracking-widest' : 'text-on-surface-variant font-label-caps tracking-widest hover:text-deep-espresso transition-colors'}">Promo</a>
                <a href="career.html" class="${isCareer ? 'text-deep-espresso dark:text-primary-fixed border-b-2 border-deep-espresso dark:border-primary-fixed pb-1 font-label-caps tracking-widest' : 'text-on-surface-variant font-label-caps tracking-widest hover:text-deep-espresso transition-colors'}">Career</a>
                <a href="locations.html" class="${isLocations ? 'text-deep-espresso dark:text-primary-fixed border-b-2 border-deep-espresso dark:border-primary-fixed pb-1 font-label-caps tracking-widest' : 'text-on-surface-variant font-label-caps tracking-widest hover:text-deep-espresso transition-colors'}">Locations</a>
            </nav>
            
            <div class="flex items-center gap-4 md:gap-6 text-deep-espresso">
                <a href="menu.html" class="hover:opacity-80 transition-all duration-300 active:scale-95 flex items-center">
                    <span class="material-symbols-outlined" data-icon="search">search</span>
                </a>
                
                <a href="cart.html" class="hover:opacity-80 transition-all duration-300 active:scale-95 flex items-center relative">
                    <span class="material-symbols-outlined" data-icon="shopping_bag">shopping_bag</span>
                    ${cartBadgeHtml}
                </a>
                
                ${auth ? `
                    <div class="relative group">
                        <button class="flex items-center gap-2 hover:opacity-80 transition-all duration-300 active:scale-95">
                            <span class="material-symbols-outlined" data-icon="person">person</span>
                            <span class="hidden lg:inline text-xs font-label-caps tracking-wide">${userName.split(' ')[0]}</span>
                        </button>
                        <div class="absolute right-0 top-full mt-2 w-48 bg-paper-white border border-outline-variant/30 shadow-md py-2 hidden group-hover:block transition-all z-50 rounded">
                            <a href="order-tracking.html" class="block px-4 py-2 text-xs font-label-caps text-on-surface hover:bg-surface-container transition-colors">My Orders</a>
                            <button onclick="window.logout()" class="w-full text-left block px-4 py-2 text-xs font-label-caps text-error hover:bg-surface-container transition-colors">Sign Out</button>
                        </div>
                    </div>
                ` : `
                    <a href="login.html" class="hover:opacity-80 transition-all duration-300 active:scale-95 flex items-center">
                        <span class="material-symbols-outlined" data-icon="person">person</span>
                    </a>
                `}
                
                <button id="mobile-menu-btn" class="md:hidden hover:opacity-80 transition-all duration-300 active:scale-95 flex items-center">
                    <span class="material-symbols-outlined">menu</span>
                </button>
            </div>
        </div>

        <div id="mobile-menu-backdrop" class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 hidden transition-opacity duration-300 opacity-0"></div>

        <div id="mobile-menu-drawer" class="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-surface-bright dark:bg-surface-container z-50 shadow-2xl border-l border-outline/10 flex flex-col justify-between p-8 translate-x-full transition-transform duration-300">
            <div>
                <div class="fixed-top-row flex justify-between items-center mb-12">
                    <span class="font-headline-md text-headline-md tracking-tight text-deep-espresso">Sela Cafe</span>
                    <button id="mobile-menu-close" class="hover:opacity-80 active:scale-95 transition-transform">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <nav class="flex flex-col gap-6">
                    <a href="home.html" class="font-label-caps text-body-lg tracking-widest ${isHome ? 'text-primary font-bold' : 'text-on-surface-variant'}">Home</a>
                    <a href="menu.html" class="font-label-caps text-body-lg tracking-widest ${isMenu ? 'text-primary font-bold' : 'text-on-surface-variant'}">Menu</a>
                    <a href="promo.html" class="font-label-caps text-body-lg tracking-widest ${isPromo ? 'text-primary font-bold' : 'text-on-surface-variant'}">Promo</a>
                    <a href="career.html" class="font-label-caps text-body-lg tracking-widest ${isCareer ? 'text-primary font-bold' : 'text-on-surface-variant'}">Career</a>
                    <a href="locations.html" class="font-label-caps text-body-lg tracking-widest ${isLocations ? 'text-primary font-bold' : 'text-on-surface-variant'}">Locations</a>
                    
                    <div class="sela-line-h my-4"></div>
                    
                    <a href="cart.html" class="font-label-caps text-body-lg tracking-widest text-on-surface-variant flex items-center justify-between">
                        <span>Cart</span>
                        <span class="bg-primary text-white text-[10px] py-0.5 px-2 rounded-full font-bold">${cartCount}</span>
                    </a>
                    ${auth ? `
                        <a href="order-tracking.html" class="font-label-caps text-body-lg tracking-widest text-on-surface-variant">My Orders</a>
                    ` : ''}
                </nav>
            </div>
            
            <div class="mt-auto border-t border-outline/10 pt-6">
                ${auth ? `
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-[32px] text-primary">account_circle</span>
                            <div>
                                <div class="font-label-md text-primary font-medium">${userName}</div>
                                <div class="text-[10px] text-outline">${localStorage.getItem('userEmail') || ''}</div>
                            </div>
                        </div>
                        <button onclick="window.logout()" class="w-full bg-outline-variant/30 text-on-surface py-2 rounded text-xs font-label-caps tracking-wide hover:bg-outline-variant/50 transition-colors">Sign Out</button>
                    </div>
                ` : `
                    <a href="login.html" class="w-full bg-primary text-white text-center py-2 block rounded text-xs font-label-caps tracking-wide hover:opacity-90 transition-opacity">Sign In</a>
                `}
            </div>
        </div>
    </header>
    `;
    
    container.outerHTML = navbarHtml;

    // Mobile Menu Handlers
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-menu-close');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    const drawer = document.getElementById('mobile-menu-drawer');

    if (menuBtn && closeBtn && backdrop && drawer) {
        const openMenu = () => {
            backdrop.classList.remove('hidden');
            setTimeout(() => {
                backdrop.classList.add('opacity-100');
                drawer.classList.remove('translate-x-full');
                drawer.classList.add('translate-x-0');
            }, 10);
        };

        const closeMenu = () => {
            drawer.classList.remove('translate-x-0');
            drawer.classList.add('translate-x-full');
            backdrop.classList.remove('opacity-100');
            setTimeout(() => {
                backdrop.classList.add('hidden');
            }, 300);
        };

        menuBtn.addEventListener('click', openMenu);
        closeBtn.addEventListener('click', closeMenu);
        backdrop.addEventListener('click', closeMenu);
    }
}

// Inject Footer Markup
function injectFooter(container) {
    const footerHtml = `
    <footer class="bg-deep-espresso dark:bg-surface-container-lowest border-t border-outline/20 w-full">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-gutter px-6 md:px-margin-desktop py-20 max-w-container-max mx-auto">
            <div class="col-span-1">
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
                    <li><a class="text-on-primary-container dark:text-on-surface-variant font-label-caps tracking-widest hover:text-tertiary-fixed transition-colors" href="promo.html">Sustainability</a></li>
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
                <a class="text-on-primary-container opacity-40 hover:opacity-100 transition-opacity" href="#"><span class="material-symbols-outlined text-lg">public</span></a>
                <a class="text-on-primary-container opacity-40 hover:opacity-100 transition-opacity" href="#"><span class="material-symbols-outlined text-lg">chat</span></a>
                <a class="text-on-primary-container opacity-40 hover:opacity-100 transition-opacity" href="#"><span class="material-symbols-outlined text-lg">share</span></a>
            </div>
        </div>
    </footer>
    `;
    container.outerHTML = footerHtml;
}