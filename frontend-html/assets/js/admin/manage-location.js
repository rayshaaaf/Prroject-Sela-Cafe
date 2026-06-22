// manage-location.js

// Check Admin Authentication
window.checkAdminAuth();

// Global State
let allLocations = [];
let currentStatusFilter = 'all';

// Fetch Locations from API
async function loadLocations() {
    try {
        const res = await apiFetch('/api/locations');
        if (res.ok) {
            const data = await res.json();
            allLocations = data.data || [];
            executeFiltering();
        } else {
            showToast('Failed to load branches data', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Error connecting to locations service', 'error');
    }
}

// Helper: Status Badge
const getLocationBadge = (isOpen) => {
    if (isOpen) {
        return '<span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-caps text-[10px] flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-moss-green"></span> Operating</span>';
    } else {
        return '<span class="bg-error-container text-error px-3 py-1 rounded-full font-label-caps text-[10px] flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-error"></span> Closed</span>';
    }
};

// Render Location Cards
const renderLocations = (data) => {
    const grid = document.getElementById('admin-location-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (data.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-outline font-label-md">No locations found.</div>';
        return;
    }

    data.forEach(loc => {
        grid.innerHTML += `
            <div class="border border-outline-variant/50 rounded-xl overflow-hidden bg-white flex flex-col hover:shadow-lg transition-shadow fade-in-smooth group">
                <div class="h-40 w-full bg-surface-container relative overflow-hidden">
                    <img src="${loc.imageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80'}" alt="${loc.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100">
                    <div class="absolute top-4 right-4">${getLocationBadge(loc.isOpen)}</div>
                </div>
                
                <div class="p-6 flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-headline-md text-[22px] text-deep-espresso leading-tight">${loc.name}</h3>
                            <span class="text-xs font-label-caps text-outline bg-surface-container px-2 py-0.5 rounded">${loc.city}</span>
                        </div>
                        <p class="font-body-md text-sm text-outline mb-4 flex items-start gap-2">
                            <span class="material-symbols-outlined text-[16px] mt-0.5">map</span> ${loc.addressEn}
                        </p>
                        
                        <div class="bg-surface-container-low rounded-lg p-4 grid grid-cols-2 gap-4 mb-4 text-xs">
                            <div>
                                <p class="font-label-caps text-[9px] text-outline mb-1">OPEN HOURS</p>
                                <p class="font-label-md text-deep-espresso font-semibold">${loc.openHours}</p>
                            </div>
                            <div>
                                <p class="font-label-caps text-[9px] text-outline mb-1">CONTACT PHONE</p>
                                <p class="font-label-md text-deep-espresso font-semibold">${loc.phone}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center border-t border-outline-variant/50 pt-4 mt-auto">
                        <a href="${loc.mapsUrl}" target="_blank" class="flex items-center gap-1 font-label-caps text-[10px] text-moss-green hover:underline">
                            <span class="material-symbols-outlined text-sm">directions</span> Open Maps
                        </a>
                        <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
                            <button onclick="openEditLocationModal(${loc.id})" class="font-label-caps text-[10px] text-primary hover:underline cursor-pointer">EDIT DETAILS</button>
                            <button onclick="deleteLocation(${loc.id})" class="font-label-caps text-[10px] text-error hover:underline cursor-pointer">DELETE</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
};

// Filter Tabs
window.filterAdminLocation = function(status, btn) {
    currentStatusFilter = status;
    
    // Reset styling
    const btns = document.getElementById('location-tabs-container').getElementsByTagName('button');
    for (let b of btns) {
        b.className = "font-label-caps text-[12px] text-on-surface-variant hover:text-primary transition-colors pb-2 whitespace-nowrap cursor-pointer";
    }
    // Set active style
    btn.className = "font-label-caps text-[12px] text-primary border-b-2 border-primary pb-2 whitespace-nowrap cursor-pointer";
    
    executeFiltering();
};

// Execute Filter
const executeFiltering = () => {
    const filtered = allLocations.filter(loc => {
        return (
            currentStatusFilter === 'all' || 
            (currentStatusFilter === 'open' && loc.isOpen) || 
            (currentStatusFilter === 'closed' && !loc.isOpen)
        );
    });
    renderLocations(filtered);
};

// --- Modal Handlers ---
window.openAddLocationModal = function() {
    document.getElementById('location-id').value = '';
    document.getElementById('location-form').reset();
    document.getElementById('location-modal-title').textContent = 'Add New Branch';
    document.getElementById('location-is-open').checked = true;

    const modal = document.getElementById('location-modal');
    const content = document.getElementById('location-modal-content');
    modal.classList.remove('pointer-events-none', 'opacity-0');
    content.classList.remove('scale-95', 'translate-y-4');
    content.classList.add('scale-100', 'translate-y-0');
};

window.openEditLocationModal = function(id) {
    const loc = allLocations.find(l => l.id === id);
    if (!loc) return;

    document.getElementById('location-id').value = loc.id;
    document.getElementById('location-name').value = loc.name;
    document.getElementById('location-city').value = loc.city;
    document.getElementById('location-address-id').value = loc.addressId;
    document.getElementById('location-address-en').value = loc.addressEn;
    document.getElementById('location-phone').value = loc.phone;
    document.getElementById('location-open-hours').value = loc.openHours;
    document.getElementById('location-maps-url').value = loc.mapsUrl;
    document.getElementById('location-image-url').value = loc.imageUrl;
    document.getElementById('location-is-open').checked = loc.isOpen;

    document.getElementById('location-modal-title').textContent = 'Edit Branch Details';

    const modal = document.getElementById('location-modal');
    const content = document.getElementById('location-modal-content');
    modal.classList.remove('pointer-events-none', 'opacity-0');
    content.classList.remove('scale-95', 'translate-y-4');
    content.classList.add('scale-100', 'translate-y-0');
};

window.closeLocationModal = function() {
    const modal = document.getElementById('location-modal');
    const content = document.getElementById('location-modal-content');
    content.classList.remove('scale-100', 'translate-y-0');
    content.classList.add('scale-95', 'translate-y-4');
    setTimeout(() => {
        modal.classList.add('pointer-events-none', 'opacity-0');
    }, 200);
};

window.saveLocation = async function(e) {
    e.preventDefault();
    const id = document.getElementById('location-id').value;
    const payload = {
        name: document.getElementById('location-name').value,
        city: document.getElementById('location-city').value,
        addressId: document.getElementById('location-address-id').value,
        addressEn: document.getElementById('location-address-en').value,
        phone: document.getElementById('location-phone').value,
        openHours: document.getElementById('location-open-hours').value,
        mapsUrl: document.getElementById('location-maps-url').value,
        imageUrl: document.getElementById('location-image-url').value,
        isOpen: document.getElementById('location-is-open').checked
    };

    try {
        let res;
        if (id) {
            // Update
            res = await apiFetch(`/api/locations/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            // Create
            res = await apiFetch('/api/locations', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        if (res.ok) {
            showToast(id ? 'Branch details updated' : 'New branch created successfully', 'success');
            closeLocationModal();
            loadLocations();
        } else {
            const errData = await res.json();
            showToast(errData.message || 'Operation failed', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Error saving branch details', 'error');
    }
};

window.deleteLocation = async function(id) {
    if (!confirm('Are you sure you want to delete this branch? This cannot be undone.')) return;

    try {
        const res = await apiFetch(`/api/locations/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            showToast('Branch location deleted', 'success');
            loadLocations();
        } else {
            showToast('Failed to delete branch', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Error deleting branch', 'error');
    }
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadLocations();
});