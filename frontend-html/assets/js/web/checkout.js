/**
 * Sela Cafe — Checkout Module
 * Handles UI interactions, renders cart summary, form validation, and API Gateway.
 */

const SERVICE_FEE_PCT = 0.10;
const ORDER_API = 'http://localhost:8090';

let appliedPromo = null;

document.addEventListener('DOMContentLoaded', () => {
    renderCheckoutSummary();
    prefillCustomerInfo();
    wireCheckoutForm();
    wireVoucherForm();
    loadDiningTables();
});

// ─── UI Interactions ──────────────────────────────────────────────────────────
window.switchType = function(type) {
    const buttons = document.querySelectorAll('.order-type-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-deep-espresso', 'text-paper-white', 'border-deep-espresso');
        btn.classList.add('bg-paper-white', 'text-on-surface-variant', 'border-outline/20');
    });

    const activeBtn = document.getElementById(`btn-${type}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-deep-espresso', 'text-paper-white', 'border-deep-espresso');
        activeBtn.classList.remove('bg-paper-white', 'text-on-surface-variant', 'border-outline/20');
    }

    const dineInField = document.getElementById('field-dine-in');
    const deliveryField = document.getElementById('field-delivery');
    const cashContainer = document.getElementById('payment-cash-container');

    if (type === 'dine-in') {
        dineInField.classList.remove('hidden');
        dineInField.classList.add('flex');
        deliveryField.classList.add('hidden');
        deliveryField.classList.remove('flex');
        if (cashContainer) cashContainer.classList.remove('hidden');
    } else if (type === 'delivery') {
        dineInField.classList.add('hidden');
        dineInField.classList.remove('flex');
        deliveryField.classList.remove('hidden');
        deliveryField.classList.add('flex');
        if (cashContainer) cashContainer.classList.add('hidden');
        window.selectPayment('qris');
    } else {
        // Take Away
        dineInField.classList.add('hidden');
        dineInField.classList.remove('flex');
        deliveryField.classList.add('hidden');
        deliveryField.classList.remove('flex');
        if (cashContainer) cashContainer.classList.remove('hidden');
    }
};

window.selectPayment = function(method) {
    const radio = document.getElementById(`pay-${method}`);
    if (radio) radio.checked = true;
};

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
    const voucherRow = document.getElementById('voucher-row');
    const voucherEl  = document.getElementById('checkout-voucher');
    const totalEl    = document.getElementById('checkout-total');

    const cart = getCart();

    if (container) {
        if (cart.length === 0) {
            container.innerHTML = `
            <div class="text-center py-8">
                <span class="material-symbols-outlined text-[48px] mb-4 text-outline/30">shopping_bag</span>
                <p class="font-body-md text-on-surface-variant mb-4">No items in your ritual.</p>
                <button onclick="window.location.href='menu.html'" class="font-label-caps text-[11px] tracking-widest text-deep-espresso border-b border-deep-espresso pb-1 uppercase hover:opacity-70 transition-opacity bg-transparent">Browse Menu</button>
            </div>`;
        } else {
            container.innerHTML = cart.map(item => `
            <div class="flex gap-4 items-center">
                <div class="w-16 h-16 bg-surface-container overflow-hidden shrink-0 border border-outline/5">
                    <img class="w-full h-full object-cover"
                         src="${item.imageUrl || ''}"
                         alt="${item.name}"
                         onerror="this.src='https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=200'"/>
                </div>
                <div class="flex-1">
                    <h4 class="font-headline-md text-[18px] text-deep-espresso leading-tight mb-1">${item.name}</h4>
                    <span class="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">QTY: ${item.quantity || 1}</span>
                </div>
                <div class="font-label-md text-[14px] text-deep-espresso font-semibold">
                    ${formatIDR(item.price * (item.quantity || 1))}
                </div>
            </div>
            `).join('<div class="border-t border-outline/5 my-1"></div>');
        }
    }

    const subtotal = cart.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
    const service  = Math.round(subtotal * SERVICE_FEE_PCT);
    
    let discount = 0;
    if (appliedPromo) {
        discount = Math.round(subtotal * (appliedPromo.discountPct / 100));
        if (voucherRow) voucherRow.style.display = 'flex';
        if (voucherEl) voucherEl.textContent = '- ' + formatIDR(discount);
    } else {
        if (voucherRow) voucherRow.style.display = 'none';
    }
    
    const total = subtotal + service - discount;

    if (subtotalEl) subtotalEl.textContent = formatIDR(subtotal);
    if (serviceEl)  serviceEl.textContent  = formatIDR(service);
    if (totalEl)    totalEl.textContent    = formatIDR(total);
}

// ─── Pre-fill Customer Info ───────────────────────────────────────────────────
function prefillCustomerInfo() {
    const userName = localStorage.getItem('userName');
    const nameField  = document.getElementById('checkout-name');
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

        // Detect order type from button styles
        let orderType = 'DINE_IN';
        if (document.getElementById('btn-take-away')?.classList.contains('bg-deep-espresso')) {
            orderType = 'TAKE_AWAY';
        } else if (document.getElementById('btn-delivery')?.classList.contains('bg-deep-espresso')) {
            orderType = 'DELIVERY';
        }

        // Detect payment method
        const paymentSelected = document.querySelector('input[name="payment"]:checked');
        const paymentMethod = paymentSelected?.id === 'pay-cash' ? 'CASH' : 'QRIS';

        // Retrieve delivery info if applicable
        let deliveryAddress = '';
        let courierNotes = '';
        if (orderType === 'DELIVERY') {
            deliveryAddress = document.getElementById('checkout-address')?.value?.trim() || '';
            courierNotes = document.getElementById('checkout-courier-note')?.value?.trim() || '';
        }

        const cart = getCart();

        if (!name)  { showCheckoutError('Please enter your full name.'); return; }
        if (name.length < 3) { showCheckoutError('Name must be at least 3 characters.'); return; }
        if (!/^[a-zA-Z\s'.]+$/.test(name)) { showCheckoutError('Name can only contain letters, spaces, dots, and single quotes.'); return; }

        if (!phone) { showCheckoutError('Please enter your phone number.'); return; }
        const cleanPhone = phone.replace(/[\s\-()]/g, '');
        if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) { showCheckoutError('Phone number must be digits only (10-15 digits).'); return; }

        if (orderType === 'DELIVERY' && !deliveryAddress) {
            showCheckoutError('Please enter a delivery address.');
            return;
        }

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

        if (cart.length === 0) { showCheckoutError('Your cart is empty.'); return; }

        // Loading state
        btn.disabled = true;
        btn.innerHTML = `PLACING ORDER <span class="animate-spin material-symbols-outlined text-[18px]">autorenew</span>`;

        const payload = {
            tableId,
            sessionId: null,
            orderType,
            paymentMethod,
            customerName: name,
            customerPhone: cleanPhone,
            deliveryAddress: deliveryAddress,
            voucherCode: appliedPromo ? appliedPromo.promoCode : null,
            notes: (courierNotes ? `Courier notes: ${courierNotes}` : ''),
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
                const orderData = data.data || data;
                const orderId = orderData.id || orderData.orderId || 'PENDING';
                localStorage.setItem('lastOrderId', String(orderId));
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
    btn.innerHTML = `PLACE ORDER <span class="material-symbols-outlined text-[18px]">arrow_forward</span>`;
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

function wireVoucherForm() {
    const applyBtn = document.getElementById('btn-apply-voucher');
    if (applyBtn) {
        applyBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const input = document.getElementById('voucher-input');
            const code = input?.value?.trim();

            if (!code) {
                showVoucherFeedback('Please enter a voucher code.', 'error');
                return;
            }

            applyBtn.disabled = true;
            const originalText = applyBtn.textContent;
            applyBtn.textContent = 'APPLYING';

            try {
                const response = await fetch(`${ORDER_API}/api/promos/getByCode/${code}`);
                const apiRes = await response.json().catch(() => ({}));
                
                if (response.ok && apiRes.success && apiRes.data) {
                    appliedPromo = apiRes.data;
                    showVoucherFeedback(`Voucher code applied successfully! (${appliedPromo.discountPct}% OFF)`, 'success');
                    renderCheckoutSummary();
                } else {
                    appliedPromo = null;
                    showVoucherFeedback(apiRes.message || 'Invalid or expired voucher code.', 'error');
                    renderCheckoutSummary();
                }
            } catch (err) {
                console.error('Error applying voucher:', err);
                appliedPromo = null;
                showVoucherFeedback('Network error. Unable to validate voucher.', 'error');
                renderCheckoutSummary();
            } finally {
                applyBtn.disabled = false;
                applyBtn.textContent = originalText;
            }
        });
    }
}

function showVoucherFeedback(msg, type) {
    const statusMsg = document.getElementById('voucher-status-msg');
    if (!statusMsg) return;

    statusMsg.textContent = msg;
    statusMsg.classList.remove('hidden', 'text-moss-green', 'text-error');
    if (type === 'success') {
        statusMsg.classList.add('text-moss-green');
    } else {
        statusMsg.classList.add('text-error');
    }
}