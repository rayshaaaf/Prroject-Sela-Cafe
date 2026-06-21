/**
 * Sela Cafe - Home Page Pure Action Handlers
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Sela Cafe Home Logic Activated. High-End Commercial Build Ready.");

    // Click Handlers tombol utama halaman beranda
    const btnExperience = document.getElementById('btn-experience-blend');
    if (btnExperience) {
        btnExperience.addEventListener('click', () => { 
            window.location.href = 'menu.html'; 
        });
    }

    const btnMethodology = document.getElementById('btn-methodology');
    if (btnMethodology) {
        btnMethodology.addEventListener('click', () => {
            alert('Our Methodology: Combining 1924 heritage craftsmanship with adaptive modern thermodynamics.');
        });
    }

    const btnMetrics = document.getElementById('btn-explore-metrics');
    if (btnMetrics) {
        btnMetrics.addEventListener('click', () => {
            alert('Fetching precision member club rewards data from Sela Core OS...');
        });
    }

    const btnOpenings = document.getElementById('btn-view-openings');
    if (btnOpenings) {
        btnOpenings.addEventListener('click', () => { 
            window.location.href = 'career.html'; 
        });
    }
});