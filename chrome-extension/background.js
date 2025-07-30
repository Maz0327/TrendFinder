// Strategic Content Capture - Background Service Worker

class BackgroundService {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5000';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });

        // Context menu setup
        chrome.runtime.onInstalled.addListener(() => {
            this.createContextMenus();
        });

        // Context menu clicks
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });

        // Message handling from popup and content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async response
        });

        // Notification clicks
        chrome.notifications.onClicked.addListener((notificationId) => {
            this.handleNotificationClick(notificationId);
        });

        // Alarm for periodic tasks
        chrome.alarms.onAlarm.addListener((alarm) => {
            this.handleAlarm(alarm);
        });
    }

    handleInstallation(details) {
        console.log('Strategic Content Capture installed:', details.reason);
        
        if (details.reason === 'install') {
            // Set default settings
            chrome.storage.local.set({
                settings: {
                    autoCapture: false,
                    defaultAnalysis: 'quick',
                    notifications: true,
                    apiUrl: this.apiBaseUrl
                },
                recentCaptures: []
            });

            // Show welcome notification
            this.showNotification(
                'welcome',
                'Strategic Content Capture',
                'Extension installed successfully! Click the extension icon to start capturing content.',
                'images/icon48.png'
            );
        }
    }

    createContextMenus() {
        // Remove existing menus first
        chrome.contextMenus.removeAll(() => {
            // Main capture menu
            chrome.contextMenus.create({
                id: 'capture-page',
                title: 'Capture Page for Strategic Analysis',
                contexts: ['page']
            });

            // Selection capture
            chrome.contextMenus.create({
                id: 'capture-selection',
                title: 'Capture Selection for Analysis',
                contexts: ['selection']
            });

            // Image capture
            chrome.contextMenus.create({
                id: 'capture-image',
                title: 'Analyze Image Content',
                contexts: ['image']
            });

            // Separator
            chrome.contextMenus.create({
                id: 'separator1',
                type: 'separator',
                contexts: ['page', 'selection', 'image']
            });

            // Quick actions submenu
            chrome.contextMenus.create({
                id: 'quick-analysis',
                title: 'Quick Strategic Analysis',
                contexts: ['page', 'selection']
            });

            chrome.contextMenus.create({
                id: 'deep-analysis',
                title: 'Deep Cultural Analysis',
                contexts: ['page', 'selection']
            });

            chrome.contextMenus.create({
                id: 'competitive-intel',
                title: 'Competitive Intelligence',
                contexts: ['page', 'selection']
            });
        });
    }

    async handleContextMenuClick(info, tab) {
        try {
            const analysisMode = this.getAnalysisModeFromMenuId(info.menuItemId);
            
            switch (info.menuItemId) {
                case 'capture-page':
                    await this.capturePageContent(tab, 'quick');
                    break;
                case 'capture-selection':
                    await this.captureSelectedContent(tab, info.selectionText, 'quick');
                    break;
                case 'capture-image':
                    await this.captureImageContent(tab, info.srcUrl, 'quick');
                    break;
                case 'quick-analysis':
                case 'deep-analysis':
                case 'competitive-intel':
                    await this.capturePageContent(tab, analysisMode);
                    break;
            }
        } catch (error) {
            console.error('Context menu action failed:', error);
            this.showNotification(
                'error',
                'Capture Failed',
                'Failed to capture content. Please try again.',
                'images/icon48.png'
            );
        }
    }

    getAnalysisModeFromMenuId(menuItemId) {
        const modeMap = {
            'quick-analysis': 'quick',
            'deep-analysis': 'deep',
            'competitive-intel': 'competitive'
        };
        return modeMap[menuItemId] || 'quick';
    }

    async capturePageContent(tab, analysisMode = 'quick') {
        try {
            const [result] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    return {
                        title: document.title,
                        url: window.location.href,
                        content: document.body.innerText || document.body.textContent,
                        metadata: {
                            domain: window.location.hostname,
                            timestamp: new Date().toISOString()
                        }
                    };
                }
            });

            if (result?.result) {
                await this.sendToAPI({
                    ...result.result,
                    captureType: 'full_page',
                    analysisMode,
                    priority: 'normal'
                });
                
                this.showNotification(
                    'success',
                    'Content Captured',
                    `Page captured for ${analysisMode} analysis`,
                    'images/icon48.png'
                );
            }
        } catch (error) {
            console.error('Page capture failed:', error);
            throw error;
        }
    }

    async captureSelectedContent(tab, selectionText, analysisMode = 'quick') {
        try {
            const contentData = {
                title: tab.title,
                url: tab.url,
                content: selectionText,
                captureType: 'selection',
                analysisMode,
                priority: 'normal',
                metadata: {
                    domain: new URL(tab.url).hostname,
                    timestamp: new Date().toISOString()
                }
            };

            await this.sendToAPI(contentData);
            
            this.showNotification(
                'success',
                'Selection Captured',
                `Selected text captured for ${analysisMode} analysis`,
                'images/icon48.png'
            );
        } catch (error) {
            console.error('Selection capture failed:', error);
            throw error;
        }
    }

    async captureImageContent(tab, imageUrl, analysisMode = 'quick') {
        try {
            const contentData = {
                title: tab.title,
                url: tab.url,
                imageUrl: imageUrl,
                captureType: 'image',
                analysisMode,
                priority: 'normal',
                metadata: {
                    domain: new URL(tab.url).hostname,
                    timestamp: new Date().toISOString()
                }
            };

            await this.sendToAPI(contentData);
            
            this.showNotification(
                'success',
                'Image Captured',
                `Image captured for ${analysisMode} analysis`,
                'images/icon48.png'
            );
        } catch (error) {
            console.error('Image capture failed:', error);
            throw error;
        }
    }

    async sendToAPI(data) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/chrome-extension/capture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    extensionVersion: '1.0.0',
                    browserContext: {
                        userAgent: navigator.userAgent,
                        timestamp: new Date().toISOString()
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const result = await response.json();
            
            // Store in recent captures
            await this.storeCapture(data, result);
            
            return result;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async storeCapture(data, result) {
        try {
            const storage = await chrome.storage.local.get(['recentCaptures']);
            let captures = storage.recentCaptures || [];
            
            const capture = {
                id: result.id || Date.now().toString(),
                title: data.title,
                url: data.url,
                captureType: data.captureType,
                analysisMode: data.analysisMode,
                timestamp: data.metadata?.timestamp || new Date().toISOString(),
                viralScore: result.viralScore,
                summary: result.summary
            };
            
            captures.unshift(capture);
            captures = captures.slice(0, 50); // Keep last 50 captures
            
            await chrome.storage.local.set({ recentCaptures: captures });
        } catch (error) {
            console.error('Failed to store capture:', error);
        }
    }

    handleMessage(message, sender, sendResponse) {
        switch (message.action) {
            case 'capture-page':
                this.capturePageFromMessage(message, sendResponse);
                break;
            case 'get-settings':
                this.getSettings(sendResponse);
                break;
            case 'update-settings':
                this.updateSettings(message.settings, sendResponse);
                break;
            case 'clear-captures':
                this.clearCaptures(sendResponse);
                break;
            default:
                sendResponse({ error: 'Unknown action' });
        }
    }

    async capturePageFromMessage(message, sendResponse) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await this.capturePageContent(tab, message.analysisMode || 'quick');
            sendResponse({ success: true });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }

    async getSettings(sendResponse) {
        try {
            const result = await chrome.storage.local.get(['settings']);
            sendResponse({ settings: result.settings || {} });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }

    async updateSettings(settings, sendResponse) {
        try {
            await chrome.storage.local.set({ settings });
            sendResponse({ success: true });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }

    async clearCaptures(sendResponse) {
        try {
            await chrome.storage.local.set({ recentCaptures: [] });
            sendResponse({ success: true });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }

    showNotification(id, title, message, iconUrl) {
        chrome.notifications.create(id, {
            type: 'basic',
            iconUrl: iconUrl,
            title: title,
            message: message
        });
    }

    handleNotificationClick(notificationId) {
        if (notificationId === 'welcome') {
            chrome.tabs.create({ url: `${this.apiBaseUrl}/dashboard` });
        }
        chrome.notifications.clear(notificationId);
    }

    handleAlarm(alarm) {
        // Handle periodic tasks if needed
        console.log('Alarm triggered:', alarm.name);
    }
}

// Initialize background service
new BackgroundService();