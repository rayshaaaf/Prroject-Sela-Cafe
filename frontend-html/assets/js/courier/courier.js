const CURRENT_ROLE = 'COURIER';

document.addEventListener('DOMContentLoaded', () => {
    fetchCourierOrders();
    // Auto refresh every 10 seconds
    setInterval(fetchCourierOrders, 10000);

    const manualBtn = document.getElementById('manual-refresh');
    if (manualBtn) {
        manualBtn.addEventListener('click', () => {
            fetchCourierOrders();
            manualBtn.style.transform = 'rotate(180deg)';
            setTimeout(() => manualBtn.style.transform = 'rotate(0deg)', 300);
        });
    }
});

async function fetchCourierOrders() {
    try {
        const res = await window.apiFetch('/api/orders/getAll');
        if (!res.ok) throw new Error('Failed to fetch orders');
        
        const apiRes = await res.json();
        if (apiRes.success && apiRes.data) {
            renderCourierDashboard(apiRes.data);
        }
    } catch (err) {
        console.error('Error fetching courier orders:', err);
    }
}

function renderCourierDashboard(orders) {
    const userName = localStorage.getItem('userName') || '';
    const userId = localStorage.getItem('userId') || '';

    const profileNameEl = document.getElementById('courier-profile-name');
    if (profileNameEl && userName) {
        profileNameEl.textContent = userName;
    }

    // Available deliveries: status === 'READY', type === 'DELIVERY', and assigned to this courier
    const availableDeliveries = orders.filter(o => 
        o.status === 'READY' && 
        o.orderType === 'DELIVERY' && 
        (o.courierName === userName || String(o.courierId) === String(userId))
    );

    // Active deliveries: status === 'ON_DELIVERY', type === 'DELIVERY', and assigned to this courier
    const activeDeliveries = orders.filter(o => 
        o.status === 'ON_DELIVERY' && 
        o.orderType === 'DELIVERY' && 
        (o.courierName === userName || String(o.courierId) === String(userId))
    );

    // Render Available Grid
    const availableGrid = document.getElementById('available-grid');
    const availableEmpty = document.getElementById('available-empty-state');
    
    if (availableGrid) {
        if (availableDeliveries.length === 0) {
            availableGrid.classList.add('hidden');
            if (availableEmpty) availableEmpty.classList.remove('hidden');
        } else {
            availableGrid.classList.remove('hidden');
            if (availableEmpty) availableEmpty.classList.add('hidden');
            
            availableGrid.innerHTML = availableDeliveries.map(order => {
                const itemsSummary = order.items 
                    ? order.items.map(item => `${item.quantity || 1}x ${item.productName || item.name}`).join(', ')
                    : 'No items';

                return `
                    <div class="group bg-paper-white border border-outline-muted p-8 transition-all duration-300 hover:border-deep-espresso flex flex-col h-full">
                      <div class="flex justify-between items-start mb-6">
                        <div class="flex flex-col">
                          <span class="font-label-caps text-label-caps text-on-surface-variant mb-1">ORDER #${order.id}</span>
                          <h4 class="font-headline-md text-deep-espresso">${order.customerName || 'Guest'}</h4>
                        </div>
                        <div class="text-right">
                          <span class="font-label-caps text-label-caps text-on-surface-variant block mb-1">TOTAL</span>
                          <p class="font-body-md font-bold text-deep-espresso">${formatIDR(order.totalPrice)}</p>
                        </div>
                      </div>
                      <div class="sela-line mb-6"></div>
                      <div class="grid grid-cols-2 gap-6 mb-8">
                        <div>
                          <span class="font-label-caps text-label-caps text-[10px] text-on-surface-variant block mb-2 uppercase">Contact</span>
                          <div class="flex items-center gap-2 text-deep-espresso">
                            <span class="material-symbols-outlined text-lg" data-icon="phone">phone</span>
                            <span class="font-body-md">${order.customerPhone || '-'}</span>
                          </div>
                        </div>
                        <div>
                          <span class="font-label-caps text-label-caps text-[10px] text-on-surface-variant block mb-2 uppercase">Order Time</span>
                          <div class="flex items-center gap-2 text-deep-espresso">
                            <span class="material-symbols-outlined text-lg" data-icon="schedule">schedule</span>
                            <span class="font-body-md">${new Date(order.createdAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                        <div class="col-span-2">
                          <span class="font-label-caps text-label-caps text-[10px] text-on-surface-variant block mb-2 uppercase">Address</span>
                          <div class="flex items-start gap-2 text-deep-espresso">
                            <span class="material-symbols-outlined text-lg mt-1" data-icon="location_on">location_on</span>
                            <span class="font-body-md">${order.address || 'Cafe pickup'}</span>
                          </div>
                        </div>
                      </div>
                      <div class="bg-surface-container-low p-4 mb-8">
                        <span class="font-label-caps text-[10px] text-on-surface-variant block mb-2 uppercase">Item Summary</span>
                        <p class="font-body-md text-sm text-on-surface leading-relaxed">${itemsSummary}</p>
                      </div>
                      <button onclick="pickUpOrder(${order.id})" class="w-full py-4 bg-deep-espresso text-paper-white font-label-caps text-label-md tracking-widest active:scale-95 transition-transform hover:bg-primary-container">
                        Pick Up Order
                      </button>
                    </div>
                `;
            }).join('');
        }
    }

    // Render Active Deliveries
    const activeContainer = document.getElementById('active-deliveries-container');
    if (activeContainer) {
        if (activeDeliveries.length === 0) {
            activeContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 border border-dashed border-outline-muted rounded-xl bg-surface-container-low text-on-surface-variant/40">
                    <span class="material-symbols-outlined text-4xl mb-2">local_shipping</span>
                    <p class="font-label-caps text-[10px] tracking-widest uppercase">No Active Deliveries</p>
                </div>
            `;
        } else {
            activeContainer.innerHTML = activeDeliveries.map(order => {
                const itemsSummary = order.items 
                    ? order.items.map(item => `${item.quantity || 1}x ${item.productName || item.name}`).join(', ')
                    : 'No items';

                return `
                    <div class="bg-paper-white border border-outline-muted p-10 flex flex-col md:flex-row gap-12 items-center">
                        <div class="w-full md:w-1/3 aspect-square bg-surface-container-high rounded relative overflow-hidden">
                          <div class="absolute inset-0 z-0" data-alt="Vector map district layout" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCfIlrbrx45ttzwLnnlw2cRJDQApkjs5DQMU4MaXpOwjfTvf9I-N3_POiLHm14xj-tjBcHNts3tw5uf2qv6yK2l-O0E-tOa6l0HbCTnU9YZFP1YZTRKwlgA2P5iNWMGp_EBG9tGQygE6mhkrsKiixt4661OqLVt4wdm8EMet0epxO37tc2dlR2xWCOGm4pGtC4cfmp0Rq0xIWHEWeMsONaOC_Yqfaw5dveKC9OD-2BMF2uFUAy0GTZ7smp18DIUoJeU1ajntLy4Rldi')"></div>
                          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                            <span class="material-symbols-outlined text-moss-green text-3xl" data-icon="my_location" data-weight="fill">my_location</span>
                          </div>
                          <div class="absolute inset-0 pointer-events-none border-4 border-paper-white/50 m-2 rounded-sm"></div>
                        </div>
                        <div class="flex-1 flex flex-col">
                          <div class="flex justify-between items-start mb-6">
                            <div>
                              <span class="font-label-caps text-label-caps text-on-surface-variant mb-1">ORDER #${order.id}</span>
                              <h4 class="font-headline-md text-deep-espresso">${order.customerName || 'Guest'}</h4>
                              <p class="font-body-md text-on-surface-variant">${order.address || 'Cafe Pickup'}</p>
                            </div>
                            <div class="text-right flex flex-col items-end">
                              <span class="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Total Amount</span>
                              <div class="flex items-center gap-2">
                                <span class="font-headline-md text-moss-green text-3xl">${formatIDR(order.totalPrice)}</span>
                              </div>
                            </div>
                          </div>
                          <div class="sela-line mb-8"></div>
                          <div class="grid grid-cols-2 gap-8 mb-10">
                            <div class="flex items-start gap-4">
                              <div class="w-10 h-10 rounded-full bg-heritage-cream flex items-center justify-center text-deep-espresso shrink-0">
                                <span class="material-symbols-outlined" data-icon="call">call</span>
                              </div>
                              <div>
                                <p class="font-label-caps text-[10px] text-on-surface-variant">Customer Phone</p>
                                <p class="font-body-md text-deep-espresso font-semibold">${order.customerPhone || '-'}</p>
                              </div>
                            </div>
                            <div class="flex items-start gap-4">
                              <div class="w-10 h-10 rounded-full bg-heritage-cream flex items-center justify-center text-deep-espresso shrink-0">
                                <span class="material-symbols-outlined" data-icon="chat_bubble">chat_bubble</span>
                              </div>
                              <div>
                                <p class="font-label-caps text-[10px] text-on-surface-variant">Items</p>
                                <p class="font-body-md text-deep-espresso italic">${itemsSummary}</p>
                              </div>
                            </div>
                          </div>
                          <div class="flex gap-4">
                            <a href="tel:${order.customerPhone || ''}" class="flex-1 py-4 border border-deep-espresso text-deep-espresso font-label-caps text-label-md tracking-widest active:scale-95 transition-all hover:bg-heritage-cream text-center flex items-center justify-center">
                              Call Customer
                            </a>
                            <button onclick="completeDelivery(${order.id})" class="flex-1 py-4 bg-deep-espresso text-paper-white font-label-caps text-label-md tracking-widest active:scale-95 transition-transform hover:bg-primary-container shadow-sm">
                              Complete Delivery
                            </button>
                          </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

async function pickUpOrder(orderId) {
    try {
        const res = await window.apiFetch(`/api/orders/updateStatus/${orderId}?status=ON_DELIVERY`, {
            method: 'PUT',
            headers: { 'X-Role': CURRENT_ROLE }
        });
        const data = await res.json();
        if (res.ok && data.success) {
            window.showToast('Order picked up and is in transit!', 'success');
            fetchCourierOrders();
        } else {
            window.showToast(data.message || 'Failed to pick up order.', 'error');
        }
    } catch (err) {
        console.error('Error picking up order:', err);
        window.showToast('Network error.', 'error');
    }
}

async function completeDelivery(orderId) {
    try {
        const res = await window.apiFetch(`/api/orders/updateStatus/${orderId}?status=COMPLETED`, {
            method: 'PUT',
            headers: { 'X-Role': CURRENT_ROLE }
        });
        const data = await res.json();
        if (res.ok && data.success) {
            window.showToast('Delivery completed successfully!', 'success');
            fetchCourierOrders();
        } else {
            window.showToast(data.message || 'Failed to complete delivery.', 'error');
        }
    } catch (err) {
        console.error('Error completing delivery:', err);
        window.showToast('Network error.', 'error');
    }
}

function formatIDR(amount) {
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
}