/**
 * Sela Cafe — Checkout Module
 * Renders cart summary, handles form validation, and posts order to API Gateway.
 */

const SERVICE_FEE_PCT = 0.10;
const ORDER_API = 'http://localhost:8090';

document.addEventListener('DOMContentLoaded', () => {
    renderCheckoutSummary();
    prefillCustomerInfo();
    wireCheckoutForm();
    loadDiningTables();
});

// ─── Cart Helpers ─────────────────────────────────────────────────────────────
function getCart() {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
    catch (e) { return []; }
}

function formatIDR(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }

// ─── Render Summary ───────────────────────────────────────────────────────────
function renderCheckoutSummary() {
    const container  = document.getElementById('checkout-items-container');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const serviceEl  = document.getElementById('checkout-service');
    const totalEl    = document.getElementById('checkout-total');

    const cart = getCart();

    if (container) {
        if (cart.length === 0) {
            container.innerHTML = `
            <div class="text-center py-8">
                <p class="font-body-md text-on-surface-variant opacity-60">No items in cart.</p>
                <a href="menu.html" class="font-label-caps text-label-caps text-primary underline mt-2 inline-block">Browse Menu</a>
            </div>`;
        } else {
            container.innerHTML = cart.map(item => `
            <div class="flex gap-4 items-start">
                <div class="w-20 h-20 bg-surface-container overflow-hidden shrink-0">
                    <img class="w-full h-full object-cover"
                         src="${item.imageUrl || ''}"
                         alt="${item.name}"
                         onerror="this.src='https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=200'"/>
                </div>
                <div class="flex-1">
                    <p class="font-body-md text-on-surface font-semibold">${item.name}</p>
                    <p class="font-label-md text-label-md text-on-surface-variant">Qty: ${item.quantity || 1}</p>
                </div>
                <div class="font-label-caps text-label-md text-primary whitespace-nowrap">
                    ${formatIDR(item.price * (item.quantity || 1))}
                </div>
            </div>
            `).join('<div class="border-t border-outline-muted my-2"></div>');
        }
    }

    const subtotal = cart.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
    const service  = Math.round(subtotal * SERVICE_FEE_PCT);
    const total    = subtotal + service;

    if (subtotalEl) subtotalEl.textContent = formatIDR(subtotal);
    if (serviceEl)  serviceEl.textContent  = formatIDR(service);
    if (totalEl)    totalEl.textContent    = formatIDR(total);
}

// ─── Pre-fill Customer Info ───────────────────────────────────────────────────
function prefillCustomerInfo() {
    const userName = localStorage.getItem('userName');
    const nameField  = document.getElementById('checkout-name');
    const phoneField = document.getElementById('checkout-phone');

    if (nameField && userName && !nameField.value) nameField.value = userName;
}

// ─── Wire the PLACE ORDER button ──────────────────────────────────────────────
function wireCheckoutForm() {
    const btn = document.getElementById('btn-place-order');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        clearCheckoutError();

        const name  = document.getElementById('checkout-name')?.value?.trim();
        const phone = document.getElementById('checkout-phone')?.value?.trim();
        const note  = document.getElementById('checkout-note')?.value?.trim() || '';

        // Detect order type from button styles
        let orderType = 'DINE_IN';
        if (document.getElementById('btn-take-away')?.classList.contains('bg-primary')) {
            orderType = 'TAKE_AWAY';
        } else if (document.getElementById('btn-delivery')?.classList.contains('bg-primary')) {
            orderType = 'DELIVERY';
        }

        // Detect payment method
        const paymentSelected = document.querySelector('input[name="payment"]:checked');
        const paymentMethod = paymentSelected?.id === 'pay-cash' ? 'CASH' : 'QRIS';

        // Retrieve delivery info if applicable
        let deliveryAddress = '';
        let courierNotes = '';
        if (orderType === 'DELIVERY') {
            deliveryAddress = document.querySelector('#field-delivery textarea')?.value?.trim() || '';
            courierNotes = document.querySelector('#field-delivery input')?.value?.trim() || '';
        }

        const cart = getCart();

        if (!name)  { showCheckoutError('Please enter your full name.'); return; }
        if (!phone) { showCheckoutError('Please enter your phone number.'); return; }
        if (cart.length === 0) { showCheckoutError('Your cart is empty.'); return; }

        // Loading state
        btn.disabled = true;
        btn.innerHTML = `<span class="flex items-center gap-3">PLACING ORDER <span class="animate-spin material-symbols-outlined text-sm">autorenew</span></span>`;

        let tableId = null;
        if (orderType === 'DINE_IN') {
            const tableSelect = document.getElementById('checkout-table');
            if (tableSelect) {
                tableId = tableSelect.value ? Number(tableSelect.value) : null;
            }
            if (!tableId) {
                showCheckoutError('Please select a dining table.');
                return;
            }
        }

        const payload = {
            tableId,
            sessionId: null,
            orderType,
            paymentMethod,
            customerName: name,
            customerPhone: phone,
            deliveryAddress: deliveryAddress,
            notes: note + (courierNotes ? ` | Courier notes: ${courierNotes}` : ''),
            items: cart.map(i => ({
                menuId:   Number(i.id),
                quantity: i.quantity || 1,
                notes:    i.notes || ''
            }))
        };

        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${ORDER_API}/api/orders/create`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                // If API returns ApiRes structure: data is inside data.data
                const orderData = data.data || data;
                const orderId = orderData.id || orderData.orderId || 'PENDING';
                localStorage.setItem('lastOrderId', String(orderId));
                // Clear cart after successful order
                localStorage.removeItem('cart');
                window.location.href = `order-tracking.html?id=${orderId}`;
            } else {
                showCheckoutError(data.message || 'Order failed. Please try again.');
                resetPlaceOrderBtn(btn);
            }
        } catch (err) {
            console.error('Checkout error:', err);
            showCheckoutError('Unable to connect to server. Please try again.');
            resetPlaceOrderBtn(btn);
        }
    });
}

// ─── Error Helpers ────────────────────────────────────────────────────────────
function showCheckoutError(msg) {
    const status  = document.getElementById('checkout-status');
    const errMsg  = document.getElementById('checkout-error-msg');
    if (status) status.classList.remove('hidden');
    if (errMsg) errMsg.textContent = msg;
}

function clearCheckoutError() {
    const status = document.getElementById('checkout-status');
    const errMsg = document.getElementById('checkout-error-msg');
    if (status) status.classList.add('hidden');
    if (errMsg) errMsg.textContent = '';
}

function resetPlaceOrderBtn(btn) {
    btn.disabled = false;
    btn.innerHTML = `PLACE ORDER <span class="material-symbols-outlined text-sm">arrow_forward</span>`;
}

async function loadDiningTables() {
    const tableSelect = document.getElementById('checkout-table');
    if (!tableSelect) return;

    try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${ORDER_API}/api/tables/getAll`, { headers });
        const apiRes = await res.json();
        
        if (res.ok && apiRes.success && apiRes.data) {
            const availableTables = apiRes.data.filter(table => table.status === 'AVAILABLE');
            
            if (availableTables.length === 0) {
                tableSelect.innerHTML = `<option value="">No tables available</option>`;
                tableSelect.disabled = true;
                return;
            }

            tableSelect.disabled = false;
            tableSelect.innerHTML = availableTables
                .map(table => {
                    const desc = `Table ${table.tableNumber} (Capacity: ${table.capacity})`;
                    return `<option value="${table.id}" data-qrcode="${table.qrCode}">${desc}</option>`;
                })
                .join('');

            // Pre-select scanned table from URL query parameter or localStorage
            const urlParams = new URLSearchParams(window.location.search);
            const scannedTableQr = urlParams.get('table') || localStorage.getItem('scannedTable');
            if (scannedTableQr) {
                const matchedTable = availableTables.find(t => t.qrCode === scannedTableQr);
                if (matchedTable) {
                    tableSelect.value = matchedTable.id;
                }
            }
        }
    } catch (err) {
        console.error('Error fetching tables from backend:', err);
    }
}
