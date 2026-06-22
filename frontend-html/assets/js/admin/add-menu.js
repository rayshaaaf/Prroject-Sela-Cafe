/**
 * Sela Cafe - Add Menu Logistics & Inventory Mapping Script (FIXED DROPDOWN)
 */

// Kamus Relasi Bahan Baku Utama Berdasarkan Kluster Kategori
const ingredientMapping = {
    "coffee": [
        { id: 101, name: "Coffee Bean (Houseblend Arabica)" },
        { id: 102, name: "Coffee Bean (Sidamo Highlands Espresso)" },
        { id: 103, name: "Coffee Bean (Decaf Blend)" }
    ],
    "non-coffee": [
        { id: 201, name: "Liquid Pure (Fresh Milk)" },
        { id: 202, name: "Syup Bot (Premium Chocolate Pods)" },
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
        { id: 503, name: "Liquid Cream (Heavy Wipping Foam)" }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    // Dibungkus try-catch agar jika auth gagal/delay, fungsi form di bawahnya TIDAK IKUT MACET
    try {
        if (typeof window.checkAdminAuth === 'function') {
            window.checkAdminAuth();
        }
    } catch (authError) {
        console.warn("Auth check deferred:", authError);
    }

    // Jalankan kontrol form dropdown
    initAddMenuFormControls();
});

/**
 * Logika Sinkronisasi Dropdown Bahan Baku Secara Dinamis
 */
function initAddMenuFormControls() {
    const categorySelect = document.getElementById('menu-category');
    const ingredientSelect = document.getElementById('menu-ingredient');
    const form = document.getElementById('add-menu-form');

    if (!categorySelect || !ingredientSelect) {
        console.error("Required form elements not found in DOM.");
        return;
    }

    // Deteksi interaksi pergantian kategori oleh admin
    categorySelect.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        const availableIngredients = ingredientMapping[selectedCategory] || [];

        // FIX GARANSI: Paksa buka akses dengan mematikan property dan menghapus atribut disabled dari HTML
        ingredientSelect.disabled = false;
        ingredientSelect.removeAttribute('disabled');
        
        // Suntikkan drop list data baru sesuai pilihan kategori
        ingredientSelect.innerHTML = `
            <option value="" disabled selected>Select Core Ingredient</option>
            ${availableIngredients.map(ing => `<option value="${ing.id}">${ing.name}</option>`).join('')}
        `;
    });

    // Kirim Data Form ke REST API
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const menuPayload = {
                name: formData.get('name'),
                categoryName: formData.get('category'),
                ingredientId: parseInt(formData.get('ingredientId')),
                price: parseFloat(formData.get('price')),
                description: formData.get('description'),
                imageUrl: formData.get('imageUrl') || 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600',
                isAvailable: true,
                stock: 100
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
                }
            } catch (err) {
                console.error('Operational drop while trying to create product.', err);
            }
        });
    }
}

window.handleAdminLogOut = function() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
};