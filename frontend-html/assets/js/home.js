/**
 * Sela Cafe - Home Page Operations Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sela Cafe Home Page Logic Loaded Successfully.');

    // 1. Tombol "Join the Club" (di Navbar buatan component.js dialihkan lewat ID / Class jika diperlukan)
    // Untuk tombol bawaan component.js, jika ada button "Join the Club" khusus di halaman, kita handle di bawah ini:
    
    // 2. Tombol "Experience the Blend" -> Arahkan ke halaman menu.html
    const btnExperience = document.getElementById('btn-experience-blend');
    if (btnExperience) {
        btnExperience.addEventListener('click', () => {
            window.location.href = 'menu.html';
        });
    }

    // 3. Tombol "Our Methodology" -> Munculkan pop-up atau arahkan ke bagian tertentu
    const btnMethodology = document.getElementById('btn-methodology');
    if (btnMethodology) {
        btnMethodology.addEventListener('click', () => {
            alert('Our Methodology: Combining 1924 heritage craftsmanship with adaptive modern thermodynamics.');
        });
    }

    // 4. Tombol Bento "Explore Metrics"
    const btnMetrics = document.getElementById('btn-explore-metrics');
    if (btnMetrics) {
        btnMetrics.addEventListener('click', async () => {
            alert('Fetching precision core analytics from Sela OS...');
            // Contoh pemanfaatan apiFetch global dari component.js jika backend sudah aktif
            /*
            try {
                const response = await window.apiFetch('/api/metrics/summary');
                const data = await response.json();
                console.log('Sela Core OS Metrics:', data);
            } catch (err) {
                console.error('Failed to grab telemetry data.', err);
            }
            */
        });
    }

    // 5. Tombol Karir "View Openings" -> Arahkan langsung ke career.html
    const btnOpenings = document.getElementById('btn-view-openings');
    if (btnOpenings) {
        btnOpenings.addEventListener('click', () => {
            window.location.href = 'career.html';
        });
    }

    // 6. Smooth Scroll Interactivity untuk semua tautan hash internal '#'
    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#') && href !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});