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
            this.updateStatus('error', 'Please select a project first');
            return;
        }

        this.updateStatus('processing', 'Starting precision capture...');
        
        try {
            await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'start-precision-capture'
            });
            window.close(); // Close popup to allow interaction
        } catch (error) {
            console.error('Failed to start precision capture:', error);
            this.updateStatus('error', 'Failed to start capture mode');
        }
    }

    async startContextCapture() {
        if (!this.currentTab) {
            this.updateStatus('error', 'No active tab found');
            return;
        }

        if (!this.activeProject) {
            this.updateStatus('error', 'Please select a project first');
            return;
        }

        this.updateStatus('processing', 'Starting context capture...');
        
        try {
            await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'start-context-capture'
            });
            window.close(); // Close popup to allow interaction
        } catch (error) {
            console.error('Failed to start context capture:', error);
            this.updateStatus('error', 'Failed to start capture mode');
        }
    }

    async captureCurrentPage() {
        if (!this.currentTab) {
            this.updateStatus('error', 'No active tab found');
            return;
        }

        if (!this.activeProject) {
            this.updateStatus('error', 'Please select a project first');
            return;
        }

        this.updateStatus('processing');
        
        try {
            // Inject content script to extract page content
            const [result] = await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                func: this.extractPageContent
            });

            if (result?.result) {
                await this.sendContentToBackground({
                    ...result.result,
                    captureMode: 'quick',
                    projectId: this.activeProject.id
                });
                this.updateStatus('success');
                this.loadRecentCaptures();
            } else {
                throw new Error('Failed to extract page content');
            }
        } catch (error) {
            console.error('Capture failed:', error);
            this.updateStatus('error', 'Failed to capture page content');
        }
    }

    extractPageContent() {
        const content = {
            url: window.location.href,
            title: document.title,
            content: document.body.innerText,
            type: 'full_page',
            metadata: {
                domain: window.location.hostname,
                path: window.location.pathname,
                timestamp: new Date().toISOString(),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            }
        };

        // Platform-specific extraction
        const platform = window.location.hostname;
        if (platform.includes('twitter') || platform.includes('x.com')) {
            content.platform = 'twitter';
            const tweets = document.querySelectorAll('[data-testid="tweet"]');
            content.metadata.tweetCount = tweets.length;
        } else if (platform.includes('reddit')) {
            content.platform = 'reddit';
            const posts = document.querySelectorAll('[data-testid="post-container"]');
            content.metadata.postCount = posts.length;
        } else if (platform.includes('instagram')) {
            content.platform = 'instagram';
        } else if (platform.includes('linkedin')) {
            content.platform = 'linkedin';
        }

        return content;
    }

    async sendContentToBackground(data) {
        try {
            const response = await this.sendMessage({
                action: 'create-capture',
                data: data
            });

            if (response.error) {
                throw new Error(response.error);
            }

            return response;
        } catch (error) {
            console.error('Failed to send content to background:', error);
            throw error;
        }
    }

    async sendMessage(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, (response) => {
                resolve(response || {});
            });
        });
    }

    async loadRecentCaptures() {
        try {
            const storage = await chrome.storage.local.get(['recentCaptures']);
            const captures = storage.recentCaptures || [];
            this.displayRecentCaptures(captures.slice(0, 5));
        } catch (error) {
            console.error('Failed to load recent captures:', error);
        }
    }

    displayRecentCaptures(captures) {
        const container = document.getElementById('recentCaptures');
        if (!captures.length) {
            container.innerHTML = '<div class="empty-state">No recent captures</div>';
            return;
        }

        container.innerHTML = captures.map(capture => `
            <div class="capture-item">
                <div class="capture-header">
                    <span class="capture-title">${this.truncate(capture.title, 50)}</span>
                    <span class="capture-time">${this.formatTime(capture.timestamp)}</span>
                </div>
                <div class="capture-meta">
                    <span class="capture-type">${capture.captureType || 'quick'}</span>
                    ${capture.viralScore ? `<span class="viral-score">Score: ${capture.viralScore}</span>` : ''}
                </div>
                ${capture.summary ? `<p class="capture-summary">${this.truncate(capture.summary, 100)}</p>` : ''}
            </div>
        `).join('');
    }

    truncate(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    openSettings() {
        chrome.runtime.openOptionsPage();
    }

    openDashboard() {
        chrome.tabs.create({ url: this.apiBaseUrl });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StrategicContentCapture();
});