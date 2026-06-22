/**
 * Sela Cafe - Add Menu Logistics & Inventory Mapping Script
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

document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof window.checkAdminAuth === 'function') {
            window.checkAdminAuth();
        }
    } catch (authError) {
        console.warn("Auth check deferred:", authError);
    }

    initAddMenuForm();
});

async function initAddMenuForm() {
    const categorySelect = document.getElementById('menu-category');
    const ingredientSelect = document.getElementById('menu-ingredient');
    const form = document.getElementById('add-menu-form');

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
            
            // Populate select box
            categorySelect.innerHTML = `
                <option value="" disabled selected>Select category</option>
                ${loadedCategories.map(cat => `<option value="${cat.id}">${cat.nameEn || cat.nameId}</option>`).join('')}
            `;
        }
    } catch (e) {
        console.error("Failed to fetch real categories from database:", e);
    }

    // 2. Synchronize dropdown core ingredients dynamically based on category
    categorySelect.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        const selectedCat = loadedCategories.find(c => String(c.id) === String(selectedId));
        if (!selectedCat) return;

        // Map category English name to lookup keys in ingredientMapping
        const key = (selectedCat.nameEn || '').toLowerCase().replace(' ', '-');
        const availableIngredients = ingredientMapping[key] || [];

        ingredientSelect.disabled = false;
        ingredientSelect.removeAttribute('disabled');
        
        ingredientSelect.innerHTML = `
            <option value="" disabled selected>Select Core Ingredient</option>
            ${availableIngredients.map(ing => `<option value="${ing.id}">${ing.name}</option>`).join('')}
        `;
    });

    // 3. Submit payload to REST API
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        const name = formData.get('name')?.trim();
        const description = formData.get('description')?.trim();
        const priceVal = formData.get('price');
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
        const categoryId = parseInt(categoryIdVal);
        if (isNaN(categoryId)) {
            if (typeof window.showToast === 'function') {
                window.showToast('Please select a valid category.', 'error');
            }
            return;
        }

        // Prepare correct MenuReq payload matching backend spring boot validator
        const menuPayload = {
            nameId: name,
            nameEn: name, // Replicate same string for both ID and EN versions
            descriptionId: description,
            descriptionEn: description,
            price: price,
            stock: 100, // Default stock quantity
            categoryId: categoryId,
            imageUrl: formData.get('imageUrl')?.trim() || 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600'
        };

        try {
            const response = await window.apiFetch('/api/menus/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(menuPayload)
            });

            if (response.ok) {
                if (typeof window.showToast === 'function') {
                    window.showToast('Product logged and assigned to inventory loop successfully.', 'success');
                }
                setTimeout(() => {
                    window.location.href = 'manage-menu.html';
                }, 1200);
            } else {
                const errData = await response.json().catch(() => ({}));
                if (typeof window.showToast === 'function') {
                    window.showToast(errData.message || 'Failed to create product curation.', 'error');
                }
            }
        } catch (err) {
            console.error('Operational drop while trying to create product.', err);
            if (typeof window.showToast === 'function') {
                window.showToast('Unable to connect to server. Please try again.', 'error');
            }
        }
    });
}