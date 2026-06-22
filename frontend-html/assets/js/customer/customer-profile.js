/**
 * Sela Cafe — Customer Profile Script
 * Handles profile retrieval and inline updates.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!window.isAuthenticated()) {
        window.location.href = '../web/login.html?redirect=../customer/profile.html';
        return;
    }
    initProfilePage();
});

let currentProfile = {};

async function initProfilePage() {
    await fetchProfile();

    // Bind Edit Button
    const editBtn = document.getElementById('btn-edit-profile');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('edit-profile-name');
            const phoneInput = document.getElementById('edit-profile-phone');

            if (nameInput) nameInput.value = currentProfile.name || '';
            if (phoneInput) phoneInput.value = currentProfile.phone || '';

            toggleProfileModal(true);
        });
    }

    // Bind Form Submit
    const form = document.getElementById('edit-profile-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('edit-profile-name')?.value?.trim();
            const phone = document.getElementById('edit-profile-phone')?.value?.trim();

            if (!name || !phone) {
                window.showToast('Please fill in all fields.', 'error');
                return;
            }
            if (name.length < 3) {
                window.showToast('Full name must be at least 3 characters.', 'error');
                return;
            }
            if (!/^[a-zA-Z\s'.]+$/.test(name)) {
                window.showToast('Full name can only contain letters, spaces, dots, and single quotes.', 'error');
                return;
            }
            const cleanPhone = phone.replace(/[\s\-()]/g, '');
            if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
                window.showToast('Phone number must be digits only and between 10 and 15 digits long.', 'error');
                return;
            }

            try {
                const res = await window.apiFetch('/api/users/profile', {
                    method: 'PUT',
                    body: JSON.stringify({ name, phone: cleanPhone })
                });

                if (res.ok) {
                    window.showToast('Profile updated successfully.', 'success');
                    localStorage.setItem('userName', name);
                    toggleProfileModal(false);
                    await fetchProfile();

                    // Refresh Navbar
                    const navbarPlaceholder = document.getElementById('navbar-placeholder');
                    if (navbarPlaceholder && typeof window.injectNavbar === 'function') {
                        window.injectNavbar(navbarPlaceholder);
                    }
                } else {
                    const data = await res.json().catch(() => ({}));
                    window.showToast(data.message || 'Failed to update profile.', 'error');
                }
            } catch (err) {
                console.error(err);
                window.showToast('Unable to connect to server.', 'error');
            }
        });
    }
}

async function fetchProfile() {
    try {
        const res = await window.apiFetch('/api/users/profile');
        if (res.ok) {
            const apiRes = await res.json();
            currentProfile = apiRes.data;

            // Render details
            const titleName = document.getElementById('profile-display-name-title');
            const fieldName = document.getElementById('profile-display-name');
            const fieldEmail = document.getElementById('profile-display-email');
            const fieldPhone = document.getElementById('profile-display-phone');

            if (titleName) titleName.textContent = currentProfile.name || '';
            if (fieldName) fieldName.textContent = currentProfile.name || '';
            if (fieldEmail) fieldEmail.textContent = currentProfile.email || '';
            if (fieldPhone) fieldPhone.textContent = currentProfile.phone || 'No phone number';
        } else {
            window.showToast('Failed to load profile data.', 'error');
        }
    } catch (e) {
        console.error(e);
        window.showToast('Error connecting to user service.', 'error');
    }
}

window.toggleProfileModal = function(show) {
    const modal = document.getElementById('profileModal');
    if (!modal) return;
    if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }
};
