window.CONFIG = {
    // Auto-detect API base URL based on environment
    API_BASE_URL: (() => {
        // Check if we're in development or production
        const hostname = window.location?.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000';
        }
        
        // Check for Replit domains
        if (hostname && hostname.includes('replit.')) {
            return `https://${hostname}`;
        }
        
        // Default fallback
        return 'http://localhost:5000';
    })(),
    
    // Extension settings
    SETTINGS: {
        AUTO_CAPTURE_ENABLED: false,
        DEFAULT_ANALYSIS_MODE: 'quick',
        DEFAULT_PRIORITY: 'normal',
        NOTIFICATION_ENABLED: true,
        STORAGE_LIMIT: 50 // Maximum stored captures
    }
};