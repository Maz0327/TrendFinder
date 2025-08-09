// Popup script for Content Radar Chrome Extension
// Simple vanilla JS version to avoid module issues

// Initialize popup immediately - multiple event listeners for reliability
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing...');
  initializePopup();
});

// Backup initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePopup);
} else {
  // DOM already loaded
  initializePopup();
}

// Window load backup
window.addEventListener('load', function() {
  // Double-check initialization after 100ms
  setTimeout(function() {
    const app = document.getElementById('app');
    if (app && app.innerHTML.includes('Loading Content Radar')) {
      console.log('Forcing initialization...');
      initializePopup();
    }
  }, 100);
});

function initializePopup() {
  console.log('initializePopup called');
  const app = document.getElementById('app');
  
  if (!app) {
    console.error('App element not found');
    return;
  }
  
  console.log('Creating UI structure...');
  
  // Create basic UI structure
  app.innerHTML = `
    <div class="header">
      <div class="logo">
        <div class="logo-icon">📡</div>
        <span class="logo-text">Content Radar</span>
      </div>
      <div class="status-indicator" id="status">●</div>
    </div>
    
    <div class="main-content">
      <div class="quick-capture">
        <h3>Quick Capture</h3>
        <button class="btn btn-primary" id="captureBtn">
          📸 Capture Current Page
        </button>
        <button class="btn btn-secondary" id="voiceBtn">
          🎤 Voice Note
        </button>
        <button class="btn btn-secondary" id="screenshotBtn">
          📱 Highlight Screenshot
        </button>
      </div>
      
      <div class="recent-section">
        <h4>Recent Captures</h4>
        <div id="recentList">
          <div class="capture-item">
            <div class="capture-title">Chrome Extension Working!</div>
            <div class="capture-meta">Just now • Manual</div>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <button class="btn btn-link" id="openWorkspace">Open Workspace</button>
      </div>
    </div>
  `;
  
  // Add event listeners
  setupEventListeners();
  
  // Check connection status
  checkConnectionStatus();
}

function setupEventListeners() {
  document.getElementById('captureBtn')?.addEventListener('click', captureCurrentPage);
  document.getElementById('voiceBtn')?.addEventListener('click', startVoiceCapture);
  document.getElementById('screenshotBtn')?.addEventListener('click', startScreenshotCapture);
  document.getElementById('openWorkspace')?.addEventListener('click', openWorkspace);
}

async function captureCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const captureData = {
      title: tab.title || 'Untitled Page',
      content: `Captured from: ${tab.url}`,
      sourceUrl: tab.url,
      tags: ['chrome-extension', 'manual-capture']
    };
    
    // First try to send to backend
    try {
      const response = await fetch('http://localhost:5000/api/captures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(captureData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        showMessage('Page captured and saved to workspace!', 'success');
      } else {
        throw new Error(result.message || 'Backend save failed');
      }
    } catch (backendError) {
      console.log('Backend connection failed, storing locally:', backendError);
      
      // Fallback to local storage
      const localData = {
        ...captureData,
        timestamp: new Date().toISOString(),
        type: 'page_capture',
        status: 'pending_sync'
      };
      
      const stored = await chrome.storage.local.get(['captures']);
      const captures = stored.captures || [];
      captures.unshift(localData);
      await chrome.storage.local.set({ captures: captures.slice(0, 10) });
      
      showMessage('Page captured locally (will sync when online)', 'info');
    }
    
    updateRecentList();
  } catch (error) {
    showMessage('Capture failed: ' + error.message, 'error');
  }
}

function startVoiceCapture() {
  showMessage('Voice capture feature coming soon!', 'info');
}

async function startScreenshotCapture() {
  try {
    // Close popup to allow screen selection
    window.close();
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject selection tool into the page
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['src/content/screenshot-selector.js']
    });
    
    // Inject selection styles
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['styles/screenshot-selector.css']
    });
    
  } catch (error) {
    showMessage('Screenshot capture failed: ' + error.message, 'error');
  }
}

async function openWorkspace() {
  // Test connection first
  try {
    const response = await fetch('http://localhost:5000/api/auth/me', {
      credentials: 'include'
    });
    const result = await response.json();
    
    if (result.success && result.user) {
      // User is logged in, go to workspace
      chrome.tabs.create({ url: 'http://localhost:5000/workspace/dashboard' });
    } else {
      // Not logged in, go to auth page
      chrome.tabs.create({ url: 'http://localhost:5000/auth' });
    }
  } catch (error) {
    // Connection failed, try anyway
    chrome.tabs.create({ url: 'http://localhost:5000' });
  }
  window.close();
}

function showMessage(text, type) {
  const app = document.getElementById('app');
  const existing = app.querySelector('.message');
  if (existing) existing.remove();
  
  const message = document.createElement('div');
  message.className = `message message-${type}`;
  message.textContent = text;
  app.appendChild(message);
  
  setTimeout(() => message.remove(), 3000);
}

async function updateRecentList() {
  const stored = await chrome.storage.local.get(['captures']);
  const captures = stored.captures || [];
  
  const list = document.getElementById('recentList');
  if (!list) return;
  
  list.innerHTML = captures.slice(0, 3).map(capture => `
    <div class="capture-item">
      <div class="capture-title">${capture.title}</div>
      <div class="capture-meta">${formatTime(capture.timestamp)} • ${capture.type}</div>
    </div>
  `).join('') || '<div class="no-captures">No recent captures</div>';
}

function formatTime(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now - time;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  return Math.floor(diff / 3600000) + 'h ago';
}

async function checkConnectionStatus() {
  const statusIndicator = document.getElementById('status');
  if (!statusIndicator) return;
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        statusIndicator.className = 'status-indicator connected';
        statusIndicator.title = 'Connected to Content Radar';
        
        if (result.user) {
          statusIndicator.title += ` (${result.user.email})`;
        } else {
          statusIndicator.title += ' (Not logged in)';
        }
      } else {
        throw new Error('Invalid response');
      }
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    statusIndicator.className = 'status-indicator disconnected';
    statusIndicator.title = 'Cannot connect to Content Radar backend';
    console.log('Connection check failed:', error);
  }
}

// Legacy Vue-like structure for compatibility
const vueApp = {
  data() {
    return {
      isAuthenticated: false,
      user: null,
      projects: [],
      selectedProject: null,
      tags: [],
      selectedTags: [],
      recentCaptures: [],
      isRecording: false,
      recordingTime: 0,
      recordingInterval: null,
      captureNotes: '',
      isLoading: false,
      message: null,
      messageType: null,
      activeTab: 'capture',
      loginForm: {
        email: '',
        password: ''
      }
    };
  },
  
  async mounted() {
    // Load saved state
    const state = await chrome.storage.local.get([
      'isAuthenticated',
      'user',
      'currentProject',
      'selectedTags',
      'recentCaptures'
    ]);
    
    this.isAuthenticated = state.isAuthenticated || false;
    this.user = state.user || null;
    this.selectedProject = state.currentProject;
    this.selectedTags = state.selectedTags || [];
    this.recentCaptures = state.recentCaptures || [];
    
    if (this.isAuthenticated) {
      await this.loadProjects();
      await this.loadTags();
    }
  },
  
  methods: {
    // Authentication
    async login() {
      this.isLoading = true;
      this.message = null;
      
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'authenticate',
          credentials: this.loginForm
        });
        
        if (response.success) {
          this.isAuthenticated = true;
          this.user = response.user;
          await this.loadProjects();
          await this.loadTags();
          this.showMessage('Logged in successfully!', 'success');
        } else {
          this.showMessage(response.error || 'Login failed', 'error');
        }
      } catch (error) {
        this.showMessage('Connection error', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    
    async logout() {
      await chrome.storage.local.set({
        isAuthenticated: false,
        user: null,
        currentProject: null,
        selectedTags: []
      });
      
      this.isAuthenticated = false;
      this.user = null;
      this.projects = [];
      this.selectedProject = null;
      this.tags = [];
      this.selectedTags = [];
    },
    
    // Projects
    async loadProjects() {
      const response = await chrome.runtime.sendMessage({ action: 'getProjects' });
      if (response.success) {
        this.projects = response.data || [];
        
        // Select first project if none selected
        if (!this.selectedProject && this.projects.length > 0) {
          this.selectedProject = this.projects[0].id;
          await this.saveProject();
        }
      }
    },
    
    async saveProject() {
      await chrome.storage.local.set({ currentProject: this.selectedProject });
    },
    
    // Tags
    async loadTags() {
      const response = await chrome.runtime.sendMessage({ action: 'getTags' });
      if (response.success) {
        this.tags = response.tags || [];
      }
    },
    
    toggleTag(tagId) {
      const index = this.selectedTags.indexOf(tagId);
      if (index > -1) {
        this.selectedTags.splice(index, 1);
      } else {
        this.selectedTags.push(tagId);
      }
      chrome.storage.local.set({ selectedTags: this.selectedTags });
    },
    
    isTagSelected(tagId) {
      return this.selectedTags.includes(tagId);
    },
    
    // Capture actions
    async quickCapture() {
      this.isLoading = true;
      
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        const response = await chrome.runtime.sendMessage({
          action: 'capture',
          data: {
            url: tab.url,
            title: tab.title,
            type: 'page',
            projectId: this.selectedProject,
            tags: this.selectedTags,
            notes: this.captureNotes,
            timestamp: new Date().toISOString()
          }
        });
        
        if (response.success) {
          this.showMessage('Page captured successfully!', 'success');
          this.captureNotes = '';
          await this.loadRecentCaptures();
        } else {
          this.showMessage(response.error || 'Capture failed', 'error');
        }
      } catch (error) {
        this.showMessage('Capture error', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    
    async startScreenSelection() {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: 'startScreenSelection' });
      window.close();
    },
    
    // Voice recording
    async toggleRecording() {
      if (!this.isRecording) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    },
    
    startRecording() {
      this.isRecording = true;
      this.recordingTime = 0;
      
      this.recordingInterval = setInterval(() => {
        this.recordingTime++;
      }, 1000);
      
      chrome.runtime.sendMessage({ action: 'startVoiceRecording' });
    },
    
    async stopRecording() {
      this.isRecording = false;
      
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval);
        this.recordingInterval = null;
      }
      
      const response = await chrome.runtime.sendMessage({ action: 'stopVoiceRecording' });
      
      if (response.success) {
        this.showMessage('Voice note saved!', 'success');
        this.recordingTime = 0;
      } else {
        this.showMessage('Failed to save voice note', 'error');
      }
    },
    
    formatRecordingTime() {
      const minutes = Math.floor(this.recordingTime / 60);
      const seconds = this.recordingTime % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
    
    // Recent captures
    async loadRecentCaptures() {
      const response = await chrome.runtime.sendMessage({ action: 'getRecentCaptures' });
      if (response.success) {
        this.recentCaptures = response.captures || [];
      }
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) {
        return 'Just now';
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)} min ago`;
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)} hours ago`;
      } else {
        return date.toLocaleDateString();
      }
    },
    
    getCaptureIcon(type) {
      const icons = {
        page: '📄',
        selection: '✂️',
        image: '🖼️',
        link: '🔗',
        screenshot: '📸',
        element: '🎯',
        voice: '🎤'
      };
      return icons[type] || '📄';
    },
    
    // Messages
    showMessage(text, type) {
      this.message = text;
      this.messageType = type;
      
      setTimeout(() => {
        this.message = null;
        this.messageType = null;
      }, 3000);
    },
    
    // Open main app
    openDashboard() {
      chrome.tabs.create({ url: 'http://localhost:5000' });
    }
  },
  
  computed: {
    canCapture() {
      return this.isAuthenticated && this.selectedProject;
    }
  },
  
  template: `
    <div class="popup-container">
      <!-- Header -->
      <div class="header">
        <div class="logo">
          <div class="logo-icon">📡</div>
          <span>Content Radar</span>
        </div>
        <button v-if="isAuthenticated" @click="logout" class="logout-btn">
          Logout
        </button>
      </div>
      
      <!-- Login Form -->
      <div v-if="!isAuthenticated" class="login-container">
        <div class="login-form">
          <h2>Sign In</h2>
          <input 
            v-model="loginForm.email" 
            type="email" 
            placeholder="Email"
            class="input"
            @keyup.enter="login"
          />
          <input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="Password"
            class="input"
            @keyup.enter="login"
          />
          <button 
            @click="login" 
            class="capture-button"
            :disabled="isLoading || !loginForm.email || !loginForm.password"
          >
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </div>
      </div>
      
      <!-- Main Content -->
      <div v-else class="main-container">
        <!-- Quick Actions -->
        <div class="quick-actions">
          <div class="action-card" @click="quickCapture" :class="{ disabled: !canCapture }">
            <div class="action-icon">📸</div>
            <div class="action-title">Quick Capture</div>
            <div class="action-desc">Capture entire page</div>
          </div>
          
          <div class="action-card" @click="startScreenSelection" :class="{ disabled: !canCapture }">
            <div class="action-icon">✂️</div>
            <div class="action-title">Select Area</div>
            <div class="action-desc">Choose what to capture</div>
          </div>
        </div>
        
        <!-- Voice Recorder -->
        <div class="voice-recorder" :class="{ recording: isRecording }">
          <div class="recording-controls">
            <button 
              @click="toggleRecording" 
              class="record-button"
              :class="{ recording: isRecording }"
              :disabled="!canCapture"
            >
              {{ isRecording ? '⏹' : '🎤' }}
            </button>
            <div v-if="isRecording" class="recording-time">
              {{ formatRecordingTime() }}
            </div>
            <div v-else>
              Click to add voice note
            </div>
          </div>
        </div>
        
        <!-- Project Selection -->
        <div class="project-section">
          <div class="section-title">Project</div>
          <select 
            v-model="selectedProject" 
            @change="saveProject"
            class="project-select"
          >
            <option :value="null">Select a project...</option>
            <option 
              v-for="project in projects" 
              :key="project.id" 
              :value="project.id"
            >
              {{ project.name }}
            </option>
          </select>
        </div>
        
        <!-- Tags -->
        <div class="tags-section">
          <div class="section-title">Tags</div>
          <div class="tags-grid">
            <div 
              v-for="tag in tags" 
              :key="tag.id"
              @click="toggleTag(tag.id)"
              class="tag"
              :class="{ selected: isTagSelected(tag.id) }"
            >
              <span class="tag-icon">{{ tag.icon }}</span>
              <span>{{ tag.name }}</span>
            </div>
          </div>
        </div>
        
        <!-- Notes -->
        <div class="project-section">
          <div class="section-title">Notes (Optional)</div>
          <textarea 
            v-model="captureNotes"
            placeholder="Add notes about this capture..."
            class="notes-input"
            rows="3"
          ></textarea>
        </div>
        
        <!-- Recent Captures -->
        <div class="recent-captures" v-if="recentCaptures.length > 0">
          <div class="section-title">Recent Captures</div>
          <div 
            v-for="capture in recentCaptures.slice(0, 5)" 
            :key="capture.timestamp"
            class="capture-item"
          >
            <div class="capture-icon">{{ getCaptureIcon(capture.type) }}</div>
            <div class="capture-details">
              <div class="capture-title">{{ capture.title }}</div>
              <div class="capture-meta">{{ formatTime(capture.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Message -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
      
      <!-- Footer Actions -->
      <div v-if="isAuthenticated" class="capture-section">
        <button 
          @click="quickCapture" 
          class="capture-button"
          :disabled="!canCapture || isLoading"
        >
          {{ isLoading ? 'Capturing...' : 'Capture Now' }} 🚀
        </button>
        
        <div class="shortcuts-hint">
          <span class="shortcut-key">Ctrl+Shift+C</span> Quick Capture
          <span class="shortcut-key">Ctrl+Shift+S</span> Screen Select
        </div>
      </div>
    </div>
  `
});

// Simple Vue 3 implementation for extension
function createApp(options) {
  // This would be replaced with actual Vue 3 in production
  // For now, using a simple reactive system
  return {
    mount(selector) {
      const container = document.querySelector(selector);
      container.innerHTML = options.template;
      // Initialize reactive data and methods
      // This is a simplified version - real implementation would use Vue 3
    }
  };
}

// Mount app
app.mount('#app');