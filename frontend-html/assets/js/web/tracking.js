/**
 * Sela Cafe — Order Tracking Module
 * Fetches order details from API Gateway and manages visual timeline updates.
 * Simulates status progression for demo/offline orders.
 */

const STATUS_ORDER = ["WAITING_PAYMENT", "PAID", "PREPARING", "READY", "COMPLETED"];
const STATUS_LABELS = {
    "WAITING_PAYMENT": "Received",
    "PAID": "Confirmed",
    "PREPARING": "Preparing",
    "READY": "Ready",
    "ON_DELIVERY": "En Route",
    "COMPLETED": "Completed",
    "CANCELLED": "Cancelled"
};

let refreshInterval = null;
let qrisInitialized = false;
let qrisPollInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    initTracking();
});

// Clean up timer on page unload
window.addEventListener('beforeunload', () => {
    if (refreshInterval) clearInterval(refreshInterval);
});

function formatIDR(n) {
    return 'Rp ' + Number(n).toLocaleString('id-ID');
}

async function initTracking() {
    // Get Order ID from URL parameter (?id=...)
    const params = new URLSearchParams(window.location.search);
    let orderId = params.get('id');

    // Fallback to localStorage lastOrderId
    if (!orderId) {
        orderId = localStorage.getItem('lastOrderId');
    }

    if (!orderId) {
        window.showToast('No order reference found. Returning to menu...', 'error');
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 3000);
        return;
    }

    // Bind refresh button
    const refreshBtn = document.getElementById('btn-refresh-tracking');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            window.showToast('Refreshing status...', 'default');
            fetchAndRenderOrder(orderId, true);
        });
    }

    // Reset global QRIS states
    qrisInitialized = false;
    if (qrisPollInterval) {
        clearInterval(qrisPollInterval);
        qrisPollInterval = null;
    }

    // Initial fetch
    await fetchAndRenderOrder(orderId, false);

    // Setup 10-second polling
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        fetchAndRenderOrder(orderId, false);
    }, 10000);
}

async function fetchAndRenderOrder(orderId, isManualRefresh = false) {
    let order = null;

    // Check if it's a local/offline order
    if (String(orderId).startsWith('LOCAL-')) {
        order = getSimulatedOrder(orderId, isManualRefresh);
    } else {
        try {
            const response = await window.apiFetch(`/api/orders/getById/${orderId}`);
            if (response.ok) {
                const apiRes = await response.json();
                order = apiRes.data;
            } else {
                console.warn('API error fetching order. Falling back to simulation.');
            }
        } catch (e) {
            console.warn('Network error fetching order. Falling back to simulation.');
        }

        // Real order offline fallback
        if (!order) {
            order = getSimulatedOrder(orderId, isManualRefresh);
        }
    }

    if (!order) {
        window.showToast('Unable to track order.', 'error');
        return;
    }

    renderOrderDetails(order);
    if (isManualRefresh) {
        window.showToast('Status is up to date.', 'success');
    }
}

// ─── Simulated Order Progression ──────────────────────────────────────────────
function getSimulatedOrder(orderId, advanceStatus = false) {
    const cached = localStorage.getItem('localOrder_' + orderId);
    let order;

    if (cached) {
        order = JSON.parse(cached);
    } else {
        // Generate a synthetic order if none exists in cache (e.g. directly hit tracking page with random ID)
        order = {
            id: orderId,
            orderCode: 'ORD-' + String(orderId).replace(/[^0-9]/g, '').slice(-8),
            orderType: 'DINE_IN',
            status: 'WAITING_PAYMENT',
            paymentMethod: 'QRIS',
            totalPrice: 110000,
            discountAmount: 0,
            deliveryFee: 0,
            customerName: localStorage.getItem('userName') || 'Valued Guest',
            customerPhone: '08123456789',
            deliveryAddress: '',
            notes: 'Less ice please',
            createdAt: new Date().toISOString(),
            items: [
                { menuId: 101, menuName: 'Signature Velvet Latte', menuPrice: 55000, quantity: 1, subtotal: 55000, notes: 'Oat Milk' },
                { menuId: 102, menuName: 'Saffron Croissant', menuPrice: 55000, quantity: 1, subtotal: 55000, notes: 'Warm' }
            ]
        };
        localStorage.setItem('localOrder_' + orderId, JSON.stringify(order));
    }

    // Advance status for mock progression to delight user
    let currentStatus = order.status;
    if (advanceStatus) {
        const currentIndex = STATUS_ORDER.indexOf(currentStatus);
        if (currentIndex !== -1 && currentIndex < STATUS_ORDER.length - 1) {
            currentStatus = STATUS_ORDER[currentIndex + 1];
            order.status = currentStatus;
            localStorage.setItem('localOrder_' + orderId, JSON.stringify(order));
        }
    }

    return order;
}

// ─── Rendering Engine ──────────────────────────────────────────────────────────
function renderOrderDetails(order) {
    // 1. Order Code
    const orderNumEl = document.getElementById('order-number');
    if (orderNumEl) {
        orderNumEl.textContent = '#' + (order.orderCode || 'ORD-' + order.id);
    }

    // 2. Status Badge
    const badgeEl = document.getElementById('order-status-badge');
    if (badgeEl) {
        const isLive = order.status !== 'COMPLETED' && order.status !== 'CANCELLED';
        const pulseDot = isLive ? `<span class="w-1.5 h-1.5 rounded-full bg-deep-espresso active-pulse"></span>` : '';
        const statusLabel = STATUS_LABELS[order.status] || order.status;
        badgeEl.innerHTML = `${pulseDot} Status: ${statusLabel}`;
    }

    // 3. ETA Text
    const etaEl = document.getElementById('order-eta');
    if (etaEl) {
        etaEl.textContent = getETA(order.status, order.orderType);
    }

    // 4. Stepper Timeline
    renderTimeline(order.status, order.orderType);

    // 5. Service Info Grid
    const typeEl = document.getElementById('order-type-display');
    if (typeEl) {
        typeEl.textContent = order.orderType === 'DINE_IN' ? 'Dine In' : order.orderType === 'TAKE_AWAY' ? 'Take Away' : 'Delivery';
    }

    const payEl = document.getElementById('order-payment-display');
    if (payEl) {
        payEl.textContent = order.paymentMethod || 'QRIS';
    }

    handleQrisPayment(order);

    const infoEl = document.getElementById('order-info-text');
    if (infoEl) {
        infoEl.textContent = getInfoText(order.status, order.orderType);
    }

    // 6. Items Table
    const itemsContainer = document.getElementById('order-items-list');
    if (itemsContainer) {
        if (order.items && order.items.length > 0) {
            itemsContainer.innerHTML = order.items.map(item => `
                <div class="flex justify-between items-start group">
                    <div class="flex-1">
                        <p class="font-body-lg text-body-lg text-deep-espresso font-semibold">${item.menuName}</p>
                        <p class="font-label-md text-label-md text-on-surface-variant">
                            Qty: ${item.quantity} ${item.notes ? `| Note: ${item.notes}` : ''}
                        </p>
                    </div>
                    <div class="font-label-caps text-label-md text-primary whitespace-nowrap">
                        ${formatIDR(item.subtotal || (item.menuPrice * item.quantity))}
                    </div>
                </div>
            `).join('<div class="border-t border-outline-muted/50 my-4"></div>');
        } else {
            itemsContainer.innerHTML = `<p class="font-body-md text-on-surface-variant">No items found.</p>`;
        }
    }

    // 7. Bill Summary
    const subtotal = (order.items || []).reduce((sum, item) => sum + (item.subtotal || (item.menuPrice * item.quantity)), 0);
    const discount = order.discountAmount || 0;
    const delivery = order.deliveryFee || 0;

    const subtotalEl = document.getElementById('order-subtotal');
    if (subtotalEl) subtotalEl.textContent = formatIDR(subtotal);

    const deliveryRow = document.getElementById('delivery-row');
    const deliveryFeeEl = document.getElementById('order-delivery-fee');
    if (deliveryRow && deliveryFeeEl) {
        if (order.orderType === 'DELIVERY') {
            deliveryRow.style.display = 'flex';
            deliveryFeeEl.textContent = formatIDR(delivery);
        } else {
            deliveryRow.style.display = 'none';
        }
    }

    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('order-discount');
    if (discountRow && discountEl) {
        if (discount > 0) {
            discountRow.style.display = 'flex';
            discountEl.textContent = '- ' + formatIDR(discount);
        } else {
            discountRow.style.display = 'none';
        }
    }

    const totalEl = document.getElementById('order-total');
    if (totalEl) {
        totalEl.textContent = formatIDR(order.totalPrice || (subtotal + delivery - discount));
    }
}

// Helper: Translate Status to ETA Descriptions
function getETA(status, orderType) {
    switch (status) {
        case 'WAITING_PAYMENT':
            return 'Waiting Payment';
        case 'PAID':
            return orderType === 'DELIVERY' ? '25 - 35 Mins' : '15 - 20 Mins';
        case 'PREPARING':
            return orderType === 'DELIVERY' ? '15 - 20 Mins' : '8 - 12 Mins';
        case 'READY':
            return orderType === 'DELIVERY' ? 'Ready for Courier' : 'Ready for Pickup';
        case 'ON_DELIVERY':
            return 'Arriving in 5 - 10 Mins';
        case 'COMPLETED':
            return 'Ready / Savoring';
        case 'CANCELLED':
            return 'Order Cancelled';
        default:
            return 'Processing...';
    }
}

// Helper: Dynamic status contextual copywriting
function getInfoText(status, orderType) {
    switch (status) {
        case 'WAITING_PAYMENT':
            return 'Your order has been placed. Please complete your payment so our baristas can begin crafting your selection.';
        case 'PAID':
            return 'Payment received. Your order is confirmed and queued. Our baristas are preparing to brew.';
        case 'PREPARING':
            return 'Your signature coffee and delicacies are currently being handcrafted by our expert baristas. The aroma is building.';
        case 'READY':
            return orderType === 'DELIVERY' 
                ? 'Your order is packed and waiting for courier pickup. It will depart shortly.' 
                : 'Your order is complete and waiting for you at the counter. Show your order reference to claim your cup.';
        case 'ON_DELIVERY':
            return 'Your order is en route with our courier. Sela premium experience is heading straight to your door.';
        case 'COMPLETED':
            return 'Your Sela moments have been delivered. Thank you for sharing your coffee ritual with us.';
        case 'CANCELLED':
            return 'Your order was cancelled. If you need assistance, please consult our support team.';
        default:
            return 'Checking status details...';
    }
}

// Helper: Visual Timeline Injection
function renderTimeline(status, orderType) {
    const stepsContainer = document.getElementById('timeline-steps');
    const progressLine = document.getElementById('progress-line');
    if (!stepsContainer) return;

    // Define 5-step checklist
    const steps = [
        { key: 'WAITING_PAYMENT', label: 'RECEIVED' },
        { key: 'PAID', label: 'CONFIRMED' },
        { key: 'PREPARING', label: 'PREPARING' },
        { key: 'READY', label: orderType === 'DELIVERY' ? 'EN ROUTE' : 'READY' },
        { key: 'COMPLETED', label: 'COMPLETED' }
    ];

    // Get current index (ON_DELIVERY falls into index 3: READY / EN ROUTE)
    let currentIdx = steps.findIndex(s => s.key === status);
    if (status === 'ON_DELIVERY') {
        currentIdx = 3;
    }

    // Handle cancelled state
    if (status === 'CANCELLED') {
        progressLine.style.width = '0%';
        stepsContainer.innerHTML = `
            <div class="col-span-5 text-center text-error font-label-caps text-xs tracking-widest uppercase">
                Order Tracking Suspended — Cancelled
            </div>
        `;
        return;
    }

    // Set connecting progress line width
    const percentage = currentIdx === -1 ? 0 : (currentIdx * 25);
    progressLine.style.width = `${percentage}%`;

    // Render Steps
    stepsContainer.innerHTML = steps.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;

        let circleHTML = '';
        let labelClass = 'font-label-caps text-[10px] ';

        if (isCompleted) {
            // Completed Step: Solid circle
            circleHTML = `<div class="w-3 h-3 rounded-full bg-deep-espresso ring-4 ring-paper-white relative z-10"></div>`;
            labelClass += 'text-deep-espresso';
        } else if (isActive) {
            // Active Step: Pulsating target circle
            circleHTML = `
                <div class="w-5 h-5 rounded-full bg-paper-white border-2 border-deep-espresso ring-4 ring-paper-white relative z-10 flex items-center justify-center">
                    <div class="w-2 h-2 rounded-full bg-deep-espresso active-pulse"></div>
                </div>
            `;
            labelClass += 'text-deep-espresso font-bold';
        } else {
            // Inactive Step: Gray circle
            circleHTML = `<div class="w-3 h-3 rounded-full bg-outline-variant ring-4 ring-paper-white relative z-10"></div>`;
            labelClass += 'text-outline opacity-30';
        }

        return `
            <div class="flex flex-col items-center gap-4">
                <div class="h-5 flex items-center justify-center">
                    ${circleHTML}
                </div>
                <span class="${labelClass}">${step.label}</span>
            </div>
        `;
    }).join('');
}

// ─── Komerce QRISLY Payment Handler ───────────────────────────────────────────
async function handleQrisPayment(order) {
    const qrisBox = document.getElementById('qris-payment-box');
    if (!qrisBox) return;

    // If order has already transitioned from WAITING_PAYMENT, hide and clean up
    if (order.status !== 'WAITING_PAYMENT') {
        qrisBox.classList.add('hidden');
        if (qrisPollInterval) {
            clearInterval(qrisPollInterval);
            qrisPollInterval = null;
        }
        return;
    }

    qrisBox.classList.remove('hidden');

    // Prevent duplicate initialization
    if (qrisInitialized) return;
    qrisInitialized = true;

    const qrImage = document.getElementById('qris-image');
    const loadingOverlay = document.getElementById('qris-loading-overlay');
    const statusLabel = document.getElementById('qris-status-label');
    const statusBadge = document.getElementById('qris-status-badge');
    const simulateBtn = document.getElementById('btn-simulate-success');
    const boxTitle = document.getElementById('qris-box-title');
    const instructionText = document.getElementById('qris-instruction-text');

    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    if (statusLabel) statusLabel.textContent = 'Generating QR Code...';

    try {
        // Post to backend to charge/generate QRIS
        const res = await window.apiFetch('/api/payments/charge', {
            method: 'POST',
            body: JSON.stringify({
                orderId: Number(order.id),
                paymentMethod: 'QRIS'
            })
        });

        if (loadingOverlay) loadingOverlay.classList.add('hidden');

        if (res.ok) {
            const apiRes = await res.json();
            const payment = apiRes.data;

            if (qrImage && payment.qrisImageUrl) {
                qrImage.src = payment.qrisImageUrl;
            }

            if (statusLabel) statusLabel.textContent = 'Awaiting Payment';

            const isLocal = payment.transactionId && payment.transactionId.startsWith('TX-');

            if (isLocal) {
                if (boxTitle) boxTitle.textContent = 'QRIS SIMULATOR (TEST FALLBACK)';
                if (statusBadge) {
                    statusBadge.className = statusBadge.className.replace('bg-heritage-cream', 'bg-error-container').replace('text-deep-espresso', 'text-on-error-container');
                }
                if (statusLabel) statusLabel.textContent = 'Simulation Mode';
                if (instructionText) {
                    instructionText.innerHTML = 'Komerce QRIS API returned fallback because no static QRIS is configured. <br>Use the button below to simulate successful payment.';
                }
                if (simulateBtn) {
                    simulateBtn.classList.remove('hidden');
                    simulateBtn.onclick = async () => {
                        simulateBtn.disabled = true;
                        simulateBtn.textContent = 'SIMULATING...';
                        try {
                            const simRes = await window.apiFetch(`/api/payments/${payment.transactionId}/simulate-success`, {
                                method: 'POST'
                            });
                            if (simRes.ok) {
                                window.showToast('Payment simulated successfully!', 'success');
                                fetchAndRenderOrder(order.id, false);
                            } else {
                                window.showToast('Simulation failed.', 'error');
                                simulateBtn.disabled = false;
                                simulateBtn.textContent = 'SIMULATE PAYMENT SUCCESS (TEST MODE)';
                            }
                        } catch (err) {
                            window.showToast('Connection failed.', 'error');
                            simulateBtn.disabled = false;
                            simulateBtn.textContent = 'SIMULATE PAYMENT SUCCESS (TEST MODE)';
                        }
                    };
                }
            } else {
                if (boxTitle) boxTitle.textContent = 'DYNAMIC QRIS PAYMENT';
                if (simulateBtn) simulateBtn.classList.add('hidden');
                if (instructionText) {
                    instructionText.innerHTML = 'Scan the QR code above to pay exactly <strong class="text-moss-green font-bold">' + formatIDR(payment.amount) + '</strong>. Your order status will update automatically once verified.';
                }

                // Start polling payment status from backend
                if (qrisPollInterval) clearInterval(qrisPollInterval);
                qrisPollInterval = setInterval(async () => {
                    try {
                        const statusRes = await window.apiFetch(`/api/payments/order/${order.id}`);
                        if (statusRes.ok) {
                            const statusData = await statusRes.json();
                            const currentPayment = statusData.data;

                            if (currentPayment.status === 'SUCCESS') {
                                clearInterval(qrisPollInterval);
                                qrisPollInterval = null;
                                window.showToast('Payment received! Thank you.', 'success');
                                fetchAndRenderOrder(order.id, false);
                            }
                        }
                    } catch (e) {
                        console.warn('Error polling payment status:', e);
                    }
                }, 5000);
            }
        } else {
            if (statusLabel) statusLabel.textContent = 'Failed to load payment';
            window.showToast('Could not initialize payment.', 'error');
        }
    } catch (err) {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        if (statusLabel) statusLabel.textContent = 'Connection Error';
        window.showToast('Connection error to payment gateway.', 'error');
    }
}
