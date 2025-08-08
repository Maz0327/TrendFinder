// Enhanced Content Script with Screenshot Selection from transferred code
console.log('Content Radar Enhanced - Loading advanced features...');

// Load screenshot selector script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/content/screenshot-selector.js');
script.onload = function() {
  console.log('Screenshot selector loaded');
};
document.head.appendChild(script);

// Voice recording indicator
let voiceIndicator = null;
let isRecording = false;

// Advanced Visual Feedback System
class VisualFeedback {
  constructor() {
    this.overlay = null;
    this.border = null;
    this.tooltip = null;
  }

  showPrecisionMode() {
    this.cleanup();
    
    this.overlay = document.createElement('div');
    this.overlay.className = 'content-radar-precision-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 235, 59, 0.05);
      pointer-events: none;
      z-index: 999999;
      animation: pulse 2s infinite;
    `;
    document.body.appendChild(this.overlay);
    this.showTooltip('Precision Mode: Click elements to capture');
  }

  showContextMode() {
    this.cleanup();
    
    this.border = document.createElement('div');
    this.border.className = 'content-radar-context-border';
    this.border.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border: 3px solid #3B82F6;
      border-radius: 8px;
      pointer-events: none;
      z-index: 999999;
      animation: glow 2s infinite;
      box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.2);
    `;
    document.body.appendChild(this.border);
    this.showTooltip('Context Mode: Capturing full page context');
  }

  showTooltip(message) {
    if (this.tooltip) this.tooltip.remove();
    
    this.tooltip = document.createElement('div');
    this.tooltip.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1F2937;
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      z-index: 9999999;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    `;
    this.tooltip.textContent = message;
    document.body.appendChild(this.tooltip);
    
    setTimeout(() => {
      if (this.tooltip) {
        this.tooltip.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => this.tooltip?.remove(), 300);
      }
    }, 3000);
  }

  cleanup() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.border) {
      this.border.remove();
      this.border = null;
    }
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }
}

// Enhanced Smart Capture System
class SmartCapture {
  constructor() {
    this.visualFeedback = new VisualFeedback();
    this.mode = 'precision';
    this.isActive = false;
    this.screenshotSelector = null;
  }

  toggleMode() {
    this.mode = this.mode === 'precision' ? 'context' : 'precision';
    this.updateVisualFeedback();
    
    // Send mode change to background
    chrome.runtime.sendMessage({
      action: 'modeChanged',
      mode: this.mode
    });
    
    return this.mode;
  }

  startCapture() {
    this.isActive = true;
    this.updateVisualFeedback();
  }

  stopCapture() {
    this.isActive = false;
    this.visualFeedback.cleanup();
  }

  updateVisualFeedback() {
    if (!this.isActive) return;
    
    if (this.mode === 'precision') {
      this.visualFeedback.showPrecisionMode();
    } else {
      this.visualFeedback.showContextMode();
    }
  }

  startScreenshotSelection() {
    if (window.ScreenshotSelector) {
      this.screenshotSelector = new window.ScreenshotSelector();
      this.screenshotSelector.start((selection) => {
        if (selection) {
          console.log('Screenshot selection:', selection);
          this.visualFeedback.showTooltip('Screenshot captured!');
        }
      });
    } else {
      console.error('Screenshot selector not loaded');
    }
  }

  startVoiceRecording() {
    if (isRecording) return;
    
    isRecording = true;
    voiceIndicator = document.createElement('div');
    voiceIndicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #EF4444;
      color: white;
      padding: 12px 20px;
      border-radius: 24px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      z-index: 9999999;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      animation: recording 1.5s infinite;
    `;
    voiceIndicator.innerHTML = `
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%; animation: blink 1s infinite;"></div>
      <span>Recording voice note...</span>
    `;
    document.body.appendChild(voiceIndicator);
    
    // Notify background script
    chrome.runtime.sendMessage({ action: 'startVoiceRecording' });
  }

  stopVoiceRecording() {
    if (!isRecording) return;
    
    isRecording = false;
    if (voiceIndicator) {
      voiceIndicator.remove();
      voiceIndicator = null;
    }
    
    // Notify background script
    chrome.runtime.sendMessage({ action: 'stopVoiceRecording' });
  }

  captureContent() {
    const content = {
      mode: this.mode,
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      selection: window.getSelection().toString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollY: window.scrollY
      },
      platform: this.detectPlatform()
    };

    if (this.mode === 'precision') {
      // Enhanced precision capture
      const selection = window.getSelection().toString();
      if (selection) {
        content.capturedText = selection;
        content.selectionContext = this.getSelectionContext();
      } else {
        const activeElement = document.activeElement;
        if (activeElement && activeElement !== document.body) {
          content.capturedElement = {
            tagName: activeElement.tagName,
            text: activeElement.textContent?.substring(0, 500),
            html: activeElement.outerHTML?.substring(0, 1000),
            attributes: this.getElementAttributes(activeElement)
          };
        }
      }
    } else {
      // Enhanced context mode capture
      content.pageContext = {
        metaDescription: document.querySelector('meta[name="description"]')?.content,
        metaKeywords: document.querySelector('meta[name="keywords"]')?.content,
        ogTitle: document.querySelector('meta[property="og:title"]')?.content,
        ogDescription: document.querySelector('meta[property="og:description"]')?.content,
        ogImage: document.querySelector('meta[property="og:image"]')?.content,
        headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
          level: h.tagName,
          text: h.textContent?.trim()
        })).slice(0, 10),
        images: Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt,
          title: img.title
        })).slice(0, 5),
        mainContent: document.querySelector('main')?.textContent?.substring(0, 3000) || 
                     document.querySelector('article')?.textContent?.substring(0, 3000) ||
                     document.body.textContent?.substring(0, 3000),
        links: Array.from(document.querySelectorAll('a[href]')).map(a => ({
          text: a.textContent?.trim(),
          href: a.href
        })).slice(0, 10)
      };
    }

    return content;
  }

  detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('instagram.com')) return 'instagram';
    if (hostname.includes('youtube.com')) return 'youtube';
    if (hostname.includes('tiktok.com')) return 'tiktok';
    if (hostname.includes('linkedin.com')) return 'linkedin';
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
    if (hostname.includes('reddit.com')) return 'reddit';
    return 'web';
  }

  getSelectionContext() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentElement = container.nodeType === 3 ? container.parentElement : container;
    
    return {
      parentTag: parentElement?.tagName,
      parentClass: parentElement?.className,
      parentId: parentElement?.id,
      precedingText: parentElement?.textContent?.substring(0, 100),
      followingText: parentElement?.textContent?.substring(-100)
    };
  }

  getElementAttributes(element) {
    const attrs = {};
    for (const attr of element.attributes) {
      attrs[attr.name] = attr.value;
    }
    return attrs;
  }
}

// Initialize
const smartCapture = new SmartCapture();

// Enhanced CSS with animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { opacity: 0.05; }
    50% { opacity: 0.1; }
    100% { opacity: 0.05; }
  }
  
  @keyframes glow {
    0% { box-shadow: 0 0 5px #3B82F6, inset 0 0 20px rgba(59, 130, 246, 0.2); }
    50% { box-shadow: 0 0 20px #3B82F6, 0 0 30px #3B82F6, inset 0 0 30px rgba(59, 130, 246, 0.3); }
    100% { box-shadow: 0 0 5px #3B82F6, inset 0 0 20px rgba(59, 130, 246, 0.2); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  @keyframes recording {
    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;
document.head.appendChild(style);

// Enhanced message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request.action);
  
  switch (request.action) {
    case 'startCapture':
      smartCapture.startCapture();
      sendResponse({ success: true, mode: smartCapture.mode });
      break;
      
    case 'stopCapture':
      smartCapture.stopCapture();
      sendResponse({ success: true });
      break;
      
    case 'toggleMode':
      const newMode = smartCapture.toggleMode();
      sendResponse({ success: true, mode: newMode });
      break;
      
    case 'capture':
      const content = smartCapture.captureContent();
      sendResponse({ success: true, content });
      break;
      
    case 'startScreenSelection':
      smartCapture.startScreenshotSelection();
      sendResponse({ success: true });
      break;
      
    case 'startVoiceRecording':
      smartCapture.startVoiceRecording();
      sendResponse({ success: true });
      break;
      
    case 'stopVoiceRecording':
      smartCapture.stopVoiceRecording();
      sendResponse({ success: true });
      break;
      
    case 'getStatus':
      sendResponse({
        isActive: smartCapture.isActive,
        mode: smartCapture.mode,
        isRecording: isRecording,
        platform: smartCapture.detectPlatform()
      });
      break;
  }
  
  return true; // Keep message channel open
});

// Enhanced keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Tab to toggle mode when capture is active
  if (smartCapture.isActive && e.key === 'Tab') {
    e.preventDefault();
    smartCapture.toggleMode();
  }
  
  // Ctrl/Cmd + Shift + S for screenshot
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    smartCapture.startScreenshotSelection();
  }
  
  // Ctrl/Cmd + Shift + V for voice note
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
    e.preventDefault();
    if (isRecording) {
      smartCapture.stopVoiceRecording();
    } else {
      smartCapture.startVoiceRecording();
    }
  }
});

console.log('Content Radar Enhanced - Ready with advanced features');