/**
 * Sela Cafe - Home Page Pure Action Handlers (Integrated Modals)
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sela Cafe Home Logic Activated. High-End Commercial Build Ready.");

    // 1. Order Our Coffee Button
    const btnExperience = document.getElementById('btn-experience-blend');
    if (btnExperience) {
        btnExperience.addEventListener('click', () => { 
            window.location.href = 'menu.html'; 
        });
    }

    // 2. Our Methodology Button (Hero Section Pop-up)
    const btnMethodology = document.getElementById('btn-methodology');
    if (btnMethodology) {
        btnMethodology.addEventListener('click', () => {
            if (typeof window.openFooterModal === 'function') {
                window.openFooterModal('methodology');
            }
        });
    }

    // 3. Explore Our Roastery Button (Bento Section Pop-up)
    const btnMetrics = document.getElementById('btn-explore-metrics');
    if (btnMetrics) {
        btnMetrics.addEventListener('click', () => {
            if (typeof window.openFooterModal === 'function') {
                window.openFooterModal('roastery_showcase');
            }
        });
    }

    // 4. View Openings Button
    const btnOpenings = document.getElementById('btn-view-openings');
    if (btnOpenings) {
        btnOpenings.addEventListener('click', () => { 
            window.location.href = 'career.html'; 
        });
    }
});