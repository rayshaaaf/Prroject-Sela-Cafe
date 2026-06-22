/**
 * Sela Cafe — Customer Home Script
 * Integrates dashboard with real customer name, orders history, and pagination.
 */

let allOrders = [];
let currentPage = 1;
const itemsPerPage = 3;

document.addEventListener('DOMContentLoaded', () => {
    if (!window.isAuthenticated()) {
        window.location.href = '../web/login.html?redirect=../customer/homepage.html';
        return;
    }
    loadCustomerHome();
});

async function loadCustomerHome() {
    // 1. Load profile details for greeting
    try {
        const response = await window.apiFetch('/api/users/profile');
        if (response.ok) {
            const apiRes = await response.json();
            const profile = apiRes.data;
            const welcomeEl = document.getElementById('welcome-message');
            if (welcomeEl) {
                welcomeEl.textContent = `"Welcome back, ${profile.name}."`;
            }
        }
    } catch (e) {
        console.error('Error loading customer profile for greeting:', e);
    }

    // 2. Fetch My Orders
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    try {
        const response = await window.apiFetch('/api/orders/my');
        if (response.ok) {
            const apiRes = await response.json();
            const orders = apiRes.data || [];

            if (orders.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="py-12 text-center text-on-surface-variant opacity-60">
                            You have no orders yet.
                        </td>
                    </tr>
                `;
                const paginationContainer = document.getElementById('pagination-container');
                if (paginationContainer) paginationContainer.innerHTML = '';
                return;
            }

            // Simpan ke variabel global dan urutkan
            allOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            // Panggil fungsi render tabel
            renderPaginatedOrders();

        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="py-12 text-center text-error">
                        Failed to load order history.
                    </td>
                </tr>
            `;
        }
    } catch (e) {
        console.error('Error fetching customer orders:', e);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="py-12 text-center text-error">
                    Error connecting to the order service.
                </td>
            </tr>
        `;
    }
}

// Fungsi untuk me-render tabel dan pagination
function renderPaginatedOrders() {
    const tbody = document.getElementById('orders-tbody');
    const paginationContainer = document.getElementById('pagination-container');
    
    // Hitung total halaman
    const totalPages = Math.ceil(allOrders.length / itemsPerPage);
    
    // Pastikan currentPage tidak melebihi batas
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    // Potong array (slice) sesuai halaman saat ini
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, allOrders.length);
    const paginatedOrders = allOrders.slice(startIndex, endIndex);

    // Render Data ke Tabel
    tbody.innerHTML = paginatedOrders.map(order => {
        const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        let statusColor = 'bg-outline-muted';
        if (order.status === 'PREPARING' || order.status === 'PAID') statusColor = 'bg-secondary';
        if (order.status === 'READY' || order.status === 'ON_DELIVERY') statusColor = 'bg-moss-green';
        if (order.status === 'CANCELLED') statusColor = 'bg-error';

        const statusLabel = order.status.replace('_', ' ');

        return `
            <tr class="border-b border-outline-muted hover:bg-surface-container-low transition-colors">
                <td class="py-6 px-8 font-mono text-xs">#${order.orderCode || 'ORD-' + order.id}</td>
                <td class="py-6 px-8">${formattedDate}</td>
                <td class="py-6 px-8">
                    <span class="inline-flex items-center gap-2 capitalize">
                        <span class="w-2 h-2 rounded-full ${statusColor}"></span>
                        ${statusLabel.toLowerCase()}
                    </span>
                </td>
                <td class="py-6 px-8 font-semibold">Rp ${Number(order.totalPrice).toLocaleString('id-ID')}</td>
                <td class="py-6 px-8 text-right">
                    <a class="text-on-surface-variant hover:text-deep-espresso underline underline-offset-4 decoration-outline-muted font-bold text-[12px] tracking-wider" 
                       href="../web/order-tracking.html?id=${order.id}">VIEW</a>
                </td>
            </tr>
        `;
    }).join('');

    // Render Kontrol Pagination
    if (paginationContainer && totalPages > 0) {
        let paginationHTML = `
            <div class="text-on-surface-variant font-label-md text-[14px]">
                Showing <span class="font-bold">${startIndex + 1}</span> to <span class="font-bold">${endIndex}</span> of <span class="font-bold">${allOrders.length}</span> orders
            </div>
            <div class="flex items-center gap-2">
                <button onclick="changePage(${currentPage - 1})" class="w-8 h-8 flex items-center justify-center border border-outline-variant/50 bg-paper-white hover:bg-surface-variant transition-colors disabled:opacity-50 disabled:cursor-not-allowed" ${currentPage === 1 ? 'disabled' : ''}>
                    <span class="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
        `;

        // Generate Nomor Halaman
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                // Style halaman aktif (gelap)
                paginationHTML += `
                    <button class="w-8 h-8 flex items-center justify-center bg-deep-espresso text-paper-white font-label-md text-[14px]">
                        ${i}
                    </button>
                `;
            } else {
                // Style halaman tidak aktif (terang)
                paginationHTML += `
                    <button onclick="changePage(${i})" class="w-8 h-8 flex items-center justify-center border border-outline-variant/50 bg-paper-white hover:bg-surface-variant transition-colors font-label-md text-on-surface-variant text-[14px]">
                        ${i}
                    </button>
                `;
            }
        }

        paginationHTML += `
                <button onclick="changePage(${currentPage + 1})" class="w-8 h-8 flex items-center justify-center border border-outline-variant/50 bg-paper-white hover:bg-surface-variant transition-colors disabled:opacity-50 disabled:cursor-not-allowed" ${currentPage === totalPages ? 'disabled' : ''}>
                    <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
            </div>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }
}

// Fungsi Global untuk Navigasi Halaman saat tombol diklik
window.changePage = function(page) {
    currentPage = page;
    renderPaginatedOrders();
};