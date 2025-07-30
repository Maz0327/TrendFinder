// Strategic Content Capture - Content Script

class ContentCapture {
    constructor() {
        this.isInitialized = false;
        this.selectionOverlay = null;
        this.captureIndicator = null;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupMessageListener();
        this.setupKeyboardShortcuts();
        this.createCaptureIndicator();
        this.isInitialized = true;
        
        console.log('[Strategic Content Capture] Content script initialized');
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.action) {
                case 'extract-content':
                    this.extractPageContent(sendResponse);
                    break;
                case 'extract-selection':
                    this.extractSelection(sendResponse);
                    break;
                case 'capture-screenshot':
                    this.prepareForScreenshot(sendResponse);
                    break;
                case 'highlight-element':
                    this.highlightElement(message.selector);
                    break;
                default:
                    sendResponse({ error: 'Unknown action' });
            }
            return true; // Keep message channel open
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+C for quick capture
            if (event.ctrlKey && event.shiftKey && event.code === 'KeyC') {
                event.preventDefault();
                this.quickCapture();
            }
            
            // Ctrl+Shift+S for screenshot capture
            if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {
                event.preventDefault();
                this.screenshotCapture();
            }
        });
    }

    createCaptureIndicator() {
        this.captureIndicator = document.createElement('div');
        this.captureIndicator.id = 'strategic-capture-indicator';
        this.captureIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            pointer-events: none;
        `;
        document.body.appendChild(this.captureIndicator);
    }

    showCaptureIndicator(message, duration = 2000) {
        this.captureIndicator.textContent = message;
        this.captureIndicator.style.opacity = '1';
        this.captureIndicator.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            this.captureIndicator.style.opacity = '0';
            this.captureIndicator.style.transform = 'translateY(-10px)';
        }, duration);
    }

    async quickCapture() {
        try {
            this.showCaptureIndicator('📝 Capturing page content...');
            
            const contentData = this.extractPageContent();
            const response = await this.sendToBackground({
                action: 'capture-page',
                data: contentData,
                analysisMode: 'quick'
            });
            
            if (response.success) {
                this.showCaptureIndicator('✅ Content captured successfully!');
            } else {
                throw new Error(response.error || 'Capture failed');
            }
        } catch (error) {
            console.error('Quick capture failed:', error);
            this.showCaptureIndicator('❌ Capture failed');
        }
    }

    async screenshotCapture() {
        try {
            this.showCaptureIndicator('📸 Preparing screenshot...');
            
            // Send message to background script to take screenshot
            const response = await this.sendToBackground({
                action: 'capture-screenshot',
                data: {
                    url: window.location.href,
                    title: document.title,
                    timestamp: new Date().toISOString()
                }
            });
            
            if (response.success) {
                this.showCaptureIndicator('✅ Screenshot captured!');
            } else {
                throw new Error(response.error || 'Screenshot failed');
            }
        } catch (error) {
            console.error('Screenshot capture failed:', error);
            this.showCaptureIndicator('❌ Screenshot failed');
        }
    }

    extractPageContent(sendResponse = null) {
        try {
            // Get page title and URL
            const title = document.title;
            const url = window.location.href;
            
            // Extract main content using various strategies
            let content = this.extractMainContent();
            
            // Extract metadata
            const metadata = this.extractMetadata();
            
            // Extract structured data
            const structuredData = this.extractStructuredData();
            
            // Detect platform type
            const platform = this.detectPlatform();
            
            const result = {
                title,
                url,
                content: content.substring(0, 10000), // Limit content length
                metadata: {
                    ...metadata,
                    platform,
                    structuredData,
                    domain: window.location.hostname,
                    timestamp: new Date().toISOString(),
                    wordCount: content.split(/\s+/).length,
                    hasImages: document.querySelectorAll('img').length > 0,
                    hasVideos: document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0
                }
            };
            
            if (sendResponse) {
                sendResponse({ success: true, data: result });
            }
            
            return result;
        } catch (error) {
            console.error('Content extraction failed:', error);
            const errorResult = { error: error.message };
            
            if (sendResponse) {
                sendResponse(errorResult);
            }
            
            return errorResult;
        }
    }

    extractMainContent() {
        // Strategy 1: Try semantic HTML5 elements
        const semanticSelectors = [
            'main',
            'article',
            '[role="main"]',
            '.main-content',
            '.content',
            '.post-content',
            '.entry-content',
            '.article-content'
        ];
        
        for (const selector of semanticSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim().length > 100) {
                return this.cleanText(element.textContent);
            }
        }
        
        // Strategy 2: Find largest text block
        const textElements = document.querySelectorAll('p, div, span, section');
        let largestElement = null;
        let largestLength = 0;
        
        textElements.forEach(element => {
            const text = element.textContent.trim();
            if (text.length > largestLength && text.length > 100) {
                largestLength = text.length;
                largestElement = element;
            }
        });
        
        if (largestElement) {
            return this.cleanText(largestElement.textContent);
        }
        
        // Strategy 3: Fallback to body
        return this.cleanText(document.body.textContent);
    }

    extractMetadata() {
        const metadata = {};
        
        // Meta tags
        document.querySelectorAll('meta').forEach(meta => {
            const name = meta.getAttribute('name') || meta.getAttribute('property');
            const content = meta.getAttribute('content');
            if (name && content) {
                metadata[name] = content;
            }
        });
        
        // Open Graph and Twitter Card data
        const ogData = {};
        const twitterData = {};
        
        document.querySelectorAll('meta[property^="og:"]').forEach(meta => {
            const property = meta.getAttribute('property').replace('og:', '');
            ogData[property] = meta.getAttribute('content');
        });
        
        document.querySelectorAll('meta[name^="twitter:"]').forEach(meta => {
            const name = meta.getAttribute('name').replace('twitter:', '');
            twitterData[name] = meta.getAttribute('content');
        });
        
        if (Object.keys(ogData).length > 0) metadata.openGraph = ogData;
        if (Object.keys(twitterData).length > 0) metadata.twitter = twitterData;
        
        // Additional page info
        metadata.lang = document.documentElement.lang || 'en';
        metadata.charset = document.characterSet;
        metadata.viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content');
        
        return metadata;
    }

    extractStructuredData() {
        const structuredData = [];
        
        // JSON-LD structured data
        document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                structuredData.push(data);
            } catch (error) {
                console.warn('Failed to parse JSON-LD:', error);
            }
        });
        
        return structuredData;
    }

    detectPlatform() {
        const hostname = window.location.hostname.toLowerCase();
        const platformMap = {
            'twitter.com': 'twitter',
            'x.com': 'twitter',
            'instagram.com': 'instagram',
            'linkedin.com': 'linkedin',
            'facebook.com': 'facebook',
            'tiktok.com': 'tiktok',
            'youtube.com': 'youtube',
            'reddit.com': 'reddit',
            'medium.com': 'medium',
            'substack.com': 'substack'
        };
        
        for (const [domain, platform] of Object.entries(platformMap)) {
            if (hostname.includes(domain)) {
                return platform;
            }
        }
        
        return 'web';
    }

    extractSelection(sendResponse = null) {
        try {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (!selectedText) {
                const result = { error: 'No text selected' };
                if (sendResponse) sendResponse(result);
                return result;
            }
            
            const result = {
                url: window.location.href,
                title: document.title,
                content: selectedText,
                metadata: {
                    domain: window.location.hostname,
                    platform: this.detectPlatform(),
                    selectionLength: selectedText.length,
                    timestamp: new Date().toISOString()
                }
            };
            
            if (sendResponse) {
                sendResponse({ success: true, data: result });
            }
            
            return result;
        } catch (error) {
            console.error('Selection extraction failed:', error);
            const errorResult = { error: error.message };
            
            if (sendResponse) {
                sendResponse(errorResult);
            }
            
            return errorResult;
        }
    }

    prepareForScreenshot(sendResponse = null) {
        try {
            // Hide any overlays or popups that might interfere
            const elementsToHide = document.querySelectorAll(
                '[id*="popup"], [class*="modal"], [class*="overlay"], [id*="strategic-capture"]'
            );
            
            elementsToHide.forEach(element => {
                element.style.visibility = 'hidden';
            });
            
            // Prepare page info for screenshot analysis
            const result = {
                url: window.location.href,
                title: document.title,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                metadata: {
                    domain: window.location.hostname,
                    platform: this.detectPlatform(),
                    timestamp: new Date().toISOString()
                }
            };
            
            // Restore hidden elements after a brief delay
            setTimeout(() => {
                elementsToHide.forEach(element => {
                    element.style.visibility = 'visible';
                });
            }, 100);
            
            if (sendResponse) {
                sendResponse({ success: true, data: result });
            }
            
            return result;
        } catch (error) {
            console.error('Screenshot preparation failed:', error);
            const errorResult = { error: error.message };
            
            if (sendResponse) {
                sendResponse(errorResult);
            }
            
            return errorResult;
        }
    }

    highlightElement(selector) {
        try {
            const element = document.querySelector(selector);
            if (element) {
                element.style.outline = '3px solid #667eea';
                element.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                
                setTimeout(() => {
                    element.style.outline = '';
                    element.style.backgroundColor = '';
                }, 2000);
            }
        } catch (error) {
            console.error('Element highlighting failed:', error);
        }
    }

    cleanText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    }

    sendToBackground(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, resolve);
        });
    }
}

// Initialize content script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ContentCapture();
    });
} else {
    new ContentCapture();
}