// Window management
let zIndex = 10;

function setResponsiveWindowSize(windowElement) {
    const screenWidth = window.innerWidth;
    
    if (screenWidth <= 320) {
        windowElement.style.width = '95vw';
        windowElement.style.height = '70vh';
    } else if (screenWidth <= 480) {
        windowElement.style.width = '90vw';
        windowElement.style.height = '75vh';
    } else if (screenWidth <= 768) {
        windowElement.style.width = '85vw';
        windowElement.style.height = '80vh';
    } else {
        windowElement.style.width = '600px';
        windowElement.style.height = '400px';
    }
}

function centerWindowOnMobile(windowElement) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    if (screenWidth <= 768) {
        const windowWidth = windowElement.offsetWidth;
        const windowHeight = windowElement.offsetHeight;
        
        windowElement.style.left = `${(screenWidth - windowWidth) / 2}px`;
        windowElement.style.top = `${(screenHeight - windowHeight) / 3}px`;
    }
}

function makeDraggable(element) {
    const header = element.querySelector('.window-header');
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    
    // Mouse events
    header.onmousedown = dragMouseDown;
    
    // Touch events for mobile
    header.ontouchstart = dragTouchStart;
    
    function dragMouseDown(e) {
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function dragTouchStart(e) {
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
        document.ontouchend = closeDragElement;
        document.ontouchmove = elementDragTouch;
    }
    
    function startDrag(clientX, clientY) {
        // Bring to front
        element.style.zIndex = ++zIndex;
        
        // Get the cursor position at startup
        pos3 = clientX;
        pos4 = clientY;
        
        isDragging = true;
        element.classList.add('dragging');
    }
    
    function elementDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        updatePosition(e.clientX, e.clientY);
    }
    
    function elementDragTouch(e) {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
    }
    
    function updatePosition(clientX, clientY) {
        // Calculate the new cursor position
        pos1 = pos3 - clientX;
        pos2 = pos4 - clientY;
        pos3 = clientX;
        pos4 = clientY;
        
        // Set the element's new position with boundary checks
        const newTop = element.offsetTop - pos2;
        const newLeft = element.offsetLeft - pos1;
        
        // Boundary checking to keep window within viewport
        const maxTop = window.innerHeight - element.offsetHeight;
        const maxLeft = window.innerWidth - element.offsetWidth;
        
        element.style.top = Math.max(0, Math.min(maxTop, newTop)) + "px";
        element.style.left = Math.max(0, Math.min(maxLeft, newLeft)) + "px";
    }
    
    function closeDragElement() {
        isDragging = false;
        element.classList.remove('dragging');
        
        // Stop moving
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;
    }
}

function minimizeWindow(button) {
    const windowElement = button.closest('.window');
    windowElement.classList.add('hidden');
}

function maximizeWindow(button) {
    const windowElement = button.closest('.window');
    const isMaximized = windowElement.classList.contains('maximized');
    
    if (isMaximized) {
        windowElement.classList.remove('maximized');
        // Restore to responsive size
        setResponsiveWindowSize(windowElement);
        centerWindowOnMobile(windowElement);
    } else {
        windowElement.classList.add('maximized');
        const taskbarHeight = document.querySelector('.absolute.bottom-0').offsetHeight || 44;
        windowElement.style.width = '100vw';
        windowElement.style.height = `calc(100vh - ${taskbarHeight}px)`; // Subtract taskbar height
        windowElement.style.top = '0';
        windowElement.style.left = '0';
    }
}

function closeWindow(button) {
    const windowElement = button.closest('.window');
    windowElement.remove();
}
