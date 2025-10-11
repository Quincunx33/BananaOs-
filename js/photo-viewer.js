function initApp(windowElement, appId) {
    console.log('Initializing app:', appId, windowElement);
    if (!windowElement) {
        console.error('windowElement not provided');
        return;
    }
    switch (appId) {
        case 'photo-viewer':
            if (typeof initPhotoViewer === 'function') {
                initPhotoViewer(windowElement);
            } else {
                console.error('initPhotoViewer function not found');
            }
            break;
            // অন্যান্য কেস...
    }
}





function initPhotoViewer(windowElement) {
    console.log('Photo Viewer Initialized', windowElement);
    if (!windowElement) {
        console.error('windowElement is null or undefined');
        return;
    }
    const images = [];
    let currentIndex = -1;
    let zoomLevel = 1;
    let rotation = 0;
    let isSlideshowActive = false;
    let slideshowInterval;
    
    const container = windowElement.querySelector('#pv-container');
    const imageElement = windowElement.querySelector('#pv-image');
    const noImagesElement = windowElement.querySelector('#pv-no-images');
    const filenameElement = windowElement.querySelector('#pv-filename');
    const resolutionElement = windowElement.querySelector('#pv-resolution');
    const counterElement = windowElement.querySelector('#pv-counter');
    const fileInput = windowElement.querySelector('#pv-file-input');
    
    // Event listeners for buttons
    windowElement.querySelector('#pv-open').addEventListener('click', () => fileInput.click());
    windowElement.querySelector('#pv-prev').addEventListener('click', showPrevImage);
    windowElement.querySelector('#pv-next').addEventListener('click', showNextImage);
    windowElement.querySelector('#pv-zoom-in').addEventListener('click', () => adjustZoom(0.2));
    windowElement.querySelector('#pv-zoom-out').addEventListener('click', () => adjustZoom(-0.2));
    windowElement.querySelector('#pv-rotate').addEventListener('click', rotateImage);
    windowElement.querySelector('#pv-slideshow').addEventListener('click', toggleSlideshow);
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Handle keyboard navigation
    windowElement.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
        if (e.key === 'Escape') resetView();
    });
    
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            alert('Please select image files only');
            return;
        }
        
        images.length = 0;
        
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                images.push({
                    src: e.target.result,
                    name: file.name,
                    size: file.size
                });
                
                if (images.length === imageFiles.length) {
                    currentIndex = 0;
                    displayImage();
                }
            };
            reader.readAsDataURL(file);
        });
    }
    
    function displayImage() {
        if (images.length === 0 || currentIndex < 0) {
            noImagesElement.classList.remove('hidden');
            imageElement.classList.add('hidden');
            filenameElement.textContent = 'No file selected';
            resolutionElement.textContent = '-';
            counterElement.textContent = '0/0';
            return;
        }
        
        noImagesElement.classList.add('hidden');
        imageElement.classList.remove('hidden');
        
        const image = images[currentIndex];
        imageElement.src = image.src;
        filenameElement.textContent = image.name;
        counterElement.textContent = `${currentIndex + 1}/${images.length}`;
        
        resetView();
        
        imageElement.onload = () => {
            resolutionElement.textContent = `${imageElement.naturalWidth} × ${imageElement.naturalHeight}`;
        };
    }
    
    function showNextImage() {
        if (images.length <= 1) return;
        currentIndex = (currentIndex + 1) % images.length;
        displayImage();
    }
    
    function showPrevImage() {
        if (images.length <= 1) return;
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        displayImage();
    }
    
    function adjustZoom(delta) {
        zoomLevel = Math.max(0.1, Math.min(5, zoomLevel + delta));
        applyTransform();
    }
    
    function rotateImage() {
        rotation = (rotation + 90) % 360;
        applyTransform();
    }
    
    function applyTransform() {
        imageElement.style.transform = `scale(${zoomLevel}) rotate(${rotation}deg)`;
    }
    
    function resetView() {
        zoomLevel = 1;
        rotation = 0;
        applyTransform();
    }
    
    function toggleSlideshow() {
        const button = windowElement.querySelector('#pv-slideshow');
        
        if (isSlideshowActive) {
            clearInterval(slideshowInterval);
            button.innerHTML = '<i class="fas fa-play"></i>';
            isSlideshowActive = false;
        } else {
            if (images.length <= 1) {
                alert('Need at least 2 images for slideshow');
                return;
            }
            
            slideshowInterval = setInterval(showNextImage, 3000);
            button.innerHTML = '<i class="fas fa-pause"></i>';
            isSlideshowActive = true;
        }
    }
    
    displayImage();
}