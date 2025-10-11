// Context menu
function showContextMenu(e, type) {
  e.preventDefault();
  const contextMenu = document.getElementById('context-menu');
  contextMenu.style.left = `${e.clientX}px`;
  contextMenu.style.top = `${e.clientY}px`;
  contextMenu.classList.add('active');
  
  // Close when clicking elsewhere
  const closeContextMenu = () => {
    contextMenu.classList.remove('active');
    document.removeEventListener('click', closeContextMenu);
  };
  
  document.addEventListener('click', closeContextMenu);
}

// Close context menu when clicking elsewhere
document.addEventListener('click', () => {
  const contextMenu = document.getElementById('context-menu');
  if (contextMenu.classList.contains('active')) {
    contextMenu.classList.remove('active');
  }
});