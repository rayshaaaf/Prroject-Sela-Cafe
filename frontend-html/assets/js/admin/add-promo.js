/**
 * Sela Cafe - Add Promo Logistics Script
 */

document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof window.checkAdminAuth === 'function') {
            window.checkAdminAuth();
        }
    } catch (authError) {
        console.warn("Auth check deferred:", authError);
    }

    initAddPromoForm();
});

function initAddPromoForm() {
    const form = document.getElementById('add-promo-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        const titleId = formData.get('titleId')?.trim();
        const titleEn = formData.get('titleEn')?.trim();
        const promoCode = formData.get('promoCode')?.toUpperCase()?.trim();
        const discountPctVal = formData.get('discountPct');

        if (!titleId || titleId.length < 3) {
            if (typeof window.showToast === 'function') {
                window.showToast("Title (ID) must be at least 3 characters.", "error");
            }
            return;
        }
        if (!titleEn || titleEn.length < 3) {
            if (typeof window.showToast === 'function') {
                window.showToast("Title (EN) must be at least 3 characters.", "error");
            }
            return;
        }
        if (!promoCode || !/^[A-Z0-9]{3,15}$/.test(promoCode)) {
            if (typeof window.showToast === 'function') {
                window.showToast("Promo Code must be alphanumeric and between 3 and 15 characters.", "error");
            }
            return;
        }
        const discountPct = parseInt(discountPctVal);
        if (isNaN(discountPct) || discountPct < 1 || discountPct > 100) {
            if (typeof window.showToast === 'function') {
                window.showToast("Discount Percentage must be a number between 1 and 100.", "error");
            }
            return;
        }

        const startDate = formData.get('startDate');
        const endDate = formData.get('endDate');

        if (new Date(startDate) > new Date(endDate)) {
            if (typeof window.showToast === 'function') {
                window.showToast("Start date must be before or equal to End date.", "error");
            }
            return;
        }

        // Format times into HH:mm:ss for Spring LocalTime deserializer
        let startTimeStr = formData.get('startTime') || '00:00';
        if (startTimeStr.split(':').length === 2) startTimeStr += ':00';
        
        let endTimeStr = formData.get('endTime') || '23:59';
        if (endTimeStr.split(':').length === 2) endTimeStr += ':00';

        const promoPayload = {
            titleId: titleId,
            titleEn: titleEn,
            promoCode: promoCode,
            discountPct: discountPct,
            startDate: startDate,
            endDate: endDate,
            startTime: startTimeStr,
            endTime: endTimeStr,
            descriptionId: formData.get('descriptionId')?.trim() || '',
            descriptionEn: formData.get('descriptionEn')?.trim() || '',
            imageUrl: formData.get('imageUrl')?.trim() || 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=600',
            isActive: true
        };

        try {
            const response = await window.apiFetch('/api/promos/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promoPayload)
            });

            if (response.ok) {
                if (typeof window.showToast === 'function') {
                    window.showToast('Promotional code curation successfully generated.', 'success');
                }
                setTimeout(() => {
                    window.location.href = 'manage-promo.html';
                }, 1200);
            } else {
                const errData = await response.json().catch(() => ({}));
                if (typeof window.showToast === 'function') {
                    window.showToast(errData.message || 'Failed to create promo.', 'error');
                }
            }
        } catch (err) {
            console.error('Operational drop while trying to create promo.', err);
            if (typeof window.showToast === 'function') {
                window.showToast('Unable to connect to server. Please try again.', 'error');
            }
        }
    });
}
