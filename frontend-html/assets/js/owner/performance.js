// performance.js

// Check Owner Authentication
if (typeof window.checkOwnerAuth === 'function') {
    window.checkOwnerAuth();
}

// --- 1. MOCK DATABASE FETCH ---
// Fungsi ini mensimulasikan pemanggilan data dari API Backend.
async function fetchPerformanceData() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                metrics: {
                    prep: { 
                        value: 4.2, 
                        trend: "12% faster than last week", 
                        icon: "trending_down", 
                        colorClass: "text-moss-green", 
                        barWidth: "75%" 
                    },
                    delivery: { 
                        value: 18.5, 
                        trend: "4% slower than last week", 
                        icon: "trending_up", 
                        colorClass: "text-error", 
                        barWidth: "66%" 
                    },
                    turnover: { 
                        value: 52, 
                        trend: "Optimized occupancy", 
                        icon: "check_circle", 
                        colorClass: "text-moss-green", 
                        barWidth: "85%" 
                    }
                },
                salesChart: {
                    pathD: "M0,180 Q100,160 200,120 T400,100 T600,60 T800,80 T1000,30",
                    points: [
                        { cx: 200, cy: 120 },
                        { cx: 600, cy: 60 },
                        { cx: 1000, cy: 30 }
                    ]
                },
                heatmap: [
                    'bg-heritage-cream', 'bg-heritage-cream/50', 'bg-deep-espresso/20', 
                    'bg-deep-espresso/40', 'bg-deep-espresso/70', 'bg-deep-espresso',
                    'bg-deep-espresso/10', 'bg-deep-espresso/30', 'bg-deep-espresso/80',
                    'bg-deep-espresso/60', 'bg-deep-espresso/20', 'bg-heritage-cream',
                    'bg-deep-espresso/40', 'bg-deep-espresso/90', 'bg-deep-espresso',
                    'bg-deep-espresso/80', 'bg-deep-espresso/30', 'bg-deep-espresso/10',
                    'bg-heritage-cream', 'bg-deep-espresso/10', 'bg-deep-espresso/40',
                    'bg-deep-espresso/60', 'bg-deep-espresso/20', 'bg-heritage-cream'
                ],
                staff: [
                    {
                        id: 1, name: "Julianna Vercetti", role: "Master Barista", rating: 4.9, completion: 3.8, status: "Peak Efficient",
                        statusClass: "bg-secondary-container text-on-secondary-container", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCdJqHcri-amX0Wmbz5tH9U3qvSrNltTVYrzxlPUF_Tu2QZfrO_TvsIACzJnc64S4kFXg3DFVBAaXib06gx3Eg4lj-ZyyCiIsbVNrIrUfak2MoOfa6KHVQh2H9f_fLND4SqAbWCdBt11zX-8tR4M8bHgCLwipbKOsYyfGAGzWFAMpdBq1eNzgRihDSlW8QNA_S-ftnXeQn013BnXz7bOTJXVmKcB6D_kahd5nrBml4rNnPFFSXfAMLXTbqQiFxdINo4UI1vk3l-o_D", badgeClass: "bg-moss-green text-white"
                    },
                    {
                        id: 2, name: "Marco Rossi", role: "Lead Courier", rating: 4.8, completion: 16.2, status: "Steady",
                        statusClass: "bg-surface-container-highest text-outline", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBmMdt8D2jdGKFyp7lW1zZo2WKfL4j39LSiG7buUHdEW6r1RlbCtnDMm4GmCdFgMrKRm4C-GoLo0ouWx8pOHE0ui1xs1tFF_AYcaNeZ6UkCpEXYGYpwdnljGLnHLQa67CoecQiPMD1gVO_vV6yAEBQ9xmMbLzsrZ702PQccmxOfbdw4K-z8gPYNa-03UuIsE-jC3kuFX82k4GbSQakrxlCzgltQs1fDhBBgHunTO41GFnNQUOmAo1IwPdZG6SWnmfw_HJvN8VdRzyw", badgeClass: "bg-outline text-white"
                    },
                    {
                        id: 3, name: "Elena Thorne", role: "Artisan Barista", rating: 4.7, completion: 4.1, status: "Steady",
                        statusClass: "bg-surface-container-highest text-outline", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoWCmkqODPqWitrgvieSSf7B6meDq0wpy0DwJUeYrzUK-_0XC6wHfooo6JEm0kDKW7Lp0Kj0VRSaSUXXd7fZsdWqVHxVE2eOocKedBG9tMoUqOVh-73Z4M1ur8xzfoseF5PAFFT5fpq9cmIP69mHHD_8-ueRsx93bOfEtfmTG9yBqnt2i6preWxoABsC9sd2SXrmmujOJBc3ha2XJAMZTaFSWsxcfeUAP_FN73gT1EIHVaTj8vhLlHOWif6FtlK1dYZPb3ekcyHjEh", badgeClass: "bg-outline text-white"
                    }
                ],
                lastSync: "Data synchronized 2 minutes ago."
            });
        }, 500); // Simulasi waktu loading jaringan
    });
}

// --- 2. LOGIKA RENDER TAMPILAN ---
async function renderPerformanceDashboard() {
    try {
        const data = await fetchPerformanceData();

        // A. Inject Efficiency Metrics
        const metricsMap = {
            'prep': data.metrics.prep,
            'delivery': data.metrics.delivery,
            'turnover': data.metrics.turnover
        };

        for (const [key, item] of Object.entries(metricsMap)) {
            document.getElementById(`val-${key}`).innerText = item.value;
            document.getElementById(`text-${key}`).innerText = item.trend;
            document.getElementById(`icon-${key}`).innerText = item.icon;
            
            const trendContainer = document.getElementById(`trend-${key}-container`);
            trendContainer.className = `font-label-md text-label-md flex items-center gap-1 ${item.colorClass}`;
            
            // Set lebar progress bar (setTimeout untuk trigger transisi CSS)
            setTimeout(() => {
                document.getElementById(`bar-${key}`).style.width = item.barWidth;
            }, 100);
        }

        // B. Inject Sales Velocity Chart
        document.getElementById('sales-chart-path').setAttribute('d', data.salesChart.pathD);
        const chartContainer = document.getElementById('chart-data-container');
        // Bersihkan circle lama jika ada
        chartContainer.querySelectorAll('circle').forEach(c => c.remove());
        data.salesChart.points.forEach(point => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.cx);
            circle.setAttribute('cy', point.cy);
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', '#2A1B0E');
            chartContainer.appendChild(circle);
        });

        // C. Inject Heatmap
        const heatmapContainer = document.getElementById('heatmap-container');
        heatmapContainer.innerHTML = data.heatmap.map((colorClass, i) => `
            <div class="h-10 w-full ${colorClass} heatmap-cell rounded-sm" title="Hour ${i + 7}:00"></div>
        `).join('');

        // Inisialisasi event listener interaksi Heatmap
        document.querySelectorAll('.heatmap-cell').forEach(cell => {
            cell.addEventListener('mouseover', () => cell.classList.add('ring-1', 'ring-deep-espresso'));
            cell.addEventListener('mouseout', () => cell.classList.remove('ring-1', 'ring-deep-espresso'));
        });

        // D. Inject Staff Resonance List
        const staffContainer = document.getElementById('staff-list-container');
        staffContainer.innerHTML = data.staff.map(person => `
            <div class="p-6 flex flex-col md:flex-row items-center gap-8 staff-row hover:bg-heritage-cream/10 transition-colors cursor-pointer">
                <div class="relative">
                    <div class="w-16 h-16 rounded-full border border-outline-muted overflow-hidden">
                        <img class="w-full h-full object-cover" src="${person.img}"/>
                    </div>
                    <span class="absolute -bottom-1 -right-1 ${person.badgeClass} w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold">${person.id}</span>
                </div>
                <div class="flex-1">
                    <h5 class="font-body-lg text-body-lg text-deep-espresso font-semibold">${person.name}</h5>
                    <p class="font-label-md text-label-md text-outline">${person.role}</p>
                </div>
                <div class="flex gap-12">
                    <div class="text-center">
                        <p class="font-label-caps text-label-caps text-outline mb-1">RATING</p>
                        <div class="flex items-center text-primary">
                            <span class="font-body-lg text-body-lg font-bold">${person.rating}</span>
                            <span class="material-symbols-outlined text-sm ml-1" style="font-variation-settings: 'FILL' 1;">star</span>
                        </div>
                    </div>
                    <div class="text-center">
                        <p class="font-label-caps text-label-caps text-outline mb-1">COMPLETION</p>
                        <p class="font-body-lg text-body-lg text-deep-espresso font-bold">${person.completion}<span class="text-xs ml-0.5">min</span></p>
                    </div>
                    <div class="text-right hidden lg:block">
                        <p class="font-label-caps text-label-caps text-outline mb-1">STATUS</p>
                        <span class="px-3 py-1 ${person.statusClass} font-label-caps text-label-caps rounded-full">${person.status}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Inisialisasi event listener interaksi row Staff
        document.querySelectorAll('.staff-row').forEach(item => {
            item.addEventListener('mouseenter', () => item.style.transform = 'translateY(-2px)');
            item.addEventListener('mouseleave', () => item.style.transform = 'translateY(0px)');
        });

        // E. Update Footer Sync Time
        document.getElementById('last-sync-time').innerText = data.lastSync;

    } catch (error) {
        console.error("Gagal memuat data Performance Dashboard:", error);
    }
}

// Jalankan saat HTML sudah siap
document.addEventListener("DOMContentLoaded", renderPerformanceDashboard);