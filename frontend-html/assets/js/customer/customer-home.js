/**
 * Sela Cafe — Customer Home Script
 * Integrates dashboard with real customer name and orders history.
 */

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

    // 2. Load my orders
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
                return;
            }

            // Render orders sorted by date descending
            orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            tbody.innerHTML = orders.map(order => {
                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });

                // Status configuration mapping
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
                            <a class="text-on-surface-variant hover:text-deep-espresso underline underline-offset-4 decoration-outline-muted" 
                               href="../web/order-tracking.html?id=${order.id}">View Details</a>
                        </td>
                    </tr>
                `;
            }).join('');
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
