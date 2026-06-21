const CURRENT_ROLE = 'CASHIER';

document.addEventListener('DOMContentLoaded', () => {
    fetchCashierOrders();
    setInterval(fetchCashierOrders, 10000);
});

async function fetchCashierOrders() {
    try {
        const res = await window.apiFetch('/api/orders/getAll');
        if (!res.ok) throw new Error('Failed to fetch orders');
        
        const apiRes = await res.json();
        if (apiRes.success && apiRes.data) {
            renderDashboard(apiRes.data);
        }
    } catch (err) {
        console.error('Error fetching orders:', err);
    }
}

function renderDashboard(orders) {
    // Filter Waiting Payment orders and active orders
    const waitingPaymentOrders = orders.filter(o => o.status === 'WAITING_PAYMENT');
    
    // Sort orders so completed/cancelled are at the bottom, active states at the top
    const activeOrders = orders.filter(o => o.status !== 'WAITING_PAYMENT');

    // Update Stats
    const totalOrdersToday = orders.length;
    const totalRevenueToday = orders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalPaidOrders = orders.filter(o => ['PAID', 'PREPARING', 'READY', 'COMPLETED'].includes(o.status)).length;

    // Update Stats UI
    const totalOrdersEl = document.getElementById('stats-total-orders');
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrdersToday;

    const totalRevenueEl = document.getElementById('stats-total-revenue');
    if (totalRevenueEl) totalRevenueEl.textContent = formatIDR(totalRevenueToday);

    const totalPaidEl = document.getElementById('stats-paid-orders');
    if (totalPaidEl) totalPaidEl.textContent = totalPaidOrders;

    const pendingActionsEl = document.getElementById('stats-pending-actions');
    if (pendingActionsEl) {
        pendingActionsEl.textContent = `${waitingPaymentOrders.length} Actions Needed`;
    }

    // Render Waiting Payment Cards
    const waitingContainer = document.getElementById('waiting-payment-container');
    if (waitingContainer) {
        if (waitingPaymentOrders.length === 0) {
            waitingContainer.innerHTML = `
                <div class="col-span-2 flex flex-col items-center justify-center p-12 border border-dashed border-outline-muted bg-paper-white text-on-surface-variant/40 rounded-xl">
                    <span class="material-symbols-outlined text-[48px] mb-2">check_circle</span>
                    <p class="font-label-caps text-[10px] tracking-widest uppercase">No Pending Payments</p>
                </div>
            `;
        } else {
            waitingContainer.innerHTML = waitingPaymentOrders.map(order => `
                <div class="bg-paper-white border border-outline-muted p-6 flex flex-col justify-between hover:border-deep-espresso transition-colors duration-300" id="order-${order.id}">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <div class="font-label-caps text-label-caps text-on-surface-variant mb-1">Order #${order.id}</div>
                            <div class="font-headline-md text-headline-md text-deep-espresso">${order.customerName || 'Guest'}</div>
                        </div>
                        <span class="px-3 py-1 bg-heritage-cream font-label-caps text-label-caps text-deep-espresso">${order.orderType}</span>
                    </div>
                    <div class="space-y-4 mb-8">
                        <div class="flex justify-between text-body-md">
                            <span class="text-on-surface-variant">Order Time</span>
                            <span class="font-label-md">${new Date(order.createdAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div class="flex justify-between text-body-md">
                            <span class="text-on-surface-variant">Payment Method</span>
                            <span class="font-label-md">${order.paymentMethod || 'QRIS'}</span>
                        </div>
                        <div class="sela-line"></div>
                        <div class="flex justify-between items-end">
                            <span class="font-label-caps text-label-caps text-on-surface-variant">Total Amount</span>
                            <span class="font-headline-md text-headline-md text-deep-espresso">${formatIDR(order.totalPrice)}</span>
                        </div>
                    </div>
                    <button onclick="confirmPayment(${order.id})" class="w-full bg-deep-espresso text-paper-white py-4 font-label-caps text-label-caps tracking-widest hover:bg-primary transition-all active:scale-95 duration-150">
                        Confirm Payment
                    </button>
                </div>
            `).join('');
        }
    }

    // Render Active Order Flow Table
    const tableBody = document.getElementById('active-orders-table-body');
    if (tableBody) {
        if (activeOrders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="py-12 text-center text-on-surface-variant/40 font-label-caps text-[10px] tracking-widest uppercase">
                        No Active Orders
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = activeOrders.map(order => {
                const statusLabel = order.status;
                let statusColorClass = 'text-on-surface-variant';
                let pulseHTML = '';
                
                if (statusLabel === 'PAID') {
                    statusColorClass = 'text-moss-green';
                    pulseHTML = '<span class="w-2 h-2 rounded-full bg-moss-green animate-pulse"></span>';
                } else if (statusLabel === 'PREPARING') {
                    statusColorClass = 'text-moss-green';
                    pulseHTML = '<span class="w-2 h-2 rounded-full bg-moss-green animate-pulse"></span>';
                } else if (statusLabel === 'READY') {
                    statusColorClass = 'text-deep-espresso';
                    pulseHTML = '<span class="w-2 h-2 rounded-full bg-deep-espresso"></span>';
                } else if (statusLabel === 'ON_DELIVERY') {
                    statusColorClass = 'text-moss-green';
                    pulseHTML = '<span class="w-2 h-2 rounded-full bg-moss-green"></span>';
                }

                let courierHTML = '';
                if (order.orderType === 'DELIVERY') {
                    if (order.courierName) {
                        courierHTML = `<span class="font-body-md font-semibold">${order.courierName}</span>`;
                    } else if (order.status === 'READY') {
                        courierHTML = `
                            <div class="flex gap-2 items-center">
                                <input type="text" id="courier-input-${order.id}" placeholder="Courier Name" class="bg-transparent border-b border-outline-muted font-label-md text-label-md py-1 w-28 focus:border-deep-espresso outline-none" />
                                <button onclick="assignCourier(${order.id})" class="bg-deep-espresso text-white px-2 py-1 text-[10px] font-label-caps hover:brightness-110 active:scale-95 transition-all">ASSIGN</button>
                            </div>
                        `;
                    } else {
                        courierHTML = `<span class="text-on-surface-variant opacity-60 text-xs italic">Awaiting Prep</span>`;
                    }
                } else {
                    courierHTML = `<span class="text-on-surface-variant opacity-65">N/A (Dine-in/Takeaway)</span>`;
                }

                let actionHTML = '';
                if (order.orderType !== 'DELIVERY' && order.status === 'READY') {
                    actionHTML = `
                        <button onclick="completeOrder(${order.id})" class="bg-moss-green text-white px-3 py-1.5 font-label-caps text-[10px] tracking-widest hover:opacity-90 active:scale-95 transition-all">
                            COMPLETE
                        </button>
                    `;
                } else {
                    actionHTML = `
                        <span class="text-xs font-label-caps text-on-surface-variant opacity-50">NO ACTIONS</span>
                    `;
                }

                return `
                    <tr class="group hover:bg-heritage-cream/10 transition-colors">
                        <td class="py-6 font-label-md">#${order.id}</td>
                        <td class="py-6 font-body-md font-semibold">${order.customerName || 'Guest'}</td>
                        <td class="py-6">
                            <span class="inline-flex items-center gap-2 ${statusColorClass} font-label-md">
                                ${pulseHTML}${statusLabel}
                            </span>
                        </td>
                        <td class="py-6 font-body-md">${formatIDR(order.totalPrice)}</td>
                        <td class="py-6">${courierHTML}</td>
                        <td class="py-6 font-label-md text-on-surface-variant">${getRelativeTime(order.updatedAt || order.createdAt)}</td>
                        <td class="py-6 text-right">${actionHTML}</td>
                    </tr>
                `;
            }).join('');
        }
    }
}

async function confirmPayment(orderId) {
    try {
        const res = await window.apiFetch(`/api/orders/updateStatus/${orderId}?status=PAID`, {
            method: 'PUT',
            headers: { 'X-Role': CURRENT_ROLE }
        });
        const data = await res.json();
        if (res.ok && data.success) {
            window.showToast('Payment confirmed successfully!', 'success');
            fetchCashierOrders();
        } else {
            window.showToast(data.message || 'Failed to confirm payment.', 'error');
        }
    } catch (err) {
        console.error('Error confirming payment:', err);
        window.showToast('Network error.', 'error');
    }
}

async function completeOrder(orderId) {
    try {
        const res = await window.apiFetch(`/api/orders/updateStatus/${orderId}?status=COMPLETED`, {
            method: 'PUT',
            headers: { 'X-Role': CURRENT_ROLE }
        });
        const data = await res.json();
        if (res.ok && data.success) {
            window.showToast('Order completed successfully!', 'success');
            fetchCashierOrders();
        } else {
            window.showToast(data.message || 'Failed to complete order.', 'error');
        }
    } catch (err) {
        console.error('Error completing order:', err);
        window.showToast('Network error.', 'error');
    }
}

async function assignCourier(orderId) {
    const input = document.getElementById(`courier-input-${orderId}`);
    const courierName = input ? input.value.trim() : '';
    if (!courierName) {
        window.showToast('Please enter courier name.', 'error');
        return;
    }

    try {
        const res = await window.apiFetch(`/api/orders/${orderId}/assign-courier`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'X-Role': CURRENT_ROLE
            },
            body: JSON.stringify({
                courierId: 99, 
                courierName: courierName
            })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            window.showToast('Courier assigned successfully!', 'success');
            fetchCashierOrders();
        } else {
            window.showToast(data.message || 'Failed to assign courier.', 'error');
        }
    } catch (err) {
        console.error('Error assigning courier:', err);
        window.showToast('Network error.', 'error');
    }
}

function formatIDR(amount) {
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

function getRelativeTime(timestamp) {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const past = new Date(timestamp);
    const diffMin = Math.floor((now - past) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
}
