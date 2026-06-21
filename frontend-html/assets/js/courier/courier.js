document.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.querySelector('.timer-progress');
  const manualBtn = document.getElementById('manual-refresh');

  // Auto-refresh progress handling
  if (manualBtn && progressBar) {
    manualBtn.addEventListener('click', () => {
      progressBar.style.animation = 'none';
      progressBar.offsetHeight; // Trigger reflow
      progressBar.style.animation = null;
      
      manualBtn.style.transform = 'rotate(180deg)';
      setTimeout(() => manualBtn.style.transform = 'rotate(0deg)', 300);
      
      console.log("Refreshed courier state at: " + new Date().toLocaleTimeString());
    });
  }

  // Micro-interaction scaling constraints for interactive selectors
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'scale(0.98)';
    });
    btn.addEventListener('mouseup', () => {
      btn.style.transform = 'scale(1)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });
  });

  // Toggle layout structure conditionally based on data sets
  const checkEmptyStates = () => {
    const grid = document.getElementById('available-grid');
    const empty = document.getElementById('available-empty-state');
    if (grid && empty) {
      if (grid.children.length === 0) {
        grid.classList.add('hidden');
        empty.classList.remove('hidden');
      } else {
        grid.classList.remove('hidden');
        empty.classList.add('hidden');
      }
    }
  };

  checkEmptyStates();
});