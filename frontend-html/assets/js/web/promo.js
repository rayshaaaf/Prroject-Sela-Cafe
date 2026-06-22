/**
 * Sela Cafe — Promo Integration
 * Fetches promotions dynamically from backend database via `/api/promos/getAll`.
 */

document.addEventListener('DOMContentLoaded', () => {
    const promosContainer = document.getElementById('promos-container');
    if (promosContainer) {
        initPromos(promosContainer);
    }
});

async function initPromos(container) {
    let promos = [];
    try {
        const response = await window.apiFetch('/api/promos/getAll');
        if (response.ok) {
            const apiRes = await response.json();
            promos = apiRes.data || [];
        } else {
            console.error('Failed to fetch promos. Status:', response.status);
        }
    } catch (e) {
        console.error('Error fetching promos from API:', e);
    }

    renderPromos(container, promos);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
        return dateStr;
    }
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    // Format "HH:mm:ss" or "HH:mm" to "HH:mm"
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
}

function renderPromos(container, promos) {
    container.innerHTML = '';
    
    // Filter active promos on the frontend in case API returns inactive ones
    const activePromos = promos.filter(p => p.isActive !== false);

    if (activePromos.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-20 text-on-surface-variant font-label-caps tracking-wider opacity-60">
                No active promotions available at this time.
            </div>
        `;
        return;
    }

    activePromos.forEach(promo => {
        const title = promo.titleEn || promo.titleId || 'Special Offer';
        const desc = promo.descriptionEn || promo.descriptionId || 'No description available.';
        const tag = promo.discountPct ? `${promo.discountPct}% OFF` : 'SAVINGS';
        const codeText = promo.promoCode ? `Use Code: ${promo.promoCode}` : 'Limited Availability';
        const img = promo.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFZUxVsxmPHxvqQofCogiSq3R662JeZorPbxFEHxmb1KpAPE0srY4cvlp3tflWRo3HapYMCLy8poKumcjopJKwEXM3tr7BX4x9dYi-s8CN6rsP73wbI2p5vms3-n0ylkCoqEY8DRGHdmjBm22hcr5wppWtnA33vY3JE6Y9zBAChQUd0i8JG5viQncfCkO1bOEu_Ry0MAkB8uKkN8wU3ECu_JX1xoQxRHLC1_wIvxBdxqUz3c0JbSfeFm3ft7617F-I_H93zPFkQn2y';

        // Format active period including start/end times
        let periodText = '';
        const startD = formatDate(promo.startDate);
        const endD = formatDate(promo.endDate);
        const startT = formatTime(promo.startTime);
        const endT = formatTime(promo.endTime);

        if (startD && endD) {
            periodText = `${startD} — ${endD}`;
        } else if (startD) {
            periodText = `From ${startD}`;
        } else if (endD) {
            periodText = `Until ${endD}`;
        }

        if (startT && endT) {
            periodText += ` (${startT} — ${endT})`;
        } else if (startT) {
            periodText += ` (Starts ${startT})`;
        }

        const card = document.createElement('div');
        card.className = 'group border border-outline/10 bg-paper-white overflow-hidden transition-all duration-500 hover:border-outline/30';
        card.style.transform = 'translateY(0)';
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });

        card.innerHTML = `
            <div class="relative h-64 overflow-hidden">
                <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="${img}" alt="${title}"/>
                <div class="absolute top-4 left-4 px-3 py-1 bg-moss-green text-paper-white font-label-caps text-[10px] tracking-widest">${tag}</div>
            </div>
            <div class="p-8">
                <span class="font-label-caps text-[11px] text-on-surface-variant opacity-60 mb-2 block uppercase tracking-widest">${codeText}</span>
                <h3 class="font-headline-md text-headline-md text-deep-espresso mb-4">${title}</h3>
                <p class="font-body-md text-on-surface-variant mb-6 line-clamp-2">${desc}</p>
                ${periodText ? `
                <div class="flex items-center gap-2 text-on-surface-variant opacity-70 mb-8 text-[11px] font-label-caps tracking-wide">
                    <span class="material-symbols-outlined text-[14px]">schedule</span>
                    <span>${periodText}</span>
                </div>
                ` : ''}
                <button onclick="window.showToast('Promo Code Copied: ${promo.promoCode || 'SELA'}', 'success'); navigator.clipboard.writeText('${promo.promoCode || ''}')" class="w-full border border-deep-espresso text-deep-espresso py-4 font-label-caps text-xs tracking-widest hover:bg-deep-espresso hover:text-paper-white transition-all pressed-state">CLAIM OFFER</button>
            </div>
        `;
        container.appendChild(card);
    });
}
