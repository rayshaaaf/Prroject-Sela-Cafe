// Data Struktur Kolektif Barista
const teamMembers = [
  {
    name: "Elias Thorne",
    role: "Master Barista",
    badgeClass: "bg-heritage-cream text-deep-espresso",
    tenure: "Since 2018",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0IauXTByaAMHgPtm_0EYMTb38RvduA5kA4L7zPDxHYR4O4JWiZ1_anOV7x4hI__lq6_wTDMb0vledxAtdMNqCyOlnJntAtKTSYi1RVZDl2a5dT82fcdJGiLfX9WoPYbmGy8C7GrPFv9F7in_T8xJF1pLmCcQX2t9I8qtH_WE0-Q-rYrAJfukIfvYnFiCxOSm7SHntEtMqe6LEp1brN_GYcBBFaFEiWctsoqgajJPNGl3PvvCu0BFPL0vmgjOQr_73dxnbhjvwYSu9",
    description: "Specializing in ethopian light roasts and precision brewing. Curator of the Sanctuary’s seasonal bean rotation.",
    icons: ["stars", "coffee", "psychology"]
  },
  {
    name: "Aria Sol",
    role: "Curator",
    badgeClass: "bg-surface-container-highest text-on-surface-variant",
    tenure: "Since 2021",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxd0qZHtP45MEXCxOUoHiPM7hr9C5UXAQ7W0PrDKRn8wTMNxRjiPcpqgr6yRKZUWDOeTFw36Uu45Fboe3vmhCUxRu7aLI1gDDjI0HvfmEXerM37qMyM_OLWphhfq9wRSHOAhf_4caLOvVmXqlHtoKjehM8dOsUbA_qkwrLrWOXQyALqvLXyFn0MdBBiEWv-CPARr_aORdQ0t1GxHG8fF95WJ1TM7MJQUwIoJML2Fwxwemaqwx_jUqGRXh5H7Xn8B0QN6x44bhA2Ful",
    description: "Roast Master focusing on thermal profiling and artisanal sustainability. Oversees all small-batch roastery operations.",
    icons: ["thermostat", "eco"]
  },
  {
    name: "Soren Vane",
    role: "Apprentice",
    badgeClass: "bg-secondary-container text-on-secondary-container",
    tenure: "New Entry",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsYbFxfMggmUpYMzbwmf8T49JcfQ_YbHLDUnw1C_brUvzFBiiy3vGbWWPqawjCCuz1U_ICphYTHPRIzCJj_wyPrM4YYGhrRxDiQUD3E5S2XYrQGR_By19eeWIco1HLZ1iZMgLhFrGaNXDQ2Zxy70wGSU5Mpq6GNXg1dHZpP6cnvZj7GtiS9mdjW2V648W3Ddv8V1K5UB28iiEhQ1iJpoXqSuyYPE0dNWC2vuKC6ZwwBRt3LUW2YRErAwXxtlSVUU0841NX003QUqWD",
    description: "Developing mastery in milk texture and guest relations. Currently shadowing the Bar team for evening sessions.",
    icons: ["school"]
  }
];

// Query DOM
const teamDirectory = document.getElementById("team-directory");
const searchInput = document.getElementById("team-search");
const header = document.querySelector('header');

// Fungsi Render Kartu Profil
function renderTeam(filteredMembers) {
  teamDirectory.innerHTML = "";
  
  if (filteredMembers.length === 0) {
    teamDirectory.innerHTML = `
      <div class="col-span-full py-12 text-center text-on-surface-variant opacity-60 font-body-md">
        No collective members match your search criteria.
      </div>
    `;
    return;
  }

  filteredMembers.forEach(member => {
    const card = document.createElement("div");
    card.className = "group border border-outline-muted p-8 bg-paper-white hover:border-deep-espresso transition-all duration-500 transform-gpu";
    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s ease';
    
    // Konversi array icon string ke elemen HTML
    const iconsHtml = member.icons
      .map(icon => `<span class="material-symbols-outlined text-sm opacity-30" data-icon="${icon}">${icon}</span>`)
      .join("");

    card.innerHTML = `
      <div class="flex items-start justify-between mb-8">
        <div class="w-24 h-24 overflow-hidden rounded-full border border-outline-muted">
          <img class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src="${member.image}" alt="${member.name}" />
        </div>
        <div class="text-right">
          <span class="${member.badgeClass} px-3 py-1 font-label-caps text-label-caps">${member.role}</span>
          <p class="font-label-md text-label-md mt-2 text-on-surface-variant">${member.tenure}</p>
        </div>
      </div>
      <h4 class="font-headline-md text-headline-md text-deep-espresso">${member.name}</h4>
      <p class="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">${member.description}</p>
      <div class="mt-8 flex gap-3">
        ${iconsHtml}
      </div>
    `;

    // Elevasi Micro-interaction
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });

    teamDirectory.appendChild(card);
  });
}

// Handler Pencarian Real-time
function handleSearch() {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = teamMembers.filter(member => 
    member.name.toLowerCase().includes(query) || 
    member.role.toLowerCase().includes(query) || 
    member.description.toLowerCase().includes(query)
  );
  renderTeam(filtered);
}

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', () => {
  renderTeam(teamMembers);

  // Pasang event pencarian
  searchInput.addEventListener('input', handleSearch);

  // Efek bayangan TopAppBar saat halaman digulir
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header.classList.add('shadow-sm', 'bg-paper-white/95');
    } else {
      header.classList.remove('shadow-sm', 'bg-paper-white/80');
    }
  });
});