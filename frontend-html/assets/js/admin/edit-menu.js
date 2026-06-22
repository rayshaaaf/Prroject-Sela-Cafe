/**
 * Sela Cafe - Edit Menu Logistics & Inventory Mapping Script
 */

const ingredientMapping = {
    "coffee": [
        { id: 101, name: "Coffee Bean (Houseblend Arabica)" },
        { id: 102, name: "Coffee Bean (Sidamo Highlands Espresso)" },
        { id: 103, name: "Coffee Bean (Decaf Blend)" }
    ],
    "non-coffee": [
        { id: 201, name: "Liquid Pure (Fresh Milk)" },
        { id: 202, name: "Syrup Bot (Premium Chocolate Pods)" },
        { id: 203, name: "Syrup Bot (Hazelnut Velvet Extract)" }
    ],
    "tea": [
        { id: 301, name: "Ceremonial Uji Matcha Powder" },
        { id: 302, name: "Artisan Earl Grey Loose Leaves" },
        { id: 303, name: "Organic Jasmine Tea Infusion" }
    ],
    "pastry": [
        { id: 401, name: "Bakery (French Croissant Butter Dough)" },
        { id: 402, name: "Bakery (Almond Frangipane Cream Paste)" },
        { id: 403, name: "Produce (Flour & Salted Butter Matrix)" }
    ],
    "dessert": [
        { id: 501, name: "Gelato Base Mix (Vanilla Pods)" },
        { id: 502, name: "Produce (Fresh Strawberry Puree)" },
        { id: 503, name: "Liquid Cream (Heavy Whipping Foam)" }
    ]
};

let loadedCategories = [];
let productId = null;

document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof window.checkAdminAuth === 'function') {
            window.checkAdminAuth();
        }
    } catch (authError) {
        console.warn("Auth check deferred:", authError);
    }

    const urlParams = new URLSearchParams(window.location.search);
    productId = urlParams.get('id');

    if (!productId) {
        if (typeof window.showToast === 'function') {
            window.showToast("No product identifier provided.", "error");
        }
        setTimeout(() => window.location.href = 'manage-menu.html', 1500);
        return;
    }

    initEditMenuForm();
});

async function initEditMenuForm() {
    const categorySelect = document.getElementById('menu-category');
    const ingredientSelect = document.getElementById('menu-ingredient');
    const form = document.getElementById('edit-menu-form');

    if (!categorySelect || !ingredientSelect || !form) {
        console.error("Required form elements not found in DOM.");
        return;
    }

    // 1. Fetch real categories from database
    try {
        const response = await window.apiFetch('/api/categories/getAll');
        if (response.ok) {
            const apiRes = await response.json();
            loadedCategories = apiRes.data || [];
            
            categorySelect.innerHTML = `
                <option value="" disabled selected>Select category</option>
                ${loadedCategories.map(cat => `<option value="${cat.id}">${cat.nameEn || cat.nameId}</option>`).join('')}
            `;
        }
    } catch (e) {
        console.error("Failed to fetch real categories from database:", e);
    }

    // Category dropdown changes trigger ingredients update
    categorySelect.addEventListener('change', (e) => {
        updateIngredientDropdown(e.target.value, null);
    });

    function updateIngredientDropdown(selectedCategoryId, selectedIngredientId) {
        const selectedCat = loadedCategories.find(c => String(c.id) === String(selectedCategoryId));
        if (!selectedCat) return;

        const key = (selectedCat.nameEn || '').toLowerCase().replace(' ', '-');
        const availableIngredients = ingredientMapping[key] || [];

        ingredientSelect.disabled = false;
        ingredientSelect.removeAttribute('disabled');
        
        ingredientSelect.innerHTML = `
            <option value="" disabled>Select Core Ingredient</option>
            ${availableIngredients.map(ing => `
                <option value="${ing.id}" ${String(ing.id) === String(selectedIngredientId) ? 'selected' : ''}>${ing.name}</option>
            `).join('')}
        `;
    }

    // 2. Fetch existing menu details from backend
    try {
        const getResponse = await window.apiFetch(`/api/menus/getById/${productId}`);
        if (getResponse.ok) {
            const apiRes = await getResponse.json();
            const menu = apiRes.data;
            if (menu) {
                // Populate input fields
                document.getElementById('menu-name').value = menu.nameEn || menu.nameId || '';
                document.getElementById('menu-price').value = menu.price || 0;
                document.getElementById('menu-stock').value = menu.stock !== undefined ? menu.stock : 100;
                document.getElementById('menu-description').value = menu.descriptionEn || menu.descriptionId || '';
                document.getElementById('menu-image').value = menu.imageUrl || '';
                
                // Select category and trigger ingredient select mapping
                categorySelect.value = menu.categoryId;
                updateIngredientDropdown(menu.categoryId, menu.ingredientId || 101);
            }
        } else {
            if (typeof window.showToast === 'function') {
                window.showToast("Product not found.", "error");
            }
            setTimeout(() => window.location.href = 'manage-menu.html', 1500);
        }
    } catch (err) {
        console.error("Error loading product detail:", err);
    }

    // 3. Submit updated payload to REST API
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        const name = formData.get('name')?.trim();
        const description = formData.get('description')?.trim();
        const priceVal = formData.get('price');
        const stockVal = formData.get('stock');
        const categoryIdVal = formData.get('category');

        if (!name || name.length < 3) {
            if (typeof window.showToast === 'function') {
                window.showToast('Product name must be at least 3 characters.', 'error');
            }
            return;
        }
        if (!description || description.length < 10) {
            if (typeof window.showToast === 'function') {
                window.showToast('Description must be at least 10 characters.', 'error');
            }
            return;
        }
        const price = parseFloat(priceVal);
        if (isNaN(price) || price <= 0) {
            if (typeof window.showToast === 'function') {
                window.showToast('Price must be a valid positive number.', 'error');
            }
            return;
        }
        const stock = parseInt(stockVal);
        if (isNaN(stock) || stock < 0) {
            if (typeof window.showToast === 'function') {
                window.showToast('Stock must be a non-negative number.', 'error');
            }
            return;
        }
        const categoryId = parseInt(categoryIdVal);
        if (isNaN(categoryId)) {
            if (typeof window.showToast === 'function') {
                window.showToast('Please select a valid category.', 'error');
            }
            return;
        }

        const menuPayload = {
            nameId: name,
            nameEn: name,
            descriptionId: description,
            descriptionEn: description,
            price: price,
            stock: stock,
            categoryId: categoryId,
            imageUrl: formData.get('imageUrl')?.trim() || 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600'
        };

        try {
            const response = await window.apiFetch(`/api/menus/update/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(menuPayload)
            });

            if (response.ok) {
                if (typeof window.showToast === 'function') {
                    window.showToast('Product curation successfully updated.', 'success');
                }
                setTimeout(() => {
                    window.location.href = 'manage-menu.html';
                }, 1200);
            } else {
                const errData = await response.json().catch(() => ({}));
                if (typeof window.showToast === 'function') {
                    window.showToast(errData.message || 'Failed to save product details.', 'error');
                }
            }
        } catch (err) {
            console.error('Operational drop while trying to update product.', err);
            if (typeof window.showToast === 'function') {
                window.showToast('Unable to connect to server. Please try again.', 'error');
            }
        }
    });
}
