/**
 * Sela Cafe — Locations Integration
 * Fetches branch locations dynamically from `/api/locations/open`
 * and renders them beautifully with premium layout mapping.
 */

document.addEventListener('DOMContentLoaded', () => {
    const locationsContainer = document.getElementById('locations-container');
    if (locationsContainer) {
        initLocations(locationsContainer);
    }
});

async function initLocations(container) {
    let locations = [];
    try {
        const response = await window.apiFetch('/api/locations/open');
        if (response.ok) {
            const apiRes = await response.json();
            locations = apiRes.data || [];
        } else {
            console.error('Failed to fetch locations. Status:', response.status);
        }
    } catch (e) {
        console.error('Error fetching locations from API:', e);
    }

    // Hydrate details dynamically for visual fidelity depending on branch name
    locations = locations.map((loc, idx) => {
        const nameLower = loc.name ? loc.name.toLowerCase() : '';
        let description = '';
        let tag = '';
        let amenities = [];

        if (nameLower.includes('braga')) {
            description = "Immerse yourself in the colonial charm of Bandung's most iconic street. Our Braga branch is housed in a meticulously restored 1920s building, featuring high ceilings and original mosaic flooring.";
            tag = "Historic District";
            amenities = ["FREE WIFI", "INDOOR/OUTDOOR", "MEETING SPACE"];
        } else if (nameLower.includes('dago')) {
            description = "Perched on the highlands, our Dago location offers breathtaking views of the valley. A minimalist sanctuary where the crisp mountain air complements our signature dark roasts.";
            tag = "Mountain View";
            amenities = ["MOUNTAIN VIEW", "AMPHITHEATER"];
        } else if (nameLower.includes('cihampelas')) {
            description = "A modern industrial haven nestled in the heart of the city's creative district. Designed for thinkers, makers, and dreamers who need a quiet corner in a fast-paced world.";
            tag = "Urban Pulse";
            amenities = ["COMMUNITY DESK", "URBAN TERRACE"];
        } else {
            description = `Experience the finest specialty coffee in ${loc.city || 'our cafe'}. Located at ${loc.addressEn || loc.addressId || 'our branch'}, our sanctuary is designed to help you slow down and savor the craft.`;
            tag = loc.city || "Sela Sanctuary";
            amenities = ["FREE WIFI", "INDOOR/OUTDOOR"];
        }

        return {
            ...loc,
            description,
            tag,
            amenities
        };
    });

    renderLocations(container, locations);
}

function renderLocations(container, locations) {
    container.innerHTML = '';
    
    // Filter active open locations
    const openLocs = locations.filter(l => l.isOpen !== false);

    if (openLocs.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-20 text-on-surface-variant font-label-caps tracking-wider opacity-60">
                No locations available at this time.
            </div>
        `;
        return;
    }

    openLocs.forEach((loc, idx) => {
        const name = loc.name || 'Sela Cafe';
        const address = loc.addressEn || loc.addressId || 'Branch Address';
        const hours = loc.openHours || 'Daily: 07:00 — 22:00';
        const img = loc.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnxk08Xcd2iw63tvIXlib-cVGld0EkJhxyJEJFlBIzvlfxjRSp7OMY67TGbx20pBOD4xZvKdyrL_grCnal4R7nu-_H98C7iOfkICiuiVMsPmPJLT7h_igFkKrw2KV0e6iIjqGxBd5dcWoxi3DDZhZrOSSVOFPU_EgaII-GB3haHnYWwkfTdv7GEAs5NaP_uM0-_9GhGiHPz2rWUgc1FY3HqKFJ-Yv7bjdktKmE3XUK3PGlDIGwpLAcYyZwvPks0nV3gOYyhnz2w4D-';
        const desc = loc.description;
        const tag = loc.tag;
        const amenitiesHTML = (loc.amenities || []).map(a => `<span class="bg-heritage-cream px-3 py-1 font-label-caps text-[10px] text-primary">${a}</span>`).join('\n');

        const isEven = idx % 2 === 0;
        const card = document.createElement('div');
        card.className = 'grid grid-cols-1 md:grid-cols-12 gap-12 items-center';

        if (isEven) {
            card.innerHTML = `
                <div class="md:col-span-7 order-2 md:order-1">
                    <div class="aspect-[4/3] overflow-hidden">
                        <img class="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700" src="${img}" alt="${name}">
                    </div>
                </div>
                <div class="md:col-span-5 order-1 md:order-2 flex flex-col justify-center">
                    <span class="font-label-caps text-label-caps text-moss-green mb-4">${tag}</span>
                    <h3 class="font-headline-lg text-headline-lg text-deep-espresso mb-6">${name}</h3>
                    <p class="font-body-md text-on-surface-variant mb-8 leading-relaxed">${desc}</p>
                    <div class="space-y-4 mb-10">
                        <div class="flex items-center gap-4 text-on-surface">
                            <span class="material-symbols-outlined text-outline">location_on</span>
                            <span class="font-label-md text-label-md">${address}</span>
                        </div>
                        <div class="flex items-center gap-4 text-on-surface">
                            <span class="material-symbols-outlined text-outline">schedule</span>
                            <span class="font-label-md text-label-md">${hours}</span>
                        </div>
                        <div class="flex gap-3 pt-4">
                            ${amenitiesHTML}
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <button onclick="window.showToast('${name} Phone: ${loc.phone || "N/A"}', 'default')" class="flex-1 border border-primary py-4 font-label-caps text-label-caps hover:bg-primary hover:text-white transition-all">View Details</button>
                        <button onclick="window.open('${loc.mapsUrl || 'https://maps.google.com'}', '_blank')" class="flex-1 bg-primary text-white py-4 font-label-caps text-label-caps hover:opacity-90 transition-all">Get Directions</button>
                    </div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="md:col-span-5 flex flex-col justify-center">
                    <span class="font-label-caps text-label-caps text-moss-green mb-4">${tag}</span>
                    <h3 class="font-headline-lg text-headline-lg text-deep-espresso mb-6">${name}</h3>
                    <p class="font-body-md text-on-surface-variant mb-8 leading-relaxed">${desc}</p>
                    <div class="space-y-4 mb-10">
                        <div class="flex items-center gap-4 text-on-surface">
                            <span class="material-symbols-outlined text-outline">location_on</span>
                            <span class="font-label-md text-label-md">${address}</span>
                        </div>
                        <div class="flex items-center gap-4 text-on-surface">
                            <span class="material-symbols-outlined text-outline">schedule</span>
                            <span class="font-label-md text-label-md">${hours}</span>
                        </div>
                        <div class="flex gap-3 pt-4">
                            ${amenitiesHTML}
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <button onclick="window.showToast('${name} Phone: ${loc.phone || "N/A"}', 'default')" class="flex-1 border border-primary py-4 font-label-caps text-label-caps hover:bg-primary hover:text-white transition-all">View Details</button>
                        <button onclick="window.open('${loc.mapsUrl || 'https://maps.google.com'}', '_blank')" class="flex-1 bg-primary text-white py-4 font-label-caps text-label-caps hover:opacity-90 transition-all">Get Directions</button>
                    </div>
                </div>
                <div class="md:col-span-7">
                    <div class="aspect-[4/3] overflow-hidden">
                        <img class="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700" src="${img}" alt="${name}">
                    </div>
                </div>
            `;
        }

        container.appendChild(card);
    });
}
