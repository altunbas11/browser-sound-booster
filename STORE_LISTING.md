# Chrome Web Store Required Documents

## Store Listing Information

### Short Description (132 characters max)

Boost browser tab audio levels up to 300%. Audio amplifier for music, videos, and games.

### Detailed Description

🔊 **Browser Sound Booster** - Powerful Chrome extension that boosts browser tab audio levels!

**✨ Features:**

• Increase volume levels up to 300%
• Simple and user-friendly interface
• Automatic saving per domain
• Quick preset buttons (50%, 100%, 150%, 200%, 300%)
• One-click mute mode
• Quick access via right-click menu
• Secure and privacy-focused

**🎯 Use Cases:**

• Low-volume YouTube videos
• Spotify and music platforms
• Netflix and video sites
• Podcast listening
• Browser games

**🔧 How to Use:**

1. Click the extension icon on any website
2. Adjust volume with the slider or preset buttons
3. Click "Apply" to boost the audio
4. Settings are automatically saved per domain

**🔒 Privacy & Security:**

• Only accesses the active browser tab
• No data collection or external servers
• All settings stored locally
• Open source code available

**⚠️ Important Notice:**

Very high volume levels can cause hearing damage. Use responsibly and at your own risk.

---

## Permission Justifications

### Required Permissions & Host Access

**activeTab**
- **Purpose**: Allows the extension to access and modify audio on the currently active browser tab only
- **Justification**: Essential for audio boosting functionality. Without this permission, the extension cannot access the audio context of web pages to amplify sound levels
- **Scope**: Limited to the currently active tab only, providing user control and security

**tabs**
- **Purpose**: Enables communication between the extension popup and content scripts running on web pages
- **Justification**: Required for the popup interface to send volume control commands to the active tab's content script
- **Scope**: Read-only access to tab information, no modification capabilities

**storage**
- **Purpose**: Saves user volume preferences and settings locally in the browser
- **Justification**: Allows users to have their volume settings remembered per website/domain for a better user experience
- **Scope**: Local browser storage only, no data sent to external servers

**scripting**
- **REMOVED**: Not needed since content script is declared in manifest.json
- **Alternative**: Content scripts are injected automatically by manifest declaration

**Host Permissions: <all_urls>**
- **Purpose**: Allows the extension to work on any website with media content
- **Justification**: Audio boosting should work wherever users consume media (YouTube, Netflix, Spotify, podcasts, games, etc.)
- **Scope**: Content script only runs when user activates the extension, not automatically on all sites
- **Security**: No automatic data access, user-controlled activation only

### Why These Permissions Are Minimal & Necessary

All permissions directly support the **single purpose** of boosting browser tab audio levels:

1. **No external network access** - No data sent to servers
2. **No cookie access** - User privacy protected
3. **No browsing history access** - User activity private
4. **Limited to active tab only** - No background monitoring
5. **Local storage only** - Settings stay on user's device

The extension follows the principle of least privilege - requesting only the minimum permissions required for audio boosting functionality.

**Version:** 1.0.0
**Updated:** October 2025
**Permissions:** activeTab, storage, scripting
**Supported Browsers:** Chrome 88+