console.log('Sound Booster Background Script loaded');

chrome.runtime.onInstalled.addListener((details) => {
    console.log('Sound Booster installed/updated:', details.reason);

    if (details.reason === 'install') {
        console.log('Sound Booster extension installed successfully');
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        handleTabUpdate(tabId, tab);
    }
});
chrome.tabs.onRemoved.addListener((tabId) => {
    console.log('Tab removed:', tabId);
});

// Tab aktif olduğunda
chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log('Tab activated:', activeInfo.tabId);
});

// Mesaj dinleyicisi
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    switch (request.action) {
        case 'updateIcon':
            updateIcon(sender.tab.id, request.active);
            sendResponse({ success: true });
            break;
        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
    
    return true;
});

async function handleTabUpdate(tabId, tab) {
    try {
        // Desteklenen URL mi kontrol et
        if (!isSupportedUrl(tab.url)) {
            return;
        }

        // Bu tab için kaydedilmiş ayar var mı?
        const domain = new URL(tab.url).hostname;
        const domainResult = await chrome.storage.local.get(`domain_${domain}`);
        
        if (domainResult[`domain_${domain}`]) {
            const settings = domainResult[`domain_${domain}`];
            
            if (settings.volume !== 100 || settings.isMuted) {
                updateIcon(tabId, true);
            } else {
                updateIcon(tabId, false);
            }
        } else {
            updateIcon(tabId, false);
        }
        
    } catch (error) {
        console.error('Tab update handling failed:', error);
    }
}

function updateIcon(tabId, isActive) {
    try {
        const iconPath = {
            "16": "icons/icon16.svg",
            "32": "icons/icon32.svg",
            "48": "icons/icon48.svg",
            "128": "icons/icon128.svg"
        };

        chrome.action.setIcon({ 
            tabId: tabId, 
            path: iconPath 
        });
        
        const title = isActive ? 'Sound Booster (Aktif)' : 'Sound Booster';
        chrome.action.setTitle({
            tabId: tabId,
            title: title
        });
        
    } catch (error) {
        console.error('Icon update failed:', error);
    }
}

function isSupportedUrl(url) {
    if (!url) return false;
    
    const unsupportedSchemes = ['chrome:', 'chrome-extension:', 'moz-extension:', 'about:', 'file:'];
    return !unsupportedSchemes.some(scheme => url.startsWith(scheme));
}

console.log('Sound Booster Background Script initialized successfully');