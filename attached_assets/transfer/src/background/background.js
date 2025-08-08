// Background Service Worker for Content Radar Chrome Extension
const API_BASE_URL = 'http://localhost:5000/api';

// Session Storage for 24-hour memory
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Initialize storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    isAuthenticated: false,
    currentProject: null,
    selectedTags: [],
    recentCaptures: [],
    sessionStarted: Date.now()
  });
  
  // Create context menu items
  chrome.contextMenus.create({
    id: 'capture-page',
    title: 'Capture Page to Content Radar',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'capture-selection',
    title: 'Capture Selection',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'capture-image',
    title: 'Capture Image',
    contexts: ['image']
  });
  
  chrome.contextMenus.create({
    id: 'capture-link',
    title: 'Capture Link',
    contexts: ['link']
  });
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'quick-capture':
      handleQuickCapture();
      break;
    case 'screen-select':
      handleScreenSelect();
      break;
    case 'voice-note':
      handleVoiceNote();
      break;
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'captureScreenshot':
      handleScreenshotCapture(request.data, sender.tab)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
  }
});

// Screenshot capture handler
async function handleScreenshotCapture(data, tab) {
  try {
    // Capture visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 90
    });
    
    // Create capture data with screenshot
    const captureData = {
      type: 'screenshot',
      title: data.title,
      content: `Screenshot from: ${data.url}`,
      sourceUrl: data.url,
      screenshot: dataUrl,
      selection: data.selection,
      tags: ['screenshot', 'chrome-extension'],
      timestamp: data.timestamp
    };
    
    // Store locally
    const stored = await chrome.storage.local.get(['captures']);
    const captures = stored.captures || [];
    captures.unshift(captureData);
    await chrome.storage.local.set({ captures: captures.slice(0, 10) });
    
    return { success: true, message: 'Screenshot captured and stored locally' };
    
  } catch (error) {
    console.error('Screenshot capture error:', error);
    throw new Error('Screenshot capture failed: ' + error.message);
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'capture-page':
      capturePage(tab);
      break;
    case 'capture-selection':
      captureSelection(info.selectionText, tab);
      break;
    case 'capture-image':
      captureImage(info.srcUrl, tab);
      break;
    case 'capture-link':
      captureLink(info.linkUrl);
      break;
  }
});

// Message handling from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'authenticate':
      handleAuthentication(request.credentials).then(sendResponse);
      return true;
      
    case 'capture':
      handleCapture(request.data).then(sendResponse);
      return true;
      
    case 'getProjects':
      getProjects().then(sendResponse);
      return true;
      
    case 'getTags':
      getTags().then(sendResponse);
      return true;
      
    case 'getRecentCaptures':
      getRecentCaptures().then(sendResponse);
      return true;
      
    case 'startScreenSelection':
      startScreenSelection(sender.tab);
      break;
      
    case 'captureScreenshot':
      captureScreenshot(request.area, sender.tab).then(sendResponse);
      return true;
      
    case 'startVoiceRecording':
      startVoiceRecording().then(sendResponse);
      return true;
      
    case 'stopVoiceRecording':
      stopVoiceRecording().then(sendResponse);
      return true;
      
    case 'updateSettings':
      updateSettings(request.settings);
      break;
  }
});

// Authentication
async function handleAuthentication(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      await chrome.storage.local.set({ 
        isAuthenticated: true,
        user: data.user 
      });
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: error.message };
  }
}

// Quick capture current page
async function handleQuickCapture() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    capturePage(tab);
  }
}

// Screen selection
async function handleScreenSelect() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    startScreenSelection(tab);
  }
}

// Voice note
async function handleVoiceNote() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: 'startVoiceRecording' });
  }
}

// Start screen selection in content script
function startScreenSelection(tab) {
  chrome.tabs.sendMessage(tab.id, { action: 'startScreenSelection' });
}

// Capture full page
async function capturePage(tab) {
  try {
    const { currentProject, selectedTags } = await chrome.storage.local.get(['currentProject', 'selectedTags']);
    
    const captureData = {
      url: tab.url,
      title: tab.title,
      type: 'page',
      projectId: currentProject,
      tags: selectedTags,
      timestamp: new Date().toISOString()
    };
    
    const result = await handleCapture(captureData);
    
    if (result.success) {
      showNotification('Page captured successfully!', 'success');
      await addToRecentCaptures(captureData);
    } else {
      showNotification('Failed to capture page', 'error');
    }
  } catch (error) {
    console.error('Page capture error:', error);
    showNotification('Error capturing page', 'error');
  }
}

// Capture selected text
async function captureSelection(text, tab) {
  try {
    const { currentProject, selectedTags } = await chrome.storage.local.get(['currentProject', 'selectedTags']);
    
    const captureData = {
      url: tab.url,
      title: `Selection from ${tab.title}`,
      content: text,
      type: 'selection',
      projectId: currentProject,
      tags: selectedTags,
      timestamp: new Date().toISOString()
    };
    
    const result = await handleCapture(captureData);
    
    if (result.success) {
      showNotification('Selection captured successfully!', 'success');
      await addToRecentCaptures(captureData);
    } else {
      showNotification('Failed to capture selection', 'error');
    }
  } catch (error) {
    console.error('Selection capture error:', error);
    showNotification('Error capturing selection', 'error');
  }
}

// Capture image
async function captureImage(imageUrl, tab) {
  try {
    const { currentProject, selectedTags } = await chrome.storage.local.get(['currentProject', 'selectedTags']);
    
    const captureData = {
      url: tab.url,
      title: `Image from ${tab.title}`,
      imageUrl: imageUrl,
      type: 'image',
      projectId: currentProject,
      tags: selectedTags,
      timestamp: new Date().toISOString()
    };
    
    const result = await handleCapture(captureData);
    
    if (result.success) {
      showNotification('Image captured successfully!', 'success');
      await addToRecentCaptures(captureData);
    } else {
      showNotification('Failed to capture image', 'error');
    }
  } catch (error) {
    console.error('Image capture error:', error);
    showNotification('Error capturing image', 'error');
  }
}

// Capture link
async function captureLink(linkUrl) {
  try {
    const { currentProject, selectedTags } = await chrome.storage.local.get(['currentProject', 'selectedTags']);
    
    const captureData = {
      url: linkUrl,
      title: `Link: ${linkUrl}`,
      type: 'link',
      projectId: currentProject,
      tags: selectedTags,
      timestamp: new Date().toISOString()
    };
    
    const result = await handleCapture(captureData);
    
    if (result.success) {
      showNotification('Link captured successfully!', 'success');
      await addToRecentCaptures(captureData);
    } else {
      showNotification('Failed to capture link', 'error');
    }
  } catch (error) {
    console.error('Link capture error:', error);
    showNotification('Error capturing link', 'error');
  }
}

// Handle capture request
async function handleCapture(data) {
  try {
    const { isAuthenticated } = await chrome.storage.local.get('isAuthenticated');
    
    if (!isAuthenticated) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const response = await fetch(`${API_BASE_URL}/captures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Capture error:', error);
    return { success: false, error: error.message };
  }
}

// Get projects
async function getProjects() {
  try {
    const response = await fetch(`${API_BASE_URL}/workspace/projects`, {
      credentials: 'include'
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get projects error:', error);
    return { success: false, error: error.message };
  }
}

// Get tags
async function getTags() {
  // Return predefined strategic tags
  return {
    success: true,
    tags: [
      { id: 'trend', name: 'Trend', icon: '📈' },
      { id: 'competitor', name: 'Competitor', icon: '🎯' },
      { id: 'innovation', name: 'Innovation', icon: '💡' },
      { id: 'cultural', name: 'Cultural', icon: '🌍' },
      { id: 'visual', name: 'Visual', icon: '👁️' },
      { id: 'audience', name: 'Audience', icon: '👥' },
      { id: 'campaign', name: 'Campaign', icon: '📢' },
      { id: 'product', name: 'Product', icon: '📦' },
      { id: 'insight', name: 'Insight', icon: '🔍' },
      { id: 'reference', name: 'Reference', icon: '📚' }
    ]
  };
}

// Get recent captures
async function getRecentCaptures() {
  try {
    const { recentCaptures } = await chrome.storage.local.get('recentCaptures');
    return { success: true, captures: recentCaptures || [] };
  } catch (error) {
    console.error('Get recent captures error:', error);
    return { success: false, error: error.message };
  }
}

// Add to recent captures
async function addToRecentCaptures(capture) {
  const { recentCaptures = [] } = await chrome.storage.local.get('recentCaptures');
  
  // Add new capture to beginning
  recentCaptures.unshift(capture);
  
  // Keep only last 10 captures
  if (recentCaptures.length > 10) {
    recentCaptures.pop();
  }
  
  await chrome.storage.local.set({ recentCaptures });
}

// Capture screenshot of selected area
async function captureScreenshot(area, tab) {
  try {
    const screenshot = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 100
    });
    
    // Process screenshot with area coordinates
    const processedImage = await processScreenshot(screenshot, area);
    
    const { currentProject, selectedTags } = await chrome.storage.local.get(['currentProject', 'selectedTags']);
    
    const captureData = {
      url: tab.url,
      title: `Screenshot from ${tab.title}`,
      screenshot: processedImage,
      type: 'screenshot',
      projectId: currentProject,
      tags: selectedTags,
      timestamp: new Date().toISOString()
    };
    
    const result = await handleCapture(captureData);
    
    if (result.success) {
      await addToRecentCaptures(captureData);
    }
    
    return result;
  } catch (error) {
    console.error('Screenshot capture error:', error);
    return { success: false, error: error.message };
  }
}

// Process screenshot to crop selected area
async function processScreenshot(dataUrl, area) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = new OffscreenCanvas(area.width, area.height);
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(img, 
        area.x, area.y, area.width, area.height,
        0, 0, area.width, area.height
      );
      
      canvas.convertToBlob({ type: 'image/png' }).then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    };
    img.src = dataUrl;
  });
}

// Voice recording with Web Audio API simulation
let mediaRecorder = null;
let audioChunks = [];

async function startVoiceRecording() {
  try {
    // Note: Real implementation would use chrome.tabCapture API
    // This is a simplified version for the extension structure
    return { success: true, recording: true };
  } catch (error) {
    console.error('Voice recording error:', error);
    return { success: false, error: error.message };
  }
}

async function stopVoiceRecording() {
  try {
    // Note: Real implementation would process audio with Whisper API
    return { success: true, transcription: 'Voice note transcription' };
  } catch (error) {
    console.error('Stop recording error:', error);
    return { success: false, error: error.message };
  }
}

// Update settings
async function updateSettings(settings) {
  await chrome.storage.local.set(settings);
}

// Show notification
function showNotification(message, type = 'info') {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '/assets/icon-128.png',
    title: 'Content Radar',
    message: message,
    priority: type === 'error' ? 2 : 1
  });
}

// Clean up old session data
setInterval(async () => {
  const { sessionStarted } = await chrome.storage.local.get('sessionStarted');
  
  if (Date.now() - sessionStarted > SESSION_DURATION) {
    // Reset session
    await chrome.storage.local.set({
      selectedTags: [],
      recentCaptures: [],
      sessionStarted: Date.now()
    });
  }
}, 60 * 60 * 1000); // Check every hour