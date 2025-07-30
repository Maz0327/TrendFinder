class StrategicContentCapture {
    constructor() {
        this.apiBaseUrl = window.CONFIG?.API_BASE_URL || 'http://localhost:5000';
        this.currentTab = null;
        this.initializeExtension();
    }

    async initializeExtension() {
        await this.getCurrentTab();
        this.setupEventListeners();
        this.updateStatus('ready');
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
        document.getElementById('captureButton').addEventListener('click', () => this.captureCurrentPage());
        document.getElementById('captureSelectionButton').addEventListener('click', () => this.captureSelection());
        document.getElementById('captureScreenshotButton').addEventListener('click', () => this.captureScreenshot());
        document.getElementById('settingsButton').addEventListener('click', () => this.openSettings());
        document.getElementById('dashboardButton').addEventListener('click', () => this.openDashboard());
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

    async captureCurrentPage() {
        if (!this.currentTab) {
            this.updateStatus('error', 'No active tab found');
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
                await this.sendContentToAPI(result.result, 'full_page');
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

    async captureSelection() {
        if (!this.currentTab) {
            this.updateStatus('error', 'No active tab found');
            return;
        }

        this.updateStatus('processing');
        
        try {
            const [result] = await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                func: this.extractSelectedContent
            });

            if (result?.result && result.result.content) {
                await this.sendContentToAPI(result.result, 'selection');
                this.updateStatus('success');
                this.loadRecentCaptures();
            } else {
                throw new Error('No content selected or failed to extract');
            }
        } catch (error) {
            console.error('Selection capture failed:', error);
            this.updateStatus('error', 'Failed to capture selection');
        }
    }

    async captureScreenshot() {
        if (!this.currentTab) {
            this.updateStatus('error', 'No active tab found');
            return;
        }

        this.updateStatus('processing');
        
        try {
            const screenshot = await chrome.tabs.captureVisibleTab();
            
            const contentData = {
                url: this.currentTab.url,
                title: this.currentTab.title,
                screenshot: screenshot,
                captureType: 'screenshot',
                timestamp: new Date().toISOString()
            };

            await this.sendContentToAPI(contentData, 'screenshot');
            this.updateStatus('success');
            this.loadRecentCaptures();
        } catch (error) {
            console.error('Screenshot capture failed:', error);
            this.updateStatus('error', 'Failed to capture screenshot');
        }
    }

    async sendContentToAPI(contentData, captureType) {
        const analysisMode = document.getElementById('analysisMode').value;
        const priority = document.getElementById('priority').value;

        const payload = {
            ...contentData,
            captureType,
            analysisMode,
            priority,
            extensionVersion: '1.0.0',
            browserContext: {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            }
        };

        const response = await fetch(`${this.apiBaseUrl}/api/chrome-extension/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const result = await response.json();
        
        // Store capture in local storage for recent captures list
        await this.storeCaptureRecord(payload, result);
        
        return result;
    }

    async storeCaptureRecord(payload, result) {
        try {
            const storage = await chrome.storage.local.get(['recentCaptures']);
            let captures = storage.recentCaptures || [];
            
            const captureRecord = {
                id: result.id || Date.now().toString(),
                url: payload.url,
                title: payload.title,
                captureType: payload.captureType,
                analysisMode: payload.analysisMode,
                timestamp: payload.timestamp || new Date().toISOString(),
                viralScore: result.viralScore,
                summary: result.summary
            };
            
            captures.unshift(captureRecord);
            captures = captures.slice(0, 10); // Keep only last 10 captures
            
            await chrome.storage.local.set({ recentCaptures: captures });
        } catch (error) {
            console.error('Failed to store capture record:', error);
        }
    }

    async loadRecentCaptures() {
        try {
            const storage = await chrome.storage.local.get(['recentCaptures']);
            const captures = storage.recentCaptures || [];
            
            const capturesList = document.getElementById('capturesList');
            
            if (captures.length === 0) {
                capturesList.innerHTML = '<p class="no-captures">No recent captures</p>';
                return;
            }
            
            capturesList.innerHTML = captures.map(capture => `
                <div class="capture-item">
                    <div class="capture-title">${capture.title || 'Untitled'}</div>
                    <div class="capture-meta">
                        <span class="capture-type">${capture.captureType}</span>
                        <span class="viral-score">Score: ${capture.viralScore || 'N/A'}</span>
                    </div>
                    <div class="capture-summary">${(capture.summary || '').substring(0, 100)}...</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load recent captures:', error);
        }
    }

    openSettings() {
        chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    }

    openDashboard() {
        chrome.tabs.create({ url: `${this.apiBaseUrl}/dashboard` });
    }

    // Content extraction functions (executed in page context)
    extractPageContent() {
        const title = document.title;
        const url = window.location.href;
        
        // Extract main content
        let content = '';
        
        // Try common content selectors
        const contentSelectors = [
            'main',
            'article',
            '[role="main"]',
            '.content',
            '.post-content',
            '.entry-content',
            '#content'
        ];
        
        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                content = element.innerText || element.textContent;
                break;
            }
        }
        
        // Fallback to body if no specific content found
        if (!content) {
            content = document.body.innerText || document.body.textContent;
        }
        
        // Extract metadata
        const metaTags = {};
        document.querySelectorAll('meta').forEach(meta => {
            const name = meta.getAttribute('name') || meta.getAttribute('property');
            const content = meta.getAttribute('content');
            if (name && content) {
                metaTags[name] = content;
            }
        });
        
        return {
            title,
            url,
            content: content.substring(0, 5000), // Limit content length
            metadata: {
                domain: window.location.hostname,
                metaTags,
                timestamp: new Date().toISOString()
            }
        };
    }

    extractSelectedContent() {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        if (!selectedText) {
            return { content: null };
        }
        
        return {
            url: window.location.href,
            title: document.title,
            content: selectedText,
            metadata: {
                domain: window.location.hostname,
                selectionRange: {
                    start: selection.anchorOffset,
                    end: selection.focusOffset
                },
                timestamp: new Date().toISOString()
            }
        };
    }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StrategicContentCapture();
});