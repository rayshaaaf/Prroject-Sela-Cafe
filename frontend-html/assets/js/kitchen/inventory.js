// Database State Lokal Sementara
let inventoryData = [
  { id: 1, name: "Sela Signature Espresso", category: "House Blend / Dark Roast", icon: "coffee", stock: 85.0, unit: "kg", progress: 65, lastAudit: "Nov 02, 2023", status: "Optimal" },
  { id: 2, name: "Heirloom Tomato & Basil", category: "Fresh Produce / Local Farm", icon: "nutrition", stock: 12.0, unit: "units", progress: 15, lastAudit: "Nov 04, 2023", status: "Critical" },
  { id: 3, name: "Premium Organic Oat Milk", category: "Dairy Alternative / Barista Grade", icon: "water_drop", stock: 120.0, unit: "liters", progress: 80, lastAudit: "Nov 01, 2023", status: "Optimal" },
  { id: 4, name: "Madagascar Vanilla Syrup", category: "Beverage / Infusion", icon: "liquor", stock: 45.0, unit: "units", progress: 50, lastAudit: "Oct 30, 2023", status: "Optimal" },
  { id: 5, name: "Artisanal Sourdough Batches", category: "Bakery / Daily Fresh", icon: "bakery_dining", stock: 18.0, unit: "units", progress: 40, lastAudit: "Nov 05, 2023", status: "Optimal" }
];

let filteredData = [...inventoryData];
let currentPage = 1;
const rowsPerPage = 3; 
let currentFilter = "all"; 

// DOM Queries
const tableBody = document.getElementById("inventory-table-body");
const searchInput = document.getElementById("search-input");
const btnFilter = document.getElementById("btn-filter");
const filterText = document.getElementById("filter-text");
const pageStartSpan = document.getElementById("page-start");
const pageEndSpan = document.getElementById("page-end");
const totalElementsSpan = document.getElementById("total-elements");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const pageNumbersContainer = document.getElementById("page-numbers");

// Modal DOM Queries
const formModal = document.getElementById("form-modal");
const modalTitle = document.getElementById("modal-title");
const provisionForm = document.getElementById("provision-form");
const inputId = document.getElementById("item-id");
const inputName = document.getElementById("item-name");
const inputCategory = document.getElementById("item-category");
const inputStock = document.getElementById("item-stock");
const inputUnit = document.getElementById("item-unit");
const inputIcon = document.getElementById("item-icon");
const inputStatus = document.getElementById("item-status");
const btnCreateTrigger = document.getElementById("btn-create-trigger");
const btnCloseModal = document.getElementById("btn-close-modal");
const modalBackdrop = document.getElementById("modal-backdrop");
const btnDeleteItem = document.getElementById("btn-delete-item");

// ==========================================
// ABSTRAKSI CRUD - KELOLA DISINI SAAT KONEKSI KE API BE
// ==========================================

// [R] - READ DATA
function renderTable() {
  tableBody.innerHTML = "";
  if (filteredData.length === 0) {
    tableBody.innerHTML = `<div class="p-8 text-center text-on-surface-variant opacity-60">No records found.</div>`;
    updatePaginationControls();
    return;
  }

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  paginatedData.forEach(item => {
    const isCritical = item.status === "Critical";
    const row = document.createElement("div");
    row.className = `grid grid-cols-12 px-8 py-8 items-center group hover:bg-surface-container-lowest transition-colors ${isCritical ? 'bg-error-container/5' : ''}`;
    row.innerHTML = `
      <div class="col-span-4 flex items-center gap-4">
        <div class="w-12 h-12 bg-heritage-cream/40 flex items-center justify-center"><span class="material-symbols-outlined text-deep-espresso">${item.icon}</span></div>
        <div>
          <h5 class="font-headline-md text-deep-espresso text-xl">${item.name}</h5>
          <p class="font-label-md text-on-surface-variant">${item.category}</p>
        </div>
      </div>
      <div class="col-span-2 text-center">
        <span class="${isCritical ? 'font-headline-md text-error' : 'font-headline-md'}">${item.stock.toFixed(1)}</span><span class="text-xs ml-1 opacity-60">${item.unit}</span>
        <div class="w-full bg-surface-container-high h-1 mt-2"><div class="${isCritical ? 'bg-error' : 'bg-deep-espresso'} h-full" style="width: ${item.progress}%"></div></div>
      </div>
      <div class="col-span-2 text-center text-on-surface-variant font-label-md">${item.lastAudit}</div>
      <div class="col-span-2 text-center"><span class="px-3 py-1 font-label-caps text-[10px] ${isCritical ? 'bg-error-container text-on-error-container' : 'bg-moss-green/10 text-moss-green'}">${item.status}</span></div>
      <div class="col-span-2 flex justify-end gap-4">
        <button class="btn-edit text-on-surface-variant hover:text-deep-espresso transition-colors font-label-md uppercase tracking-tighter underline">Edit</button>
        <button class="text-on-surface-variant hover:text-deep-espresso transition-colors font-label-md"><span class="material-symbols-outlined">more_vert</span></button>
      </div>
    `;

    row.querySelector(".btn-edit").addEventListener("click", () => openModalForEdit(item.id));
    row.addEventListener('mouseenter', () => { row.style.transform = 'translateX(8px)'; row.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'; });
    row.addEventListener('mouseleave', () => { row.style.transform = 'translateX(0)'; });
    tableBody.appendChild(row);
  });

  pageStartSpan.textContent = startIndex + 1;
  pageEndSpan.textContent = endIndex;
  totalElementsSpan.textContent = filteredData.length;
  updatePaginationControls();
}

// [C] & [U] - CREATE & UPDATE DATA ACTION
function saveProvision(payload, id = null) {
  // NANTI: Tinggal ganti isi block ini dengan `fetch('/api/provisions', { method: id ? 'PUT' : 'POST', ... })`
  if (!id) {
    // Jalankan Simulasi Create Lokal
    inventoryData.unshift({ id: Date.now(), ...payload });
  } else {
    // Jalankan Simulasi Update Lokal
    inventoryData = inventoryData.map(item => item.id === id ? { ...item, ...payload } : item);
  }
  filterInventory();
}

// [D] - DELETE DATA ACTION
function deleteProvision(id) {
  if (confirm("Are you sure you want to permanently purge this provision?")) {
    // NANTI: Tinggal ganti dengan `fetch('/api/provisions/' + id, { method: 'DELETE' })`
    inventoryData = inventoryData.filter(item => item.id !== id);
    toggleModal(false);
    filterInventory();
  }
}

// ==========================================
// MANIPULASI TAMPILAN / UI LOGIC
// ==========================================

function openModalForCreate() {
  modalTitle.textContent = "Add Provision";
  provisionForm.reset();
  inputId.value = "";
  btnDeleteItem.classList.add("hidden"); // Sembunyikan tombol delete jika create
  toggleModal(true);
}

function openModalForEdit(id) {
  const item = inventoryData.find(i => i.id === id);
  if (!item) return;

  modalTitle.textContent = "Modify Provision";
  inputId.value = item.id;
  inputName.value = item.name;
  inputCategory.value = item.category;
  inputStock.value = item.stock;
  inputUnit.value = item.unit;
  inputIcon.value = item.icon;
  inputStatus.value = item.status;
  
  btnDeleteItem.classList.remove("hidden"); // Tampilkan tombol delete di mode edit
  toggleModal(true);
}

function toggleModal(show) {
  const container = formModal.querySelector(".transform");
  if (show) {
    formModal.classList.remove("invisible", "opacity-0");
    container.classList.replace("scale-95", "scale-100");
  } else {
    formModal.classList.add("invisible", "opacity-0");
    container.classList.replace("scale-100", "scale-95");
  }
}

function handleFormSubmit(e) {
  e.preventDefault();
  const idValue = inputId.value;
  const stock = parseFloat(inputStock.value);
  
  const payload = {
    name: inputName.value.trim(),
    category: inputCategory.value.trim(),
    stock: stock,
    unit: inputUnit.value.trim(),
    icon: inputIcon.value,
    status: inputStatus.value,
    progress: Math.min(Math.round((stock / 150) * 100), 100),
    lastAudit: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  };

  saveProvision(payload, idValue ? parseInt(idValue) : null);
  toggleModal(false);
}

function updatePaginationControls() {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  btnPrev.disabled = currentPage === 1;
  btnNext.disabled = currentPage === totalPages;
  pageNumbersContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `px-3 py-1 border text-xs transition-colors ${i === currentPage ? 'border-deep-espresso bg-deep-espresso text-white' : 'border-outline-muted text-on-surface-variant hover:border-deep-espresso'}`;
    btn.textContent = i;
    btn.addEventListener("click", () => { currentPage = i; renderTable(); });
    pageNumbersContainer.appendChild(btn);
  }
}

function filterInventory() {
  const query = searchInput.value.toLowerCase().trim();
  filteredData = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
    const matchesStatus = currentFilter === "all" || item.status.toLowerCase() === currentFilter;
    return matchesSearch && matchesStatus;
  });
  currentPage = 1;
  renderTable();
}

// Event Bindings
document.addEventListener("DOMContentLoaded", () => {
  renderTable();
  searchInput.addEventListener("input", filterInventory);
  
  btnFilter.addEventListener("click", () => {
    const states = { all: ["optimal", "Optimal Stock"], optimal: ["critical", "Critical Stock"], critical: ["all", "All Stock"] };
    [currentFilter, filterText.textContent] = states[currentFilter];
    filterInventory();
  });

  btnCreateTrigger.addEventListener("click", openModalForCreate);
  btnCloseModal.addEventListener("click", () => toggleModal(false));
  modalBackdrop.addEventListener("click", () => toggleModal(false));
  provisionForm.addEventListener("submit", handleFormSubmit);
  btnDeleteItem.addEventListener("click", () => deleteProvision(parseInt(inputId.value)));

  btnPrev.addEventListener("click", () => { if (currentPage > 1) { currentPage--; renderTable(); } });
  btnNext.addEventListener("click", () => { if (currentPage < Math.ceil(filteredData.length / rowsPerPage)) { currentPage++; renderTable(); } });

  // Button micro-interaction styling scale
  document.body.addEventListener('mousedown', (e) => { const b = e.target.closest('button'); if (b) b.classList.add('scale-95'); });
  const reset = (e) => { const b = e.target.closest('button'); if (b) b.classList.remove('scale-95'); };
  document.body.addEventListener('mouseup', reset);
  document.body.addEventListener('mouseleave', reset);
});