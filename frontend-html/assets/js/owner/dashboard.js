// dashboard.js

// Micro-interactions for hovering cards
function initCardEffects() {
    document.querySelectorAll('.bg-white.border-outline-muted').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 4px 12px rgba(42, 27, 14, 0.05)';
            card.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });
    });
}

// Helper untuk memformat angka ke Rupiah
const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(value);
};

// --- DOCK INTEGRASI BACKEND ---
// Fungsi ini mensimulasikan pemanggilan API (Async Fetch).
// Jika nanti sudah memiliki endpoint backend asli, ganti bagian dalam fungsi ini dengan:
// const res = await fetch('http://localhost:3000/api/owner/dashboard'); 
// return await res.json();
async function fetchDashboardData() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                todayRevenue: 12450000,
                todayRevenueChange: "+12.4%",
                weeklyRevenue: 84120000,
                weeklyRevenueChange: "+8.2%",
                monthlyTarget: "Rp 340.0M",
                monthlyGoalProgress: "72% Goal",
                totalOrders: 482,
                ordersStatusText: "Excellent",
                
                pulse: {
                    waitingPayment: 12,
                    paid: 8,
                    preparing: 5,
                    ready: 3,
                    onDelivery: 9,
                    completed: 442,
                    cancelled: 3
                },
                
                favorites: [
                    { name: "Heirloom Espresso Blend", type: "Signature Roast", units: "142 Units", revShare: "28% Revenue", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1rsVbtsM_wea6yMb8514a4PoyjlgHcYG0CePCKjhUZvkyDtFu5GGB10dEX6oiwz2aafmgGFJSQY-TDFOX6_o4JLELu6euizUVUFVlAbyEX57kernDCBGnt43-bFZSfXcwIrd0kd9xMUJ0VKCSa8bQjueQpqraa-ZpgnCbhF8x0PrIEbIxtGt7FF8J9dd-i6YTu0x7awGG-HAglbVNo1n03qUVDcxeW0r0ejBPqTD1RT3axzU4Syy5Fqr92g6JtNimowih9MKct2l6" },
                    { name: "Butter Flake Croissant", type: "Bakery Collection", units: "98 Units", revShare: "18% Revenue", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKYtXHu15zVPStrne7FamSHPMbf9hkW7gZrflftdI1JrnSXy4LCMfwIrCASvsmCve5Xl-hNudpup8BY_KIiq_S5X7I6VlnqsVkOlbG3kdDhyZ3vsai8uX5rAdCvIAWg77SXEnpHClTP-hIWFRtCv_WCzLt4GpcG6085iQbKBBLJnsC_I4oo6limwBu9_c6JPY0OEkaIpB1XcPib6nYtYbCj_8dHHL1eQqhdUgp1_98_i12EVKahi2tGtIgEqqTqMOjhbvGM204D7Bw" },
                    { name: "Ceremonial Matcha", type: "Wellness Selection", units: "64 Units", revShare: "12% Revenue", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsg7H5gf6GmtfrP-Sc4Uo-uUcA8ZNJtrkFc5MAmQfTwRjJVbzklYC8VmtvortEl3dy7xvhNR9od32qE-y3-trYGvAjaznh8PCJZP9KB0DhdxQAO1QUZijB1BciEc3HoW7MtIkKsdgx4Q_4BO_OsxL2ijIRNhqMaCcePAduq94C7O1HMyjm9dmvUb2HRVUUHA4dwzoIJmaJnKDyCE80y07gljTIlxMMEKeYPxxBWoK2E_ZToCWVUHtP39g2BV3XyH2Tgvbe_aYKd-fJ" }
                ],
                
                summary: {
                    peak: "09:30 AM",
                    avgValue: 158000,
                    fulfillment: "98.4%"
                },
                
                logistics: {
                    kitchen: "342 Prepared",
                    courier: "86 Deliveries",
                    cashierValidated: 12400000
                },
                
                talent: {
                    applicants: "142 Total",
                    applicantsGrowth: "+12 New this week",
                    pipeline: "28 Under Review",
                    onboarding: "4 In Progress"
                },
                
                reports: [
                    { title: "Daily Revenue Ledger", desc: "Sent to Executive Board", status: "SENT TODAY", badgeStyle: "bg-moss-green/10 text-moss-green" },
                    { title: "Inventory & Sourcing Report", desc: "Weekly logistics summary", status: "LAST SENT: OCT 24", badgeStyle: "bg-outline-muted/10 text-on-surface-variant" },
                    { title: "Employee Performance Matrix", desc: "Bi-weekly personnel audit", status: "LAST SENT: OCT 21", badgeStyle: "bg-outline-muted/10 text-on-surface-variant" }
                ],
                
                timeline: [
                    { title: "Order #123 Paid Successfully", desc: "via BCA Virtual Account • 2 mins ago", type: "active" },
                    { title: "Order #120 Completed", desc: "Handed to GrabExpress Courier • 12 mins ago", type: "muted" },
                    { title: "Kitchen Stock Warning: Arabica Gayo", desc: "Critical level reached ( < 2kg ) • 45 mins ago", type: "muted" }
                ]
            });
        }, 400); // Simulasi delay jaringan
    });
}

// Fungsi utama untuk merender data ke komponen HTML
async function refreshDashboardMetrics() {
    try {
        console.log('Refreshing dashboard metrics...');
        const data = await fetchDashboardData();

        // 1. Business Health
        document.getElementById('today-revenue').innerText = formatRupiah(data.todayRevenue);
        document.getElementById('today-revenue-change').innerText = data.todayRevenueChange;
        document.getElementById('weekly-revenue').innerText = formatRupiah(data.weeklyRevenue);
        document.getElementById('weekly-revenue-change').innerText = data.weeklyRevenueChange;
        document.getElementById('monthly-target').innerText = data.monthlyTarget;
        document.getElementById('monthly-goal').innerText = data.monthlyGoalProgress;
        document.getElementById('total-orders').innerText = data.totalOrders;
        document.getElementById('orders-status').innerText = data.ordersStatusText;

        // 2. Operational Pulse
        document.getElementById('pulse-waiting-payment').innerText = String(data.pulse.waitingPayment).padStart(2, '0');
        document.getElementById('pulse-paid').innerText = String(data.pulse.paid).padStart(2, '0');
        document.getElementById('pulse-preparing').innerText = String(data.pulse.preparing).padStart(2, '0');
        document.getElementById('pulse-ready').innerText = String(data.pulse.ready).padStart(2, '0');
        document.getElementById('pulse-on-delivery').innerText = String(data.pulse.onDelivery).padStart(2, '0');
        document.getElementById('pulse-completed').innerText = String(data.pulse.completed).padStart(2, '0');
        document.getElementById('pulse-cancelled').innerText = String(data.pulse.cancelled).padStart(2, '0');

        // 3. Artisanal Favorites
        const favContainer = document.getElementById('favorites-container');
        favContainer.innerHTML = data.favorites.map((item, index) => `
            ${index > 0 ? '<div class="sela-line opacity-30 my-6"></div>' : ''}
            <div class="flex items-center gap-6">
                <div class="w-16 h-16 bg-surface-container overflow-hidden">
                    <img class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src="${item.img}">
                </div>
                <div class="flex-1">
                    <p class="font-body-lg font-bold">${item.name}</p>
                    <p class="text-sm text-on-surface-variant">${item.type}</p>
                </div>
                <div class="text-right">
                    <p class="font-label-md">${item.units}</p>
                    <p class="text-xs text-on-surface-variant font-label-caps">${item.revShare}</p>
                </div>
            </div>
        `).join('');

        // 4. Executive Summary
        document.getElementById('summary-peak').innerText = data.summary.peak;
        document.getElementById('summary-avg-value').innerText = formatRupiah(data.summary.avgValue);
        document.getElementById('summary-fulfillment').innerText = data.summary.fulfillment;

        // 5. Logistics & Team
        document.getElementById('pulse-kitchen').innerText = data.logistics.kitchen;
        document.getElementById('pulse-courier').innerText = data.logistics.courier;
        document.getElementById('pulse-cashier').innerText = data.logistics.cashierValidated ? `${formatRupiah(data.logistics.cashierValidated / 1000000)}M Validated` : 'Rp 0 Validated';

        // 6. Talent & Growth
        document.getElementById('talent-applicants').innerText = data.talent.applicants;
        document.getElementById('talent-applicants-growth').innerText = data.talent.applicantsGrowth;
        document.getElementById('talent-pipeline').innerText = data.talent.pipeline;
        document.getElementById('talent-onboarding').innerText = data.talent.onboarding;

        // 7. Automated Report Registry
        const reportsContainer = document.getElementById('reports-container');
        reportsContainer.innerHTML = data.reports.map(rep => `
            <div class="p-4 bg-white flex justify-between items-center">
                <div>
                    <p class="font-label-md font-bold text-deep-espresso">${rep.title}</p>
                    <p class="text-xs text-on-surface-variant">${rep.desc}</p>
                </div>
                <span class="${rep.badgeStyle} px-3 py-1 font-label-caps text-[10px]">${rep.status}</span>
            </div>
        `).join('');

        // 8. The Ritual Timeline
        const timelineContainer = document.getElementById('timeline-container');
        timelineContainer.innerHTML = data.timeline.map(time => `
            <div class="relative">
                <div class="absolute -left-[30px] top-1.5 w-[22px] h-[22px] rounded-full ${time.type === 'active' ? 'bg-deep-espresso' : 'bg-outline'} border-4 border-paper-white"></div>
                <p class="font-label-md font-bold">${time.title}</p>
                <p class="text-xs text-on-surface-variant">${time.desc}</p>
            </div>
        `).join('');

        // Re-inisialisasi efek hover karena item favorites didistribusikan ulang via innerHTML
        initCardEffects();

    } catch (error) {
        console.error("Gagal memperbarui data dashboard:", error);
    }
}

// Jalankan saat pertama kali halaman di-load
document.addEventListener("DOMContentLoaded", () => {
    refreshDashboardMetrics();
    // Jalankan auto-refresh setiap 30 detik sesuai keterangan UI
    setInterval(refreshDashboardMetrics, 30000);
});