/**
 * Sela Cafe — Customer Reviews Script
 * Handles CRUD operations for reviews.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!window.isAuthenticated()) {
        window.location.href = '../web/login.html?redirect=../customer/reviews.html';
        return;
    }
    initReviewsPage();
});

let userReviews = [];
let menuCatalog = [];
let activeRating = 5;

async function initReviewsPage() {
    setupStarRating();
    setupFormSubmit();
    await loadReviewsData();
}

function setupStarRating() {
    const container = document.getElementById('rating-stars-container');
    if (!container) return;

    const stars = container.querySelectorAll('button');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            activeRating = index + 1;
            document.getElementById('review-rating-value').value = activeRating;
            updateStarUI(activeRating);
        });
    });
}

function updateStarUI(rating) {
    const container = document.getElementById('rating-stars-container');
    if (!container) return;
    const stars = container.querySelectorAll('button');
    stars.forEach((s, i) => {
        if (i < rating) {
            s.classList.add('star-filled');
            s.classList.remove('text-outline-variant');
            s.classList.add('text-primary');
        } else {
            s.classList.remove('star-filled');
            s.classList.add('text-outline-variant');
            s.classList.remove('text-primary');
        }
    });
}

async function loadReviewsData() {
    const grid = document.getElementById('reviews-grid');
    const select = document.getElementById('review-menu-select');
    if (!grid) return;

    try {
        const [reviewsRes, menusRes] = await Promise.all([
            window.apiFetch('/api/reviews/my'),
            window.apiFetch('/api/menus/getAll')
        ]);

        if (reviewsRes.ok && menusRes.ok) {
            const reviewsData = await reviewsRes.json();
            const menusData = await menusRes.json();

            userReviews = reviewsData.data || [];
            menuCatalog = menusData.data || [];

            // 1. Populate Menu Select Dropdown in Modal
            if (select) {
                select.innerHTML = menuCatalog.map(menu => `
                    <option value="${menu.id}">${menu.nameId}</option>
                `).join('');
            }

            // 2. Render Review Cards
            if (userReviews.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-24 opacity-60">
                        <span class="material-symbols-outlined text-5xl mb-4 text-outline-muted">rate_review</span>
                        <p class="font-headline-md text-headline-md text-deep-espresso">No reviews written</p>
                        <p class="font-body-md text-on-surface-variant mt-2 max-w-xs mx-auto">Share your experience on Sela Cafe's hand-crafted menus and blends.</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = userReviews.map(review => {
                const menu = menuCatalog.find(m => m.id === review.menuId);
                const menuName = menu ? menu.nameId : (review.menuNameId || 'Specialty Coffee');
                const menuCategory = menu ? menu.categoryName : 'COFFEE';
                const menuImageUrl = menu ? menu.imageUrl : 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=600&auto=format&fit=crop';
                
                const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });

                return `
                    <div class="review-card bg-paper-white border border-outline-muted p-8 flex flex-col h-full hover:shadow-lg transition-all duration-300">
                        <div class="flex justify-between items-start mb-6">
                            <div class="flex items-center gap-4">
                                <div class="w-16 h-16 bg-surface-container overflow-hidden">
                                    <img class="w-full h-full object-cover grayscale-img" src="${menuImageUrl}" alt="${menuName}"/>
                                </div>
                                <div>
                                    <h3 class="font-headline-md text-headline-md text-deep-espresso leading-tight line-clamp-1">${menuName}</h3>
                                    <span class="font-label-caps text-[10px] text-on-surface-variant uppercase">${menuCategory}</span>
                                </div>
                            </div>
                            <div class="flex gap-0.5">
                                ${Array.from({ length: 5 }, (_, i) => `
                                    <span class="material-symbols-outlined text-primary text-[18px] ${i < review.rating ? 'star-filled' : 'text-outline-variant'}">star</span>
                                `).join('')}
                            </div>
                        </div>
                        <p class="font-body-md text-body-md text-on-surface-variant mb-8 flex-grow leading-relaxed italic">"${review.comment}"</p>
                        <div class="sela-line mb-6"></div>
                        <div class="flex justify-between items-center">
                            <span class="font-label-caps text-[11px] text-outline italic uppercase">${formattedDate}</span>
                            <div class="flex gap-4">
                                <button onclick="editReview(${review.id})" class="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[16px]">edit</span>
                                    <span class="font-label-caps text-[10px]">Edit</span>
                                </button>
                                <button onclick="deleteReview(${review.id})" class="text-on-surface-variant hover:text-error transition-colors flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[16px]">delete</span>
                                    <span class="font-label-caps text-[10px]">Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Grayscale image warm hover micro-interactions
            grid.querySelectorAll('.grayscale-img').forEach(img => {
                img.style.filter = 'grayscale(30%)';
                img.style.transition = 'filter 0.5s ease';
                img.parentElement.addEventListener('mouseenter', () => img.style.filter = 'grayscale(0%)');
                img.parentElement.addEventListener('mouseleave', () => img.style.filter = 'grayscale(30%)');
            });

        } else {
            grid.innerHTML = `<div class="col-span-full text-center py-16 text-error">Failed to load reviews.</div>`;
        }
    } catch (e) {
        console.error(e);
        grid.innerHTML = `<div class="col-span-full text-center py-16 text-error">Error connecting to server.</div>`;
    }
}

function setupFormSubmit() {
    const form = document.getElementById('review-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const reviewId = document.getElementById('edit-review-id').value;
        const menuId = document.getElementById('review-menu-select').value;
        const rating = document.getElementById('review-rating-value').value;
        const comment = document.getElementById('review-comment').value.trim();

        if (!menuId || !rating || !comment) {
            window.showToast('Please fill out all fields.', 'error');
            return;
        }

        const isEdit = !!reviewId;
        const url = isEdit ? `/api/reviews/update/${reviewId}` : '/api/reviews/create';
        const method = isEdit ? 'PUT' : 'POST';

        const payload = {
            rating: parseInt(rating, 10),
            comment: comment
        };
        if (!isEdit) {
            payload.menuId = parseInt(menuId, 10);
        }

        try {
            const res = await window.apiFetch(url, {
                method: method,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                window.showToast(isEdit ? 'Review updated.' : 'Review added.', 'success');
                toggleModal(false);
                await loadReviewsData();
            } else {
                const data = await res.json().catch(() => ({}));
                window.showToast(data.message || 'Failed to submit review.', 'error');
            }
        } catch (err) {
            console.error(err);
            window.showToast('Error connecting to reviews service.', 'error');
        }
    });
}

window.editReview = function(id) {
    const review = userReviews.find(r => r.id === id);
    if (!review) return;

    // Fill form
    document.getElementById('edit-review-id').value = review.id;
    
    const select = document.getElementById('review-menu-select');
    if (select) {
        select.value = review.menuId;
        select.disabled = true; // Can't change the menu of a review
    }
    
    document.getElementById('review-rating-value').value = review.rating;
    updateStarUI(review.rating);
    
    document.getElementById('review-comment').value = review.comment;
    document.getElementById('submit-review-btn-text').textContent = 'Update Entry';
    
    toggleModal(true);
};

window.deleteReview = async function(id) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
        const res = await window.apiFetch(`/api/reviews/delete/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            window.showToast('Review deleted successfully.', 'success');
            await loadReviewsData();
        } else {
            const data = await res.json().catch(() => ({}));
            window.showToast(data.message || 'Failed to delete review.', 'error');
        }
    } catch (e) {
        console.error(e);
        window.showToast('Error deleting review.', 'error');
    }
};

window.toggleModal = function(show) {
    const modal = document.getElementById('reviewModal');
    if (!modal) return;

    if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
        
        // Reset form when closing
        document.getElementById('review-form').reset();
        document.getElementById('edit-review-id').value = '';
        const select = document.getElementById('review-menu-select');
        if (select) select.disabled = false;
        document.getElementById('review-rating-value').value = 5;
        updateStarUI(5);
        document.getElementById('submit-review-btn-text').textContent = 'Publish Review';
    }
};

// Close on Esc
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.toggleModal(false);
});
