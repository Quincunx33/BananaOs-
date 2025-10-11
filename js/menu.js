// Start menu toggle
function toggleStartMenu() {
  const startMenu = document.getElementById('start-menu');
  startMenu.classList.toggle('hidden');
}

// Close start menu when clicking elsewhere
document.addEventListener('click', (e) => {
  if (!e.target.closest('#start-button') && !e.target.closest('#start-menu')) {
    document.getElementById('start-menu').classList.add('hidden');
  }
});