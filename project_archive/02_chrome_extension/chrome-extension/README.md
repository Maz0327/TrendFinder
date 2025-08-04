# Strategic Content Capture - Chrome Extension

## Overview

A powerful Chrome extension that captures and analyzes web content for strategic intelligence, integrating seamlessly with the Content Radar platform for real-time viral potential scoring and content analysis.

## Features

- **One-Click Content Capture**: Instantly capture any webpage for strategic analysis
- **Smart Text Selection**: Analyze specific content selections with AI-powered insights
- **Image Analysis**: Capture and analyze visual content for cultural relevance
- **Viral Potential Scoring**: Real-time assessment of content's viral potential
- **Strategic Intelligence**: Integration with comprehensive truth analysis framework
- **Keyboard Shortcuts**: Quick access via Ctrl+Shift+C for page capture
- **Context Menu Integration**: Right-click context menus for easy content capture
- **Batch Processing**: Handle multiple content captures efficiently

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `chrome-extension` folder
4. The Strategic Content Capture icon will appear in your browser toolbar

## Usage

### Quick Capture
- Click the extension icon to open the popup
- Select your analysis mode (Quick, Deep, or Competitive)
- Click "Capture Current Page" to analyze the active webpage

### Keyboard Shortcuts
- **Ctrl+Shift+C**: Quick capture of current page
- **Ctrl+Shift+S**: Screenshot capture with analysis

### Context Menu
- Right-click anywhere on a webpage
- Select "Strategic Content Capture" options:
  - Capture Page for Strategic Analysis
  - Capture Selection for Analysis
  - Analyze Image Content
  - Quick Strategic Analysis
  - Deep Cultural Analysis
  - Competitive Intelligence

### Selection Analysis
1. Highlight any text on a webpage
2. Right-click and select "Capture Selection for Analysis"
3. View instant analysis results in the popup

## Analysis Modes

### Quick Analysis
- Basic viral potential scoring
- Summary generation
- Platform detection
- Engagement metrics

### Deep Cultural Analysis
- Four-layer truth analysis framework
- Cultural moment correlation
- Cross-platform pattern detection
- Emerging trend identification

### Competitive Intelligence
- Competitor content analysis
- Market positioning insights
- Strategic recommendations
- Performance benchmarking

## Technical Details

### Content Extraction
The extension intelligently extracts content using multiple strategies:
- Semantic HTML5 elements (main, article, section)
- Largest text blocks identification
- Platform-specific content detection
- Metadata and structured data extraction

### Platform Detection
Automatic detection of major platforms:
- Twitter/X
- Instagram
- LinkedIn
- Facebook
- TikTok
- YouTube
- Reddit
- Medium
- Substack

### Data Security
- All content processing happens on secure servers
- No sensitive data stored locally
- Encrypted communication with Content Radar platform
- Privacy-first approach to content analysis

## API Integration

The extension communicates with the Content Radar backend via these endpoints:

- `POST /api/chrome-extension/capture` - Process captured content
- `POST /api/chrome-extension/batch` - Batch process multiple captures
- `GET /api/chrome-extension/stats` - Extension usage statistics

## Configuration

### Settings Panel
Access extension settings by:
1. Click the extension icon
2. Click the settings gear icon
3. Configure:
   - Auto-capture preferences
   - Default analysis mode
   - Notification settings
   - API endpoint configuration

### Keyboard Shortcuts
Customize keyboard shortcuts in Chrome:
1. Go to `chrome://extensions/shortcuts`
2. Find "Strategic Content Capture"
3. Set your preferred key combinations

## Recent Captures

The extension maintains a history of recent captures:
- Last 50 captures stored locally
- Quick access to previous analyses
- Export capabilities for batch review
- Viral score tracking over time

## Troubleshooting

### Extension Not Working
1. Ensure the Content Radar server is running at `http://localhost:5000`
2. Check that all required permissions are granted
3. Reload the extension in `chrome://extensions/`
4. Check browser console for error messages

### Content Not Capturing
1. Verify the webpage has loaded completely
2. Try refreshing the page and capturing again
3. Check if the site blocks automated content extraction
4. Use selection capture for specific content

### API Connection Issues
1. Confirm Content Radar platform is running
2. Check network connectivity
3. Verify API endpoints are responding
4. Review extension console logs

## Development

### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.js               # Popup logic and UI
├── background.js          # Service worker for extension
├── content.js             # Content script for page interaction
├── styles.css             # Extension styling
└── images/                # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Building Icons
Icons are generated from the SVG master file:
```bash
# Convert SVG to required PNG sizes
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

## Version History

### v1.0.0 (Current)
- Initial release with full feature set
- Integration with Content Radar platform
- Support for all major social media platforms
- Advanced AI analysis capabilities
- Chrome extension store submission ready

## Support

For technical support or feature requests:
- Check the Content Radar platform documentation
- Review extension console logs for detailed error information
- Ensure all API keys and credentials are properly configured
- Contact development team for advanced troubleshooting

## Privacy Policy

This extension:
- Only captures content when explicitly requested by user
- Processes data through secure, encrypted channels
- Does not store sensitive personal information
- Complies with Chrome Web Store privacy requirements
- Provides transparent data handling practices

## License

Part of the Content Radar Strategic Intelligence Platform
All rights reserved - Professional use license