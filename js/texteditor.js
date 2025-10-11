// Text Editor functionality
function initTextEditor(windowElement) {
  const textArea = windowElement.querySelector('#text-editor-area');
  
  // Auto-resize text area to fill available space
  function resizeTextArea() {
    textArea.style.height = 'auto';
    textArea.style.height = (textArea.scrollHeight) + 'px';
  }
  
  textArea.addEventListener('input', resizeTextArea);
  resizeTextArea();
}