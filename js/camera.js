function initCamera(windowElement) {
  let stream = null;
  let currentFacingMode = 'environment';
  let isFlashOn = false;
  
  const video = windowElement.querySelector('#cam-video');
  const canvas = windowElement.querySelector('#cam-canvas');
  const container = windowElement.querySelector('#cam-container');
  const preview = windowElement.querySelector('#cam-preview');
  const previewImg = windowElement.querySelector('#cam-preview-img');
  const errorDiv = windowElement.querySelector('#cam-error');
  const statusDiv = windowElement.querySelector('#cam-status');
  const resolutionSpan = windowElement.querySelector('#cam-resolution');
  const storageSpan = windowElement.querySelector('#cam-storage');
  
  // Event listeners
  windowElement.querySelector('#cam-capture').addEventListener('click', capturePhoto);
  windowElement.querySelector('#cam-switch').addEventListener('click', switchCamera);
  windowElement.querySelector('#cam-flash').addEventListener('click', toggleFlash);
  windowElement.querySelector('#cam-cancel').addEventListener('click', cancelPreview);
  windowElement.querySelector('#cam-save').addEventListener('click', savePhoto);
  
  // Initialize camera
  initCameraStream();
  
  function initCameraStream() {
    statusDiv.textContent = 'Initializing...';
    
    const constraints = {
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };
    
    navigator.mediaDevices.getUserMedia(constraints)
      .then((mediaStream) => {
        stream = mediaStream;
        video.srcObject = stream;
        errorDiv.classList.add('hidden');
        statusDiv.textContent = 'Ready';
        updateResolutionInfo();
      })
      .catch((error) => {
        console.error('Camera error:', error);
        errorDiv.classList.remove('hidden');
        statusDiv.textContent = 'Error: ' + error.message;
      });
  }
  
  function updateResolutionInfo() {
    if (stream) {
      const tracks = stream.getVideoTracks();
      if (tracks.length > 0) {
        const settings = tracks[0].getSettings();
        resolutionSpan.textContent = `${settings.width || 0} × ${settings.height || 0}`;
      }
    }
  }
  
  function capturePhoto() {
    if (!stream) return;
    
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Show preview
    previewImg.src = canvas.toDataURL('image/png');
    preview.classList.remove('hidden');
    statusDiv.textContent = 'Preview';
  }
  
  function cancelPreview() {
    preview.classList.add('hidden');
    statusDiv.textContent = 'Ready';
  }
  
  function savePhoto() {
    if (!previewImg.src) return;
    
    // Create download link
    const link = document.createElement('a');
    const date = new Date();
    const filename = `🍌Banana OS-photo-${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.png`;
    
    link.download = filename;
    link.href = previewImg.src;
    link.click();
    
    // Return to camera view
    cancelPreview();
    statusDiv.textContent = 'Photo saved';
    setTimeout(() => {
      if (stream) statusDiv.textContent = 'Ready';
    }, 2000);
  }
  
  function switchCamera() {
    if (!stream) return;
    
    // Stop current stream
    stream.getTracks().forEach(track => track.stop());
    
    // Switch facing mode
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    
    // Restart with new facing mode
    initCameraStream();
  }
  
  function toggleFlash() {
    // This is a placeholder - actual flash control requires specific device support
    isFlashOn = !isFlashOn;
    const flashBtn = windowElement.querySelector('#cam-flash');
    
    if (isFlashOn) {
      flashBtn.innerHTML = '<i class="fas fa-bolt text-yellow-400"></i>';
      statusDiv.textContent = 'Flash ON (simulated)';
    } else {
      flashBtn.innerHTML = '<i class="fas fa-bolt"></i>';
      statusDiv.textContent = 'Flash OFF';
    }
  }
  
  // Clean up when window closes
  windowElement.addEventListener('beforeunload', () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  });
}