// Content Script for Content Radar Chrome Extension
let isSelecting = false;
let selectionOverlay = null;
let selectionBox = null;
let startX = 0;
let startY = 0;
let voiceIndicator = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'startScreenSelection':
      startScreenSelection();
      break;
    case 'startVoiceRecording':
      startVoiceRecording();
      break;
    case 'stopVoiceRecording':
      stopVoiceRecording();
      break;
  }
});

// Screen selection functionality
function startScreenSelection() {
  if (isSelecting) return;
  
  isSelecting = true;
  
  // Create overlay
  selectionOverlay = document.createElement('div');
  selectionOverlay.className = 'content-radar-overlay';
  document.body.appendChild(selectionOverlay);
  
  // Create selection box
  selectionBox = document.createElement('div');
  selectionBox.className = 'content-radar-selection';
  selectionOverlay.appendChild(selectionBox);
  
  // Mouse event handlers
  selectionOverlay.addEventListener('mousedown', handleMouseDown);
  selectionOverlay.addEventListener('mousemove', handleMouseMove);
  selectionOverlay.addEventListener('mouseup', handleMouseUp);
  
  // Keyboard handler for escape
  document.addEventListener('keydown', handleEscape);
}

function handleMouseDown(e) {
  startX = e.clientX;
  startY = e.clientY;
  
  selectionBox.style.left = startX + 'px';
  selectionBox.style.top = startY + 'px';
  selectionBox.style.width = '0px';
  selectionBox.style.height = '0px';
  selectionBox.style.display = 'block';
}

function handleMouseMove(e) {
  if (!selectionBox.style.display || selectionBox.style.display === 'none') return;
  
  const currentX = e.clientX;
  const currentY = e.clientY;
  
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  
  selectionBox.style.left = left + 'px';
  selectionBox.style.top = top + 'px';
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
}

function handleMouseUp(e) {
  if (!selectionBox.style.display || selectionBox.style.display === 'none') return;
  
  const rect = selectionBox.getBoundingClientRect();
  
  if (rect.width > 10 && rect.height > 10) {
    // Show toolbar
    showSelectionToolbar(rect);
  } else {
    // Cancel if selection too small
    cancelSelection();
  }
}

function handleEscape(e) {
  if (e.key === 'Escape' && isSelecting) {
    cancelSelection();
  }
}

function showSelectionToolbar(rect) {
  const toolbar = document.createElement('div');
  toolbar.className = 'content-radar-toolbar';
  
  // Position toolbar below selection
  toolbar.style.left = rect.left + 'px';
  toolbar.style.top = (rect.bottom + 10) + 'px';
  
  // Capture button
  const captureBtn = document.createElement('button');
  captureBtn.className = 'primary';
  captureBtn.textContent = 'Capture';
  captureBtn.onclick = () => captureSelection(rect);
  
  // Cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = cancelSelection;
  
  toolbar.appendChild(captureBtn);
  toolbar.appendChild(cancelBtn);
  
  document.body.appendChild(toolbar);
}

function captureSelection(rect) {
  // Send area coordinates to background script
  chrome.runtime.sendMessage({
    action: 'captureScreenshot',
    area: {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height
    }
  }, (response) => {
    if (response.success) {
      showToast('Screenshot captured successfully!', 'success');
    } else {
      showToast('Failed to capture screenshot', 'error');
    }
    cancelSelection();
  });
}

function cancelSelection() {
  isSelecting = false;
  
  // Remove all selection elements
  if (selectionOverlay) {
    selectionOverlay.remove();
    selectionOverlay = null;
  }
  
  if (selectionBox) {
    selectionBox = null;
  }
  
  // Remove toolbar if exists
  const toolbar = document.querySelector('.content-radar-toolbar');
  if (toolbar) {
    toolbar.remove();
  }
  
  // Remove event listeners
  document.removeEventListener('keydown', handleEscape);
}

// Voice recording UI
function startVoiceRecording() {
  if (voiceIndicator) return;
  
  voiceIndicator = document.createElement('div');
  voiceIndicator.className = 'content-radar-voice-indicator';
  voiceIndicator.innerHTML = 'Recording...';
  document.body.appendChild(voiceIndicator);
  
  // Start recording through background script
  chrome.runtime.sendMessage({ action: 'startVoiceRecording' }, (response) => {
    if (!response.success) {
      showToast('Failed to start recording', 'error');
      stopVoiceRecording();
    }
  });
  
  // Add click to stop
  voiceIndicator.addEventListener('click', stopVoiceRecording);
}

function stopVoiceRecording() {
  if (!voiceIndicator) return;
  
  voiceIndicator.remove();
  voiceIndicator = null;
  
  // Stop recording through background script
  chrome.runtime.sendMessage({ action: 'stopVoiceRecording' }, (response) => {
    if (response.success) {
      showToast('Voice note saved!', 'success');
    } else {
      showToast('Failed to save voice note', 'error');
    }
  });
}

// Toast notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `content-radar-toast ${type}`;
  
  const icon = document.createElement('span');
  icon.textContent = type === 'success' ? '✓' : '✗';
  
  const text = document.createElement('span');
  text.textContent = message;
  
  toast.appendChild(icon);
  toast.appendChild(text);
  
  document.body.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Auto-detect content for smart capture
function detectContentType() {
  const url = window.location.href;
  const hostname = window.location.hostname;
  
  // Social media detection
  if (hostname.includes('instagram.com')) {
    return detectInstagramContent();
  } else if (hostname.includes('youtube.com')) {
    return detectYouTubeContent();
  } else if (hostname.includes('tiktok.com')) {
    return detectTikTokContent();
  } else if (hostname.includes('linkedin.com')) {
    return detectLinkedInContent();
  } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return detectTwitterContent();
  }
  
  return null;
}

// Platform-specific content detection
function detectInstagramContent() {
  // Check if on a post page
  if (window.location.pathname.includes('/p/') || window.location.pathname.includes('/reel/')) {
    const postId = window.location.pathname.split('/')[2];
    return {
      platform: 'instagram',
      type: 'post',
      id: postId,
      url: window.location.href
    };
  }
  return null;
}

function detectYouTubeContent() {
  // Check if on a video page
  if (window.location.pathname === '/watch') {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    return {
      platform: 'youtube',
      type: 'video',
      id: videoId,
      url: window.location.href
    };
  }
  return null;
}

function detectTikTokContent() {
  // Check if on a video page
  if (window.location.pathname.includes('/video/')) {
    const videoId = window.location.pathname.split('/').pop();
    return {
      platform: 'tiktok',
      type: 'video',
      id: videoId,
      url: window.location.href
    };
  }
  return null;
}

function detectLinkedInContent() {
  // Check if on a post page
  if (window.location.pathname.includes('/posts/')) {
    return {
      platform: 'linkedin',
      type: 'post',
      url: window.location.href
    };
  }
  return null;
}

function detectTwitterContent() {
  // Check if on a tweet page
  if (window.location.pathname.includes('/status/')) {
    const tweetId = window.location.pathname.split('/').pop();
    return {
      platform: 'twitter',
      type: 'tweet',
      id: tweetId,
      url: window.location.href
    };
  }
  return null;
}

// Smart highlight on hover
let highlightedElement = null;
let highlightBox = null;

function enableSmartHighlight() {
  document.addEventListener('mouseover', handleElementHover);
  document.addEventListener('click', handleElementClick);
}

function handleElementHover(e) {
  // Skip if already selecting or on our UI elements
  if (isSelecting || e.target.closest('.content-radar-overlay')) return;
  
  // Only highlight meaningful content elements
  const element = e.target.closest('article, .post, .tweet, .video-container, [role="article"]');
  
  if (element && element !== highlightedElement) {
    highlightElement(element);
  }
}

function handleElementClick(e) {
  if (!highlightedElement || e.target.closest('.content-radar-highlight')) return;
  
  // Check if Ctrl/Cmd + Shift is pressed
  if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();
    
    captureElement(highlightedElement);
  }
}

function highlightElement(element) {
  // Remove previous highlight
  if (highlightBox) {
    highlightBox.remove();
  }
  
  highlightedElement = element;
  const rect = element.getBoundingClientRect();
  
  highlightBox = document.createElement('div');
  highlightBox.className = 'content-radar-highlight';
  highlightBox.style.left = rect.left + 'px';
  highlightBox.style.top = rect.top + 'px';
  highlightBox.style.width = rect.width + 'px';
  highlightBox.style.height = rect.height + 'px';
  
  document.body.appendChild(highlightBox);
}

function captureElement(element) {
  const content = element.innerText || element.textContent;
  const images = Array.from(element.querySelectorAll('img')).map(img => img.src);
  
  chrome.runtime.sendMessage({
    action: 'capture',
    data: {
      url: window.location.href,
      title: document.title,
      content: content,
      images: images,
      type: 'element',
      elementType: element.tagName.toLowerCase()
    }
  }, (response) => {
    if (response.success) {
      showToast('Element captured!', 'success');
    } else {
      showToast('Failed to capture element', 'error');
    }
  });
}

// Initialize smart features on supported sites
const contentInfo = detectContentType();
if (contentInfo) {
  console.log('Content Radar: Detected', contentInfo.platform, 'content');
  enableSmartHighlight();
}