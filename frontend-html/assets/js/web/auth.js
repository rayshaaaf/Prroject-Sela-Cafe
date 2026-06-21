/**
 * Sela Cafe — Authentication Module
 * Handles login and registration via API Gateway (http://localhost:8090)
 */

const AUTH_API = 'http://localhost:8090';

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (/login\.html$/.test(path)) initLoginPage();
    if (/regis\.html$/.test(path)) initRegisterPage();
});

// ─── Login Page ───────────────────────────────────────────────────────────────
function initLoginPage() {
    // Fix navigation links
    const createLink = document.querySelector('a[href="#"]');
    if (createLink && createLink.textContent.toLowerCase().includes('create')) {
        createLink.href = 'regis.html';
    }
    document.querySelectorAll('a[href="#"]').forEach(a => {
        if (a.textContent.toLowerCase().includes('create')) a.href = 'regis.html';
    });
    // Back to home
    document.querySelectorAll('a').forEach(a => {
        if (a.textContent.toLowerCase().includes('back')) a.href = 'home.html';
    });

    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();

        const email = (document.getElementById('email') || document.getElementById('login-email'))?.value?.trim();
        const password = (document.getElementById('password') || document.getElementById('login-password'))?.value;

        if (!email || !password) { showError('Please fill in all fields.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('Invalid email address.'); return; }

        setLoading(true);

        try {
            const res = await fetch(`${AUTH_API}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const apiRes = await res.json().catch(() => ({}));
            const data = apiRes.data || {};

            if (res.ok && (data.token || apiRes.token || data.accessToken)) {
                const token = data.token || apiRes.token || data.accessToken;
                const userName = data.name || apiRes.fullName || data.username || email.split('@')[0];
                let userRole = data.role || '';

                localStorage.setItem('token', token);
                localStorage.setItem('userName', userName);

                // Fetch full profile to get userId and sync name
                try {
                    const profileRes = await fetch(`${AUTH_API}/api/users/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (profileRes.ok) {
                        const profileData = await profileRes.json();
                        if (profileData && profileData.data) {
                            localStorage.setItem('userId', String(profileData.data.id));
                            localStorage.setItem('userName', profileData.data.name);
                            userRole = profileData.data.role || userRole;
                        }
                    }
                } catch (profileErr) {
                    console.error('Error fetching profile on login:', profileErr);
                }

                localStorage.setItem('role', userRole);

                // Redirect to intended page or role dashboard
                let redirect = new URLSearchParams(window.location.search).get('redirect');
                if (!redirect) {
                    if (userRole === 'CASHIER') {
                        redirect = '../cashier/dashboard.html';
                    } else if (userRole === 'KITCHEN') {
                        redirect = '../kitchen/kitchen.html';
                    } else if (userRole === 'COURIER') {
                        redirect = '../courier/dashboard.html';
                    } else {
                        redirect = '../customer/homepage.html';
                    }
                }
                window.location.href = redirect;
            } else {
                showError(apiRes.message || data.message || apiRes.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            showError('Unable to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    });
}

// ─── Register Page ────────────────────────────────────────────────────────────
function initRegisterPage() {
    // Fix navigation links
    document.querySelectorAll('a').forEach(a => {
        if (a.textContent.toLowerCase().includes('back') || a.textContent.toLowerCase().includes('home')) {
            a.href = 'home.html';
        }
        if (a.textContent.toLowerCase().includes('sign in') || a.textContent.toLowerCase().includes('login')) {
            a.href = 'login.html';
        }
    });

    const form = document.querySelector('form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="button"]') || form.querySelector('button');

    // Wire the Create Account button (it has type="button" or is the only button)
    const allButtons = form.querySelectorAll('button');
    let createBtn = null;
    allButtons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes('create account')) createBtn = btn;
    });
    if (!createBtn && allButtons.length > 0) createBtn = allButtons[allButtons.length - 1];

    form.addEventListener('submit', handleRegister);
    if (createBtn) createBtn.addEventListener('click', () => form.dispatchEvent(new Event('submit')));
}

async function handleRegister(e) {
    e.preventDefault();
    clearError();

    const name = (document.getElementById('full_name') || document.getElementById('reg-name'))?.value?.trim();
    const email = (document.getElementById('email') || document.getElementById('reg-email'))?.value?.trim();
    const phone = (document.getElementById('phone') || document.getElementById('reg-phone'))?.value?.trim();
    const password = (document.getElementById('password') || document.getElementById('reg-password'))?.value;
    const confirm = (document.getElementById('confirm_password') || document.getElementById('reg-confirm'))?.value;
    const termsChecked = document.getElementById('terms')?.checked;

    if (!name || !email || !phone || !password) { showError('Full name, email, phone number, and password are required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('Invalid email address.'); return; }
    if (password.length < 8) { showError('Password must be at least 8 characters.'); return; }
    if (confirm && password !== confirm) { showError('Passwords do not match.'); return; }
    if (document.getElementById('terms') && !termsChecked) { showError('Please accept the Terms & Conditions.'); return; }

    setLoading(true);

    try {
        const res = await fetch(`${AUTH_API}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone: phone || '', password })
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
            window.location.href = 'login.html?registered=true';
        } else {
            showError(data.message || data.error || 'Registration failed. Email may already be in use.');
        }
    } catch (err) {
        showError('Unable to connect to server. Please try again.');
    } finally {
        setLoading(false);
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function showError(msg) {
    let errEl = document.getElementById('auth-error');
    if (!errEl) {
        errEl = document.createElement('div');
        errEl.id = 'auth-error';
        errEl.className = 'text-error text-sm font-label-caps tracking-wide py-2 px-4 bg-error-container rounded';
        const form = document.querySelector('form');
        if (form) form.insertBefore(errEl, form.firstChild);
    }
    errEl.textContent = msg;
    errEl.style.display = 'block';
}

function clearError() {
    const errEl = document.getElementById('auth-error');
    if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
}

function setLoading(loading) {
    const btns = document.querySelectorAll('form button[type="submit"], #login-submit, #reg-submit');
    const submitBtns = document.querySelectorAll('form button');
    const allBtns = btns.length ? btns : submitBtns;
    allBtns.forEach(btn => {
        if (loading) {
            btn.dataset.origText = btn.textContent;
            btn.textContent = 'Please wait...';
            btn.disabled = true;
        } else {
            btn.textContent = btn.dataset.origText || btn.textContent;
            btn.disabled = false;
        }
    });
}
