// Konfigurasi API Base URL
const API_BASE_URL = '/api/orders';

// Sesuaikan ROLE menjadi KITCHEN sesuai instruksi
const CURRENT_USER_ID = 101; 
const CURRENT_USER_ROLE = 'KITCHEN';

document.addEventListener('DOMContentLoaded', () => {
    // Jalankan fungsi load data saat halaman siap
    initKitchenDashboard();

    // Refresh data otomatis setiap 30 detik agar antrean dapur tetap update
    setInterval(initKitchenDashboard, 30000);
});

/**
 * Fungsi Utama untuk Mengambil dan Menampilkan Data Dapur
 */
async function initKitchenDashboard() {
    try {
        // Parallel Fetch: Mengambil semua order untuk revenue & order spesifik kitchen
        const [allOrdersRes, kitchenOrdersRes] = await Promise.all([
            window.apiFetch(`${API_BASE_URL}/getAll`).then(res => res.json()),
            window.apiFetch(`${API_BASE_URL}/kitchen`).then(res => res.json())
        ]);

        if (allOrdersRes.success && kitchenOrdersRes.success) {
            updateHighLevelMetrics(allOrdersRes.data);
            updateKitchenFlow(kitchenOrdersRes.data); // Data khusus antrean dapur
            updateSignaturePerformance(allOrdersRes.data);
        }
    } catch (error) {
        console.error('Gagal memuat data kitchen dashboard:', error);
    }
}

/**
 * 1. Update Metrics Atas (Revenue & Ringkasan)
 */
function updateHighLevelMetrics(orders) {
    const revenueElement = document.querySelector('#high-level-metrics .font-headline-md');
    // Using price or totalAmount or totalPrice depending on actual object field
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || 0), 0);
    
    if (revenueElement) {
        revenueElement.textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
    }
}

/**
 * 2. Update Status Antrean Dapur (Kitchen Flow)
 * Menggunakan data dari endpoint /api/orders/kitchen
 */
function updateKitchenFlow(kitchenOrders) {
    const kitchenCountElement = document.querySelector('#operational-stillness .font-headline-xl');
    
    if (kitchenCountElement) {
        // Menampilkan jumlah pesanan aktif yang harus dikerjakan oleh kitchen saat ini
        kitchenCountElement.textContent = kitchenOrders.length;
    }
}

/**
 * 3. Update Daftar Produk (Signature Performance)
 */
function updateSignaturePerformance(orders) {
    const productCounts = {};
    
    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const name = item.productName || item.name;
                if (name) {
                    productCounts[name] = (productCounts[name] || 0) + (item.quantity || 1);
                }
            });
        }
    });

    const productElements = document.querySelectorAll('#daily-pulse .flex-1.border-b');
    
    productElements.forEach(element => {
        const productName = element.querySelector('.font-semibold')?.textContent;
        const cupsSpan = element.querySelector('.font-label-md');
        
        if (productName && cupsSpan && productCounts[productName]) {
            cupsSpan.textContent = `${productCounts[productName]} cups`;
        }
    });
}

/**
 * Fungsi Aksi Kitchen: Mengubah status pesanan (misal dari PREPARING ke READY_FOR_PICKUP)
 * Dipicu saat chef/staf dapur menyelesaikan pesanan
 */
async function handleKitchenStatusUpdate(orderId, nextStatus) {
    try {
        // Mengirimkan X-Role: KITCHEN ke backend melalui Header
        const response = await window.apiFetch(`${API_BASE_URL}/updateStatus/${orderId}?status=${nextStatus}`, {
            method: 'PUT',
            headers: {
                'X-Role': CURRENT_USER_ROLE
            }
        });
        const result = await response.json();
        
        if (result.success) {
            console.log(`Order ${orderId} berhasil diupdate ke status: ${nextStatus}`);
            initKitchenDashboard(); // Refresh data antrean terbaru
        }
    } catch (error) {
        console.error('Kitchen gagal memperbarui status order:', error);
    }
}