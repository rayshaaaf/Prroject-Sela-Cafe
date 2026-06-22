/**
 * kitchen.js - Sela Cafe Kitchen Hub Integration
 */

const API_URL = 'http://localhost:8090/api/orders';
const POLL_INTERVAL = 10000; // Pooling data otomatis setiap 10 detik
const CURRENT_ROLE = 'KITCHEN'; 

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    fetchOrders();
    setInterval(fetchOrders, POLL_INTERVAL);
    
    // Sambungkan tombol manual refresh bawaan HTML ke fungsi fetch
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.setAttribute('onclick', 'fetchOrders()');
    }
});

// Live Clock bawaan template
function initClock() {
    const updateClock = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        document.getElementById('live-clock').textContent = timeString;
    };
    setInterval(updateClock, 1000);
    updateClock();
}

// State Management Loader
function showLoader(show) {
    const loader = document.getElementById('global-loader');
    if (!loader) return;
    if (show) {
        loader.classList.remove('opacity-0', 'pointer-events-none');
    } else {
        loader.classList.add('opacity-0', 'pointer-events-none');
    }
}

// Perhitungan Waktu Relatif Masuknya Order
function getRelativeTime(timestamp) {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const past = new Date(timestamp);
    const diffMin = Math.floor((now - past) / 60000);
    
    if (diffMin < 1) return 'Just now';
    return `${diffMin}m ago`;
}

// Menembak Endpoint GET /api/orders/kitchen
async function fetchOrders() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) refreshBtn.classList.add('animate-spin');
    
    try {
        const response = await window.apiFetch('/api/orders/kitchen');
        if (!response.ok) throw new Error('Network error');
        
        const apiRes = await response.json();
        if (apiRes.success) {
            renderBoard(apiRes.data || []);
        }
    } catch (err) {
        console.error("API Error fetching kitchen orders:", err);
        renderBoard([]);
    } finally {
        if (refreshBtn) {
            setTimeout(() => refreshBtn.classList.remove('animate-spin'), 600);
        }
    }
}

// Menembak Endpoint PUT /api/orders/updateStatus/{id}?status=...
async function updateOrderStatus(orderId, newStatus) {
    showLoader(true);
    try {
        const response = await window.apiFetch(`/api/orders/updateStatus/${orderId}?status=${newStatus}`, {
            method: 'PUT',
            headers: { 
                'X-Role': CURRENT_ROLE
            }
        });
        
        const apiRes = await response.json();
        if (apiRes.success) {
            await fetchOrders();
        } else {
            window.showAlertModal("Gagal Update Status", `Gagal mengupdate status: ${apiRes.message}`, "error");
        }
    } catch (err) {
        console.error("Update Status Error:", err);
        window.showAlertModal("Gagal Update Status", "Gagal mengupdate status karena masalah koneksi.", "error");
    } finally {
        showLoader(false);
    }
}

function renderBoard(orders) {
    const cols = {
        PAID: document.getElementById('col-incoming'),
        PREPARING: document.getElementById('col-preparing'),
        READY: document.getElementById('col-ready')
    };

    const counts = { PAID: 0, PREPARING: 0, READY: 0 };
    Object.values(cols).forEach(el => { if (el) el.innerHTML = ''; });

    orders.forEach(order => {
        const status = order.status ? order.status.toUpperCase() : 'PAID';
        if (!cols[status]) return;
        
        counts[status]++;
        const card = createOrderCard(order, status);
        cols[status].appendChild(card);
    });

    if (document.getElementById('count-incoming')) document.getElementById('count-incoming').innerText = counts.PAID;
    if (document.getElementById('count-preparing')) document.getElementById('count-preparing').innerText = counts.PREPARING;
    if (document.getElementById('count-ready')) document.getElementById('count-ready').innerText = counts.READY;

    Object.keys(cols).forEach(key => {
        if (cols[key] && counts[key] === 0) {
            cols[key].innerHTML = `
                <div class="flex flex-col items-center justify-center h-64 border border-dashed border-outline-variant/40 rounded-lg text-on-surface-variant/40">
                    <span class="material-symbols-outlined text-[48px] mb-2">inventory_2</span>
                    <p class="font-label-caps text-[10px] tracking-widest uppercase">No Active Orders</p>
                </div>
            `;
        }
    });
}

function createOrderCard(order, status) {
    const card = document.createElement('div');
    card.className = "order-card bg-paper-white border border-outline-muted p-5 rounded shadow-sm flex flex-col gap-4";
    
    const timeAgo = getRelativeTime(order.createdAt);
    const isUrgent = order.createdAt && (new Date() - new Date(order.createdAt)) > 900000;
    const typeIcon = order.type === 'Delivery' ? 'local_shipping' : 'restaurant';
    
    let actionBtn = '';
    if (status === 'PAID') {
        actionBtn = `<button onclick="updateOrderStatus('${order.id}', 'PREPARING')" class="w-full bg-deep-espresso text-white py-3 font-label-caps text-label-caps tracking-widest hover:brightness-110 active:scale-[0.98] transition-all">START PREPARING</button>`;
    } else if (status === 'PREPARING') {
        actionBtn = `<button onclick="updateOrderStatus('${order.id}', 'READY')" class="w-full border-2 border-deep-espresso text-deep-espresso py-3 font-label-caps text-label-caps tracking-widest hover:bg-deep-espresso/5 active:scale-[0.98] transition-all">MARK AS READY</button>`;
    } else {
        actionBtn = `
            <div class="flex items-center justify-center gap-2 py-3 bg-secondary-container text-on-secondary-container rounded font-label-caps text-label-caps tracking-widest">
                <span class="material-symbols-outlined text-[18px]">check_circle</span> READY FOR SERVICE
            </div>`;
    }

    const itemsHtml = order.items ? order.items.map(item => `
        <div class="flex justify-between items-start border-b border-outline-variant/10 py-2 last:border-0">
            <div class="flex gap-2">
                <span class="font-label-md text-deep-espresso font-bold">${item.quantity || item.qty || 1}x</span>
                <span class="text-on-surface">${item.productName || item.name}</span>
            </div>
            <span class="material-symbols-outlined text-[16px] text-on-surface-variant/30">radio_button_unchecked</span>
        </div>
    `).join('') : '';

    const noteSection = order.notes ? `
        <div class="bg-heritage-cream/40 p-3 rounded-sm border-l-2 border-on-primary-container">
            <p class="font-label-caps text-[10px] text-on-primary-container mb-1 tracking-wider">CHEF NOTES</p>
            <p class="text-body-sm text-on-surface-variant italic leading-snug">${order.notes}</p>
        </div>
    ` : '';

    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-label-md text-deep-espresso font-bold">#${order.id}</span>
                    <span class="text-on-surface-variant/40 text-[12px]">•</span>
                    <div class="flex items-center gap-1 text-on-surface-variant/60">
                        <span class="material-symbols-outlined text-[14px]">${typeIcon}</span>
                        <span class="font-label-caps text-[10px]">${order.type || 'Dine-In'}</span>
                    </div>
                </div>
                <h3 class="font-headline-md text-[22px] text-primary">${order.customerName || order.customer_name || 'Guest'}</h3>
            </div>
            <span class="font-label-md text-[12px] ${isUrgent ? 'text-error font-bold' : 'text-on-surface-variant/60'}">${timeAgo}</span>
        </div>
        
        <div class="sela-line"></div>
        
        <div class="flex-1 space-y-1">
            ${itemsHtml}
        </div>

        ${noteSection}

        <div class="mt-2">
            ${actionBtn}
        </div>
    `;
    return card;
}