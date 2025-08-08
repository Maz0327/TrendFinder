// Screenshot Selection Tool for Content Radar Chrome Extension
(function() {
  'use strict';
  
  // Prevent multiple instances
  if (window.contentRadarScreenshotSelector) {
    return;
  }
  
  window.contentRadarScreenshotSelector = true;
  
  let isSelecting = false;
  let startX, startY, endX, endY;
  let selectionBox = null;
  let overlay = null;
  
  // Create overlay for screenshot selection
  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'content-radar-screenshot-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      z-index: 999999;
      cursor: crosshair;
    `;
    
    // Create selection box
    selectionBox = document.createElement('div');
    selectionBox.id = 'content-radar-selection-box';
    selectionBox.style.cssText = `
      position: absolute;
      border: 2px solid #0066FF;
      background: rgba(0, 102, 255, 0.1);
      display: none;
      pointer-events: none;
    `;
    
    // Create instruction text
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 1000000;
    `;
    instructions.textContent = 'Click and drag to select area for screenshot. Press ESC to cancel.';
    
    overlay.appendChild(selectionBox);
    overlay.appendChild(instructions);
    document.body.appendChild(overlay);
    
    // Add event listeners
    overlay.addEventListener('mousedown', startSelection);
    overlay.addEventListener('mousemove', updateSelection);
    overlay.addEventListener('mouseup', endSelection);
    document.addEventListener('keydown', handleKeydown);
  }
  
  function startSelection(e) {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    
    selectionBox.style.display = 'block';
    selectionBox.style.left = startX + 'px';
    selectionBox.style.top = startY + 'px';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    
    e.preventDefault();
  }
  
  function updateSelection(e) {
    if (!isSelecting) return;
    
    endX = e.clientX;
    endY = e.clientY;
    
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    
    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
  }
  
  function endSelection(e) {
    if (!isSelecting) return;
    
    isSelecting = false;
    
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    
    // Minimum selection size
    if (width < 10 || height < 10) {
      cleanup();
      return;
    }
    
    // Capture the selected area
    captureSelectedArea({
      x: left,
      y: top,
      width: width,
      height: height
    });
  }
  
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      cleanup();
    }
  }
  
  async function captureSelectedArea(selection) {
    try {
      // Get page dimensions for scaling
      const pageWidth = window.innerWidth;
      const pageHeight = window.innerHeight;
      
      // Create capture data
      const captureData = {
        type: 'screenshot',
        title: document.title || 'Screenshot Capture',
        url: window.location.href,
        selection: {
          x: selection.x,
          y: selection.y,
          width: selection.width,
          height: selection.height,
          pageWidth: pageWidth,
          pageHeight: pageHeight
        },
        timestamp: new Date().toISOString()
      };
      
      // Send to background script for processing
      chrome.runtime.sendMessage({
        action: 'captureScreenshot',
        data: captureData
      }, (response) => {
        if (response && response.success) {
          showSuccessMessage('Screenshot captured successfully!');
        } else {
          showErrorMessage('Screenshot capture failed');
        }
      });
      
    } catch (error) {
      console.error('Screenshot capture error:', error);
      showErrorMessage('Screenshot capture error');
    }
    
    cleanup();
  }
  
  function showSuccessMessage(message) {
    const notification = createNotification(message, 'success');
    setTimeout(() => notification.remove(), 3000);
  }
  
  function showErrorMessage(message) {
    const notification = createNotification(message, 'error');
    setTimeout(() => notification.remove(), 3000);
  }
  
  function createNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10B981' : '#EF4444'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000001;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    return notification;
  }
  
  function cleanup() {
    isSelecting = false;
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    if (selectionBox) {
      selectionBox = null;
    }
    document.removeEventListener('keydown', handleKeydown);
    window.contentRadarScreenshotSelector = false;
  }
  
  // Initialize
  createOverlay();
})();