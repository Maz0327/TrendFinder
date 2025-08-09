// Enhanced Background Service Worker with Advanced Features
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
    sessionStarted: Date.now(),
    captureMode: 'precision',
    voiceNotes: []
  });
  
  // Create comprehensive context menu items
  chrome.contextMenus.create({
    id: 'capture-page',
    title: '📸 Capture Page to Content Radar',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'capture-selection',
    title: '✂️ Capture Selection',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'capture-image',
    title: '🖼️ Capture Image',
    contexts: ['image']
  });
  
  chrome.contextMenus.create({
    id: 'capture-link',
    title: '🔗 Capture Link',
    contexts: ['link']
  });
  
  chrome.contextMenus.create({
    id: 'capture-video',
    title: '🎥 Capture Video',
    contexts: ['video']
  });
  
  chrome.contextMenus.create({
    id: 'separator-1',
    type: 'separator',
    contexts: ['page', 'selection', 'image', 'link', 'video']
  });
  
  chrome.contextMenus.create({
    id: 'add-voice-note',
    title: '🎤 Add Voice Note',
    contexts: ['page', 'selection']
  });
  
  chrome.contextMenus.create({
    id: 'screenshot-area',
    title: '📱 Screenshot Area',
    contexts: ['page']
  });
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  switch (command) {
    case 'quick-capture':
      handleQuickCapture(tab);
      break;
    case 'screen-select':
      handleScreenSelect(tab);
      break;
    case 'voice-note':
      handleVoiceNote(tab);
      break;
  }
});

// Advanced message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'captureScreenshot':
      handleScreenshotCapture(request.data, sender.tab)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'authenticate':
      authenticateUser(request.credentials)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'syncWithBackend':
      syncCapturesWithBackend()
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'startVoiceRecording':
      startVoiceRecording(sender.tab)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'stopVoiceRecording':
      stopVoiceRecording()
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'modeChanged':
      chrome.storage.local.set({ captureMode: request.mode });
      sendResponse({ success: true });
      break;
      
    case 'getStatus':
      getExtensionStatus()
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
  }
});

// Screenshot capture with advanced processing
async function handleScreenshotCapture(data, tab) {
  try {
    // Capture visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 90
    });
    
    // Process selection area if provided
    let processedImage = dataUrl;
    if (data.selection) {
      // Here we'd crop the image to the selection area
      // For now, we'll mark it with metadata
      processedImage = {
        fullImage: dataUrl,
        selection: data.selection,
        processed: true
      };
    }
    
    // Create comprehensive capture data
    const captureData = {
      type: 'screenshot',
      title: data.title || tab.title,
      content: `Screenshot from: ${data.url || tab.url}`,
      sourceUrl: data.url || tab.url,
      screenshot: processedImage,
      selection: data.selection,
      tags: ['screenshot', 'chrome-extension', detectPlatform(tab.url)],
      metadata: {
        viewport: data.viewport,
        timestamp: data.timestamp || new Date().toISOString(),
        platform: detectPlatform(tab.url),
        captureMode: await getCaptureMode()
      }
    };
    
    // Try to send to backend first
    try {
      const response = await fetch(`${API_BASE_URL}/captures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(captureData)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Store successful capture
        await storeCapture(captureData, true);
        
        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'images/icon-48.png',
          title: 'Screenshot Captured!',
          message: 'Screenshot saved to Content Radar workspace'
        });
        
        return { success: true, captureId: result.id };
      }
    } catch (error) {
      console.log('Backend unavailable, storing locally:', error);
    }
    
    // Fallback to local storage
    await storeCapture(captureData, false);
    
    return { 
      success: true, 
      message: 'Screenshot captured and stored locally',
      local: true 
    };
    
  } catch (error) {
    console.error('Screenshot capture error:', error);
    throw new Error('Screenshot capture failed: ' + error.message);
  }
}

// Voice recording functionality
let mediaRecorder = null;
let audioChunks = [];

async function startVoiceRecording(tab) {
  try {
    // Request microphone permission
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Save voice note
      const voiceNote = {
        id: Date.now().toString(),
        url: audioUrl,
        blob: audioBlob,
        timestamp: new Date().toISOString(),
        tabUrl: tab.url,
        tabTitle: tab.title
      };
      
      // Store voice note
      const stored = await chrome.storage.local.get(['voiceNotes']);
      const voiceNotes = stored.voiceNotes || [];
      voiceNotes.push(voiceNote);
      await chrome.storage.local.set({ voiceNotes });
      
      // Notify content script
      chrome.tabs.sendMessage(tab.id, {
        action: 'voiceRecorded',
        voiceNote
      });
    };
    
    mediaRecorder.start();
    
    return { success: true, message: 'Voice recording started' };
    
  } catch (error) {
    console.error('Voice recording error:', error);
    throw new Error('Failed to start voice recording: ' + error.message);
  }
}

async function stopVoiceRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    return { success: true, message: 'Voice recording stopped' };
  }
  return { success: false, message: 'No active recording' };
}

// Context menu handlers
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  switch (info.menuItemId) {
    case 'capture-page':
      await capturePage(tab);
      break;
    case 'capture-selection':
      await captureSelection(info.selectionText, tab);
      break;
    case 'capture-image':
      await captureImage(info.srcUrl, tab);
      break;
    case 'capture-link':
      await captureLink(info.linkUrl, tab);
      break;
    case 'capture-video':
      await captureVideo(info.srcUrl, tab);
      break;
    case 'add-voice-note':
      await handleVoiceNote(tab);
      break;
    case 'screenshot-area':
      await handleScreenSelect(tab);
      break;
  }
});

// Quick capture handler
async function handleQuickCapture(tab) {
  try {
    // Get current capture mode
    const mode = await getCaptureMode();
    
    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'capture',
      mode
    });
    
    if (response.success) {
      await processCapture(response.content, tab);
    }
  } catch (error) {
    console.error('Quick capture error:', error);
  }
}

// Screen selection handler
async function handleScreenSelect(tab) {
  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'startScreenSelection'
    });
  } catch (error) {
    console.error('Screen select error:', error);
  }
}

// Voice note handler
async function handleVoiceNote(tab) {
  try {
    const stored = await chrome.storage.local.get(['isRecording']);
    
    if (stored.isRecording) {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'stopVoiceRecording'
      });
      await chrome.storage.local.set({ isRecording: false });
    } else {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'startVoiceRecording'
      });
      await chrome.storage.local.set({ isRecording: true });
    }
  } catch (error) {
    console.error('Voice note error:', error);
  }
}

// Platform detection
function detectPlatform(url) {
  const hostname = new URL(url).hostname;
  if (hostname.includes('instagram.com')) return 'instagram';
  if (hostname.includes('youtube.com')) return 'youtube';
  if (hostname.includes('tiktok.com')) return 'tiktok';
  if (hostname.includes('linkedin.com')) return 'linkedin';
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
  if (hostname.includes('reddit.com')) return 'reddit';
  return 'web';
}

// Get current capture mode
async function getCaptureMode() {
  const stored = await chrome.storage.local.get(['captureMode']);
  return stored.captureMode || 'precision';
}

// Store capture locally
async function storeCapture(capture, synced) {
  const stored = await chrome.storage.local.get(['recentCaptures']);
  const captures = stored.recentCaptures || [];
  
  capture.id = Date.now().toString();
  capture.synced = synced;
  
  captures.unshift(capture);
  
  // Keep only last 50 captures
  if (captures.length > 50) {
    captures.length = 50;
  }
  
  await chrome.storage.local.set({ recentCaptures: captures });
}

// Process captured content
async function processCapture(content, tab) {
  const captureData = {
    ...content,
    tabUrl: tab.url,
    tabTitle: tab.title,
    tabId: tab.id,
    capturedAt: new Date().toISOString()
  };
  
  // Try backend first
  try {
    const response = await fetch(`${API_BASE_URL}/captures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(captureData)
    });
    
    if (response.ok) {
      await storeCapture(captureData, true);
      
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon-48.png',
        title: 'Content Captured!',
        message: `${content.mode} mode capture saved`
      });
      
      return;
    }
  } catch (error) {
    console.log('Backend unavailable:', error);
  }
  
  // Fallback to local
  await storeCapture(captureData, false);
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon-48.png',
    title: 'Content Captured Locally',
    message: 'Will sync when connection restored'
  });
}

// Sync local captures with backend
async function syncCapturesWithBackend() {
  const stored = await chrome.storage.local.get(['recentCaptures']);
  const captures = stored.recentCaptures || [];
  
  const unsyncedCaptures = captures.filter(c => !c.synced);
  
  if (unsyncedCaptures.length === 0) {
    return { success: true, message: 'All captures synced' };
  }
  
  let syncedCount = 0;
  
  for (const capture of unsyncedCaptures) {
    try {
      const response = await fetch(`${API_BASE_URL}/captures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(capture)
      });
      
      if (response.ok) {
        capture.synced = true;
        syncedCount++;
      }
    } catch (error) {
      console.error('Sync error for capture:', error);
    }
  }
  
  // Update storage
  await chrome.storage.local.set({ recentCaptures: captures });
  
  return {
    success: true,
    message: `Synced ${syncedCount} of ${unsyncedCaptures.length} captures`
  };
}

// Get extension status
async function getExtensionStatus() {
  const stored = await chrome.storage.local.get([
    'isAuthenticated',
    'currentProject',
    'recentCaptures',
    'captureMode',
    'voiceNotes',
    'sessionStarted'
  ]);
  
  // Check backend connection
  let backendConnected = false;
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      credentials: 'include'
    });
    backendConnected = response.ok;
  } catch (error) {
    // Backend not available
  }
  
  return {
    isAuthenticated: stored.isAuthenticated || false,
    currentProject: stored.currentProject,
    captureCount: (stored.recentCaptures || []).length,
    captureMode: stored.captureMode || 'precision',
    voiceNoteCount: (stored.voiceNotes || []).length,
    backendConnected,
    sessionAge: Date.now() - (stored.sessionStarted || Date.now())
  };
}

// Capture specific content types
async function capturePage(tab) {
  const content = {
    type: 'full-page',
    url: tab.url,
    title: tab.title,
    timestamp: new Date().toISOString()
  };
  await processCapture(content, tab);
}

async function captureSelection(text, tab) {
  const content = {
    type: 'selection',
    selectedText: text,
    url: tab.url,
    title: tab.title,
    timestamp: new Date().toISOString()
  };
  await processCapture(content, tab);
}

async function captureImage(imageUrl, tab) {
  const content = {
    type: 'image',
    imageUrl,
    pageUrl: tab.url,
    pageTitle: tab.title,
    timestamp: new Date().toISOString()
  };
  await processCapture(content, tab);
}

async function captureLink(linkUrl, tab) {
  const content = {
    type: 'link',
    linkUrl,
    pageUrl: tab.url,
    pageTitle: tab.title,
    timestamp: new Date().toISOString()
  };
  await processCapture(content, tab);
}

async function captureVideo(videoUrl, tab) {
  const content = {
    type: 'video',
    videoUrl,
    pageUrl: tab.url,
    pageTitle: tab.title,
    timestamp: new Date().toISOString()
  };
  await processCapture(content, tab);
}

// Authentication handler
async function authenticateUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    
    if (response.ok) {
      const user = await response.json();
      await chrome.storage.local.set({ 
        isAuthenticated: true,
        user
      });
      return { success: true, user };
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

// Session cleanup
setInterval(async () => {
  const stored = await chrome.storage.local.get(['sessionStarted']);
  const sessionAge = Date.now() - (stored.sessionStarted || Date.now());
  
  if (sessionAge > SESSION_DURATION) {
    // Clear old session data
    await chrome.storage.local.set({
      recentCaptures: [],
      voiceNotes: [],
      sessionStarted: Date.now()
    });
  }
}, 60 * 60 * 1000); // Check every hour

console.log('Content Radar Enhanced Background Service - Ready');