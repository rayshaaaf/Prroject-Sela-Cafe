/**
 * Sela Cafe - Edit Promo Logistics Script
 */

let promoId = null;

document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof window.checkAdminAuth === 'function') {
            window.checkAdminAuth();
        }
    } catch (authError) {
        console.warn("Auth check deferred:", authError);
    }

    const urlParams = new URLSearchParams(window.location.search);
    promoId = urlParams.get('id');

    if (!promoId) {
        if (typeof window.showToast === 'function') {
            window.showToast("No promo identifier provided.", "error");
        }
        setTimeout(() => window.location.href = 'manage-promo.html', 1500);
        return;
    }

    initEditPromoForm();
});

async function initEditPromoForm() {
    const form = document.getElementById('edit-promo-form');
    if (!form) return;

    // Helper to format Time (HH:mm:ss or HH:mm) into HH:mm for <input type="time">
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        return timeStr.slice(0, 5); // Grabs "HH:mm"
    };

    // Load existing promo details
    try {
        const response = await window.apiFetch(`/api/promos/getById/${promoId}`);
        if (response.ok) {
            const apiRes = await response.json();
            const promo = apiRes.data;
            if (promo) {
                document.getElementById('promo-title-id').value = promo.titleId || '';
                document.getElementById('promo-title-en').value = promo.titleEn || '';
                document.getElementById('promo-code').value = promo.promoCode || '';
                document.getElementById('promo-discount').value = promo.discountPct || 0;
                document.getElementById('promo-start-date').value = promo.startDate || '';
                document.getElementById('promo-end-date').value = promo.endDate || '';
                document.getElementById('promo-start-time').value = formatTime(promo.startTime) || '00:00';
                document.getElementById('promo-end-time').value = formatTime(promo.endTime) || '23:59';
                document.getElementById('promo-desc-id').value = promo.descriptionId || '';
                document.getElementById('promo-desc-en').value = promo.descriptionEn || '';
                document.getElementById('promo-image').value = promo.imageUrl || '';
            }
        } else {
            if (typeof window.showToast === 'function') {
                window.showToast("Promo not found.", "error");
            }
            setTimeout(() => window.location.href = 'manage-promo.html', 1500);
        }
    } catch (err) {
        console.error("Error loading promo data:", err);
    }

    // Submit edits
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
            imageUrl: formData.get('imageUrl')?.trim() || 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=400',
            isActive: true
        };

        try {
            const response = await window.apiFetch(`/api/promos/update/${promoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promoPayload)
            });

            if (response.ok) {
                if (typeof window.showToast === 'function') {
                    window.showToast('Promotional curation successfully updated.', 'success');
                }
                setTimeout(() => {
                    window.location.href = 'manage-promo.html';
                }, 1200);
            } else {
                const errData = await response.json().catch(() => ({}));
                if (typeof window.showToast === 'function') {
                    window.showToast(errData.message || 'Failed to update promo.', 'error');
                }
            }
        } catch (err) {
            console.error('Operational drop while trying to update promo.', err);
            if (typeof window.showToast === 'function') {
                window.showToast('Unable to connect to server. Please try again.', 'error');
            }
        }
    });
}
