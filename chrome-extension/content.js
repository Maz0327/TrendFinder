// Strategic Content Capture - Content Script

class ContentCapture {
    constructor() {
        this.isInitialized = false;
        this.selectionOverlay = null;
        this.captureIndicator = null;
        this.captureMode = 'precision'; // 'precision' or 'context'
        this.isSelecting = false;
        this.selectionStart = null;
        this.contextHighlight = null;
        this.activeProject = null;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupMessageListener();
        this.setupKeyboardShortcuts();
        this.createCaptureIndicator();
        this.createSelectionOverlay();
        this.createContextHighlight();
        this.loadActiveProject();
        this.isInitialized = true;
        
        console.log('[Strategic Content Capture] Content script initialized');
    }

    async loadActiveProject() {
        const stored = await chrome.storage.local.get(['activeProject']);
        this.activeProject = stored.activeProject;
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
                case 'set-capture-mode':
                    this.setCaptureMode(message.mode);
                    sendResponse({ success: true });
                    break;
                case 'start-precision-capture':
                    this.startPrecisionCapture();
                    sendResponse({ success: true });
                    break;
                case 'start-context-capture':
                    this.startContextCapture();
                    sendResponse({ success: true });
                    break;
                case 'update-active-project':
                    this.activeProject = message.project;
                    sendResponse({ success: true });
                    break;
                default:
                    sendResponse({ error: 'Unknown action' });
            }
            return true; // Keep message channel open
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Tab to toggle between capture modes
            if (this.isSelecting && event.code === 'Tab') {
                event.preventDefault();
                this.toggleCaptureMode();
            }
            
            // Escape to cancel capture
            if (this.isSelecting && event.code === 'Escape') {
                event.preventDefault();
                this.cancelCapture();
            }
        });
    }

    setCaptureMode(mode) {
        this.captureMode = mode;
        if (this.isSelecting) {
            if (mode === 'precision') {
                this.showPrecisionMode();
            } else {
                this.showContextMode();
            }
        }
    }

    toggleCaptureMode() {
        const newMode = this.captureMode === 'precision' ? 'context' : 'precision';
        this.setCaptureMode(newMode);
        this.showCaptureIndicator(`Switched to ${newMode} mode`);
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

    createSelectionOverlay() {
        this.selectionOverlay = document.createElement('div');
        this.selectionOverlay.id = 'strategic-selection-overlay';
        this.selectionOverlay.style.cssText = `
            position: fixed;
            border: 2px dashed #FFD700;
            background: rgba(255, 215, 0, 0.1);
            pointer-events: none;
            z-index: 9999;
            display: none;
        `;
        document.body.appendChild(this.selectionOverlay);
    }

    createContextHighlight() {
        this.contextHighlight = document.createElement('div');
        this.contextHighlight.id = 'strategic-context-highlight';
        this.contextHighlight.style.cssText = `
            position: absolute;
            border: 3px solid #4169E1;
            background: rgba(65, 105, 225, 0.1);
            pointer-events: none;
            z-index: 9998;
            display: none;
            border-radius: 4px;
        `;
        document.body.appendChild(this.contextHighlight);
    }

    startPrecisionCapture() {
        this.isSelecting = true;
        this.captureMode = 'precision';
        document.body.style.cursor = 'crosshair';
        this.showCaptureIndicator('📍 Click and drag to select content');
        
        const handleMouseDown = (e) => {
            e.preventDefault();
            this.selectionStart = { x: e.clientX, y: e.clientY };
            this.selectionOverlay.style.display = 'block';
            this.selectionOverlay.style.left = e.clientX + 'px';
            this.selectionOverlay.style.top = e.clientY + 'px';
            this.selectionOverlay.style.width = '0px';
            this.selectionOverlay.style.height = '0px';
        };

        const handleMouseMove = (e) => {
            if (!this.selectionStart) return;
            
            const width = Math.abs(e.clientX - this.selectionStart.x);
            const height = Math.abs(e.clientY - this.selectionStart.y);
            const left = Math.min(e.clientX, this.selectionStart.x);
            const top = Math.min(e.clientY, this.selectionStart.y);
            
            this.selectionOverlay.style.left = left + 'px';
            this.selectionOverlay.style.top = top + 'px';
            this.selectionOverlay.style.width = width + 'px';
            this.selectionOverlay.style.height = height + 'px';
        };

        const handleMouseUp = async (e) => {
            if (!this.selectionStart) return;
            
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            const bounds = this.selectionOverlay.getBoundingClientRect();
            await this.captureSelection(bounds);
            
            this.cleanupCapture();
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    startContextCapture() {
        this.isSelecting = true;
        this.captureMode = 'context';
        document.body.style.cursor = 'pointer';
        this.showCaptureIndicator('🔷 Click on a thread or post to capture full context');
        
        const handleMouseMove = (e) => {
            const element = this.findContextElement(e.target);
            if (element) {
                this.highlightContextElement(element);
            } else {
                this.contextHighlight.style.display = 'none';
            }
        };

        const handleClick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const element = this.findContextElement(e.target);
            if (element) {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('click', handleClick);
                
                await this.captureContextElement(element);
                this.cleanupCapture();
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick, true);
    }

    findContextElement(target) {
        // Look for common thread/post containers
        const selectors = [
            '[role="article"]',
            '.post-container',
            '.thread-container',
            '.comment-thread',
            'article',
            '.reddit-post',
            '.tweet',
            '.instagram-post',
            '.tiktok-video',
            '.linkedin-post'
        ];
        
        for (const selector of selectors) {
            const element = target.closest(selector);
            if (element) return element;
        }
        
        // Fallback to finding semantic containers
        let current = target;
        while (current && current !== document.body) {
            if (current.children.length > 2 && 
                (current.textContent.length > 100 || current.querySelector('img'))) {
                return current;
            }
            current = current.parentElement;
        }
        
        return null;
    }

    highlightContextElement(element) {
        const rect = element.getBoundingClientRect();
        this.contextHighlight.style.display = 'block';
        this.contextHighlight.style.left = (rect.left + window.scrollX - 5) + 'px';
        this.contextHighlight.style.top = (rect.top + window.scrollY - 5) + 'px';
        this.contextHighlight.style.width = (rect.width + 10) + 'px';
        this.contextHighlight.style.height = (rect.height + 10) + 'px';
    }

    async captureSelection(bounds) {
        try {
            this.showCaptureIndicator('📸 Capturing selection...');
            
            const captureData = {
                type: 'screenshot',
                bounds: {
                    x: bounds.left,
                    y: bounds.top,
                    width: bounds.width,
                    height: bounds.height
                },
                sourceUrl: window.location.href,
                platform: this.detectPlatform(),
                projectId: this.activeProject?.id,
                captureMode: 'precision'
            };
            
            const response = await this.sendToBackground({
                action: 'create-capture',
                data: captureData
            });
            
            if (response.success) {
                this.showCaptureIndicator('✅ Content captured!');
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Capture failed:', error);
            this.showCaptureIndicator('❌ Capture failed');
        }
    }

    async captureContextElement(element) {
        try {
            this.showCaptureIndicator('📸 Capturing full context...');
            
            const captureData = {
                type: 'thread',
                content: element.innerText,
                html: element.outerHTML,
                sourceUrl: window.location.href,
                platform: this.detectPlatform(),
                projectId: this.activeProject?.id,
                captureMode: 'context',
                metadata: this.extractMetadata(element)
            };
            
            const response = await this.sendToBackground({
                action: 'create-capture',
                data: captureData
            });
            
            if (response.success) {
                this.showCaptureIndicator('✅ Context captured!');
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Context capture failed:', error);
            this.showCaptureIndicator('❌ Capture failed');
        }
    }

    cancelCapture() {
        this.cleanupCapture();
        this.showCaptureIndicator('Capture cancelled');
    }

    cleanupCapture() {
        this.isSelecting = false;
        this.selectionStart = null;
        document.body.style.cursor = '';
        this.selectionOverlay.style.display = 'none';
        this.contextHighlight.style.display = 'none';
    }

    detectPlatform() {
        const hostname = window.location.hostname;
        if (hostname.includes('reddit.com')) return 'reddit';
        if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
        if (hostname.includes('instagram.com')) return 'instagram';
        if (hostname.includes('tiktok.com')) return 'tiktok';
        if (hostname.includes('linkedin.com')) return 'linkedin';
        if (hostname.includes('youtube.com')) return 'youtube';
        return 'web';
    }

    extractMetadata(element) {
        const metadata = {};
        
        // Try to extract engagement metrics
        const likes = element.querySelector('[aria-label*="like"], [aria-label*="Like"], .like-count');
        if (likes) metadata.likes = likes.textContent;
        
        const comments = element.querySelector('[aria-label*="comment"], [aria-label*="Comment"], .comment-count');
        if (comments) metadata.comments = comments.textContent;
        
        const shares = element.querySelector('[aria-label*="share"], [aria-label*="Share"], .share-count');
        if (shares) metadata.shares = shares.textContent;
        
        // Extract timestamp
        const time = element.querySelector('time, [datetime]');
        if (time) metadata.timestamp = time.getAttribute('datetime') || time.textContent;
        
        // Extract author
        const author = element.querySelector('[data-author], .author, .username');
        if (author) metadata.author = author.textContent;
        
        return metadata;
    }

    async sendToBackground(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, (response) => {
                resolve(response);
            });
        });
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