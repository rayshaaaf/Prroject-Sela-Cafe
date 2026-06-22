// manage-user.js

// Check Admin Authentication
window.checkAdminAuth();

// Global State
let allUsers = [];
let currentUserFilter = 'all';

// Load All Users
async function loadUsers() {
    try {
        const res = await apiFetch('/api/users/getAll');
        if (res.ok) {
            const data = await res.json();
            allUsers = data.data || [];
            executeFiltering();
        } else {
            showToast('Failed to retrieve user accounts', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Error connecting to user management service', 'error');
    }
}

// Helper: Status Badge
const getUserStatusBadge = (isActive) => {
    if (isActive) {
        return '<span class="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-label-caps text-[10px]">Active</span>';
    } else {
        return '<span class="bg-error-container text-error px-2 py-0.5 rounded-full font-label-caps text-[10px]">Inactive</span>';
    }
};

// Helper: Avatar Generator
const getAvatar = (name) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
    return `https://ui-avatars.com/api/?name=${initials}&background=2A1B0E&color=FDFCF8&font-size=0.45&bold=true`;
};

// Render User Grid
const renderUsers = (data) => {
    const grid = document.getElementById('admin-user-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-outline font-label-md">No users found.</div>';
        return;
    }

    data.forEach(user => {
        const statusActionBtn = user.isActive
            ? `<button onclick="toggleUserStatus(${user.id}, false)" class="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center hover:bg-error hover:text-white transition-colors" title="Deactivate User">
                   <span class="material-symbols-outlined text-[16px]">block</span>
               </button>`
            : `<button onclick="toggleUserStatus(${user.id}, true)" class="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center hover:bg-moss-green hover:text-white transition-colors" title="Activate User">
                   <span class="material-symbols-outlined text-[16px]">check_circle</span>
               </button>`;

        grid.innerHTML += `
            <div class="border border-outline-variant/50 rounded-xl p-6 bg-white flex flex-col items-center hover:shadow-lg transition-shadow fade-in-smooth group relative text-center">
                
                <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                    <button onclick="openRoleModal(${user.id}, '${user.email}', '${user.role}')" class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors" title="Change Role">
                        <span class="material-symbols-outlined text-[16px]">settings</span>
                    </button>
                    ${statusActionBtn}
                </div>

                <div class="absolute top-4 left-4">
                    ${getUserStatusBadge(user.isActive)}
                </div>

                <div class="w-20 h-20 rounded-full border-4 border-surface-container-low overflow-hidden mb-4 mt-4 shadow-sm">
                    <img src="${getAvatar(user.name)}" alt="${user.name}" class="w-full h-full object-cover">
                </div>
                
                <h3 class="font-headline-md text-[20px] text-deep-espresso mb-1">${user.name}</h3>
                <p class="font-label-caps text-[10px] text-primary tracking-widest mb-4 uppercase bg-heritage-cream/50 px-2 py-1 rounded">${user.role}</p>
                
                <div class="sela-line w-full my-4"></div>
                
                <div class="w-full space-y-2 text-xs">
                    <div class="flex items-center justify-center gap-2 text-on-surface-variant">
                        <span class="material-symbols-outlined text-[16px]">mail</span>
                        <span class="truncate max-w-[150px]" title="${user.email}">${user.email}</span>
                    </div>
                    <div class="flex items-center justify-center gap-2 text-on-surface-variant">
                        <span class="material-symbols-outlined text-[16px]">phone_iphone</span>
                        <span>${user.phone || '-'}</span>
                    </div>
                </div>

            </div>
        `;
    });
};

// Filter Tab Click Handlers
window.filterAdminUser = function(role, btn) {
    currentUserFilter = role;
    
    // Reset tabs styles
    const btns = document.getElementById('user-tabs-container').getElementsByTagName('button');
    for (let b of btns) {
        b.className = "font-label-caps text-[12px] text-on-surface-variant hover:text-primary transition-colors pb-2 whitespace-nowrap cursor-pointer";
    }
    // Set active tab style
    btn.className = "font-label-caps text-[12px] text-primary border-b-2 border-primary pb-2 whitespace-nowrap cursor-pointer";
    
    executeFiltering();
};

// Filter Execution
const executeFiltering = () => {
    const searchKeyword = document.getElementById('admin-user-search').value.toLowerCase().trim();
    
    const filtered = allUsers.filter(user => {
        const matchesRole = (
            currentUserFilter === 'all' || 
            (user.role && user.role.toLowerCase() === currentUserFilter.toLowerCase())
        );
        const matchesSearch = 
            user.name.toLowerCase().includes(searchKeyword) || 
            user.email.toLowerCase().includes(searchKeyword);
            
        return matchesRole && matchesSearch;
    });

    renderUsers(filtered);
};

// --- Add User Modal ---
window.openAddUserModal = function() {
    document.getElementById('add-user-form').reset();
    
    const modal = document.getElementById('add-user-modal');
    const content = document.getElementById('add-user-modal-content');
    modal.classList.remove('pointer-events-none', 'opacity-0');
    content.classList.remove('scale-95', 'translate-y-4');
    content.classList.add('scale-100', 'translate-y-0');
};

window.closeAddUserModal = function() {
    const modal = document.getElementById('add-user-modal');
    const content = document.getElementById('add-user-modal-content');
    content.classList.remove('scale-100', 'translate-y-0');
    content.classList.add('scale-95', 'translate-y-4');
    setTimeout(() => {
        modal.classList.add('pointer-events-none', 'opacity-0');
    }, 200);
};

window.saveNewUser = async function(e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-phone').value,
        password: document.getElementById('reg-password').value
    };

    try {
        const res = await apiFetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast('Account registered successfully', 'success');
            closeAddUserModal();
            loadUsers();
        } else {
            const errData = await res.json();
            showToast(errData.message || 'Registration failed', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Error registering new user', 'error');
    }
};

// --- Edit Role Modal ---
window.openRoleModal = function(id, email, currentRole) {
    document.getElementById('role-user-id').value = id;
    document.getElementById('role-user-email').textContent = email;
    document.getElementById('role-select').value = currentRole.toUpperCase();

    const modal = document.getElementById('role-modal');
    const content = document.getElementById('role-modal-content');
    modal.classList.remove('pointer-events-none', 'opacity-0');
    content.classList.remove('scale-95', 'translate-y-4');
    content.classList.add('scale-100', 'translate-y-0');
};

window.closeRoleModal = function() {
    const modal = document.getElementById('role-modal');
    const content = document.getElementById('role-modal-content');
    content.classList.remove('scale-100', 'translate-y-0');
    content.classList.add('scale-95', 'translate-y-4');
    setTimeout(() => {
        modal.classList.add('pointer-events-none', 'opacity-0');
    }, 200);
};

window.saveUserRole = async function(e) {
    e.preventDefault();
    const id = document.getElementById('role-user-id').value;
    const selectedRole = document.getElementById('role-select').value;

    try {
        const res = await apiFetch(`/api/users/${id}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role: selectedRole })
        });

        if (res.ok) {
            showToast('User role updated successfully', 'success');
            closeRoleModal();
            loadUsers();
        } else {
            showToast('Failed to update role', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Error saving user role', 'error');
    }
};

// --- Activate / Deactivate Handler ---
window.toggleUserStatus = async function(id, shouldActivate) {
    const action = shouldActivate ? 'activate' : 'deactivate';
    
    try {
        const res = await apiFetch(`/api/users/${id}/${action}`, {
            method: 'PUT'
        });

        if (res.ok) {
            showToast(`User account ${shouldActivate ? 'activated' : 'deactivated'}`, 'success');
            loadUsers();
        } else {
            showToast(`Failed to ${action} user`, 'error');
        }
    } catch (err) {
        console.error(err);
        showToast(`Error trying to ${action} user`, 'error');
    }
};

// DOM Init
document.addEventListener("DOMContentLoaded", () => {
    loadUsers();

    const searchInput = document.getElementById('admin-user-search');
    if (searchInput) {
        searchInput.addEventListener('input', executeFiltering);
    }
});