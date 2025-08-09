class StrategicContentCapture {
    constructor() {
        this.apiBaseUrl = window.CONFIG?.API_BASE_URL || 'http://localhost:5000';
        this.currentTab = null;
        this.activeProject = null;
        this.initializeExtension();
    }

    async initializeExtension() {
        await this.getCurrentTab();
        this.setupEventListeners();
        this.updateStatus('ready');
        await this.loadProjects();
        await this.loadActiveProject();
        this.loadRecentCaptures();
    }

    async getCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tab;
        } catch (error) {
            console.error('Failed to get current tab:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('precisionCaptureButton').addEventListener('click', () => this.startPrecisionCapture());
        document.getElementById('contextCaptureButton').addEventListener('click', () => this.startContextCapture());
        document.getElementById('quickCaptureButton').addEventListener('click', () => this.captureCurrentPage());
        document.getElementById('activeProject').addEventListener('change', (e) => this.switchProject(e.target.value));
        document.getElementById('settingsButton').addEventListener('click', () => this.openSettings());
        document.getElementById('dashboardButton').addEventListener('click', () => this.openDashboard());
    }

    async loadProjects() {
        try {
            const response = await this.sendMessage({ action: 'get-active-project' });
            const projectSelect = document.getElementById('activeProject');
            
            if (response.activeProject) {
                this.activeProject = response.activeProject;
                projectSelect.innerHTML = `<option value="${response.activeProject.id}">${response.activeProject.name}</option>`;
                projectSelect.value = response.activeProject.id;
            } else {
                projectSelect.innerHTML = '<option value="">No projects found</option>';
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    }

    async loadActiveProject() {
        try {
            const stored = await chrome.storage.local.get(['activeProject']);
            if (stored.activeProject) {
                this.activeProject = stored.activeProject;
                const projectSelect = document.getElementById('activeProject');
                if (projectSelect && this.activeProject) {
                    projectSelect.value = this.activeProject.id;
                }
            }
        } catch (error) {
            console.error('Failed to load active project:', error);
        }
    }

    async switchProject(projectId) {
        if (!projectId) return;
        
        try {
            const response = await this.sendMessage({
                action: 'switch-project',
                projectId: projectId
            });
            
            if (response.success) {
                this.activeProject = response.activeProject;
                this.updateStatus('ready', `Switched to ${response.activeProject.name}`);
            }
        } catch (error) {
            console.error('Failed to switch project:', error);
            this.updateStatus('error', 'Failed to switch project');
        }
    }

    updateStatus(status, message = '') {
        const indicator = document.getElementById('statusIndicator');
        const text = document.getElementById('statusText');
        
        const statusConfig = {
            ready: { class: 'ready', text: 'Ready to capture' },
            processing: { class: 'processing', text: 'Processing content...' },
            success: { class: 'success', text: 'Content captured successfully!' },
            error: { class: 'error', text: message || 'Something went wrong' }
        };

        const config = statusConfig[status] || statusConfig.ready;
        indicator.className = `status-indicator ${config.class}`;
        text.textContent = config.text;
    }

    async startPrecisionCapture() {
        if (!this.currentTab) {
            this.updateStatus('error', 'No active tab found');
            return;
        }

        if (!this.activeProject) {
            this.updateStatus('error', 'No project selected');
            return;
        }

        this.updateStatus('processing', 'Starting precision capture...');
        
        try {
            await chrome.tabs.sendMessage(this.currentTab.id, { 
                action: 'startPrecisionCapture' 
            });
            
            this.updateStatus('success', 'Click elements to capture them');
            setTimeout(() => this.updateStatus('ready'), 2000);
            window.close();
        } catch (error) {
            console.error('Precision capture failed:', error);
            this.updateStatus('error', 'Failed to start precision capture');
        }
    }

    async startContextCapture() {
        if (!this.currentTab) {
            this.updateStatus('error', 'No active tab found');
            return;
        }

        if (!this.activeProject) {
            this.updateStatus('error', 'No project selected');
            return;
        }

        this.updateStatus('processing', 'Capturing page context...');
        
        try {
            await chrome.tabs.sendMessage(this.currentTab.id, { 
                action: 'startContextCapture' 
            });
            
            this.updateStatus('success', 'Context captured successfully!');
            await this.loadRecentCaptures();
            setTimeout(() => this.updateStatus('ready'), 2000);
        } catch (error) {
            console.error('Context capture failed:', error);
            this.updateStatus('error', 'Failed to capture context');
        }
    }

    async captureCurrentPage() {
        if (!this.currentTab) {
            this.updateStatus('error', 'No active tab found');
            return;
        }

        if (!this.activeProject) {
            this.updateStatus('error', 'No project selected');
            return;
        }

        this.updateStatus('processing', 'Capturing current page...');
        
        try {
            await chrome.tabs.sendMessage(this.currentTab.id, { 
                action: 'captureCurrentPage' 
            });
            
            this.updateStatus('success', 'Page captured successfully!');
            await this.loadRecentCaptures();
            setTimeout(() => this.updateStatus('ready'), 2000);
        } catch (error) {
            console.error('Page capture failed:', error);
            this.updateStatus('error', 'Failed to capture page');
        }
    }

    async loadRecentCaptures() {
        try {
            const { recentCaptures = [] } = await chrome.storage.local.get(['recentCaptures']);
            const capturesList = document.getElementById('capturesList');
            
            if (recentCaptures.length === 0) {
                capturesList.innerHTML = '<p class="no-captures">No recent captures</p>';
                return;
            }

            capturesList.innerHTML = recentCaptures.slice(0, 5).map(capture => `
                <div class="capture-item">
                    <div class="capture-title">${this.truncateText(capture.title, 40)}</div>
                    <div class="capture-meta">
                        <span class="capture-platform">${capture.platform}</span>
                        <span class="capture-time">${this.formatTime(capture.timestamp)}</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load recent captures:', error);
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength - 3) + '...';
    }

    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    async sendMessage(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
    }

    openSettings() {
        // Open settings in a new tab
        chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    }

    openDashboard() {
        // Open the main dashboard - same URL as API since they're served together
        chrome.tabs.create({ url: this.apiBaseUrl });
    }
}

// Initialize the extension when the popup loads
document.addEventListener('DOMContentLoaded', () => {
    new StrategicContentCapture();
});

// Handle keyboard shortcuts in popup
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case '1':
                event.preventDefault();
                document.getElementById('precisionCaptureButton').click();
                break;
            case '2':
                event.preventDefault();
                document.getElementById('contextCaptureButton').click();
                break;
            case '3':
                event.preventDefault();
                document.getElementById('quickCaptureButton').click();
                break;
        }
    }
});