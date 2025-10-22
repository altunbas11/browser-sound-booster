class SoundBoosterContent {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;
        this.connectedElements = new Set();
        this.observer = null;
        this.currentSettings = null;
        this.monitoringInterval = null;
        this.isYouTube = window.location.hostname.includes('youtube.com');

        this.targetVolume = null;
        this.videoEventListeners = new Map();
        this.aggressiveMonitoringInterval = null;
        this.lastVolumeCheck = 0;

        this.init();
    }

    init() {
        // Mark content script as active to prevent popup conflicts
        window.soundBoosterContentActive = true;
        
        this.setupMessageListener();
        this.loadSavedSettings();
        this.observeNewMedia();
        
        // Start special monitoring for YouTube
        if (this.isYouTube) {
            this.startYouTubeMonitoring();
        }
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'setVolume':
                    this.setVolume(request.volume);
                    if (this.currentSettings) {
                        if (request.volume === 0) {
                            this.currentSettings.isMuted = true;
                        } else {
                            this.currentSettings.isMuted = false;
                            this.currentSettings.volume = request.volume;
                        }
                    }
                    sendResponse({ success: true });
                    break;
                case 'resetVolume':
                    this.resetVolume();
                    this.currentSettings = null;
                    sendResponse({ success: true });
                    break;
                case 'getMediaInfo':
                    sendResponse(this.getMediaInfo());
                    break;
                default:
                    sendResponse({ success: false, error: 'Bilinmeyen aksiyon' });
            }
            return true;
        });
    }

    async loadSavedSettings() {
        try {
            // We can't access tab ID in content script, using domain
            const domain = window.location.hostname;
            
            // Check domain settings
            const domainResult = await chrome.storage.local.get(`domain_${domain}`);
            
            let settings = null;
            
            if (domainResult[`domain_${domain}`]) {
                settings = domainResult[`domain_${domain}`];
                console.log('Content: Domain settings loaded:', settings);
            }
            
            if (settings) {
                // Store settings
                this.currentSettings = settings;
                
                // Apply volume setting if exists
                if (settings.volume && settings.volume !== 100) {
                    this.setVolume(settings.volume);  // settings.volume is already a percentage
                }
                
                // Apply mute state if exists
                if (settings.isMuted) {
                    this.setVolume(0);
                    console.log('Content: Mute state applied');
                }
                
                console.log('Content: Settings cached for monitoring');
            }
        } catch (error) {
            // Silently pass for extension context invalidated error
            if (!error.message.includes('Extension context invalidated')) {
                console.error('Failed to load saved settings:', error);
            }
        }
    }

    createAudioContext() {
        if (!this.audioContext || this.audioContext.state === 'closed') {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
        }
        return this.audioContext;
    }

    setVolume(volumePercentage) {
        try {
            const clampedPercentage = Math.max(0, Math.min(300, volumePercentage));
            const volumeLevel = clampedPercentage / 100;

            this.targetVolume = volumeLevel;

            this.createAudioContext();
            this.gainNode.gain.value = volumeLevel;

            this.connectAllMediaElements();

            this.saveSettings(clampedPercentage);

            console.log('Sound Booster: Volume set to', clampedPercentage + '%', 'Target:', this.targetVolume);
            console.log(`Sound Booster: Volume level set to ${clampedPercentage}%`);

        } catch (error) {
            console.error('Failed to set volume level:', error);
        }
    }

    connectAllMediaElements() {
        const mediaElements = document.querySelectorAll('audio, video');
        
        mediaElements.forEach(element => {
            this.connectMediaElement(element);
        });
    }

    connectMediaElement(element) {
        // Element zaten bağlıysa atlama
        if (this.connectedElements.has(element)) {
            return;
        }

        try {
            // Audio context hazır değilse oluştur
            if (!this.audioContext || !this.gainNode) {
                this.createAudioContext();
            }

            // MediaElementSource oluştur
            const source = this.audioContext.createMediaElementSource(element);
            
            // Gain node üzerinden bağla
            source.connect(this.gainNode);
            
            // Element'i takip et
            this.connectedElements.add(element);
            element.setAttribute('data-sound-booster', 'connected');

            console.log('Sound Booster: Medya elementi bağlandı', element);
            
        } catch (error) {
            // Element zaten başka bir source'a bağlıysa hata verir, bu normal
            console.log('Sound Booster: Element bağlanamadı (muhtemelen zaten bağlı):', error.message);
        }
    }

    observeNewMedia() {
        // Dinamik olarak eklenen medya elementlerini yakala
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Yeni eklenen node'un kendisi medya elementi mi?
                        if (node.matches && node.matches('audio, video')) {
                            this.connectMediaElement(node);
                        }
                        
                        // Alt elementlerde medya elementi var mı?
                        if (node.querySelectorAll) {
                            const mediaElements = node.querySelectorAll('audio, video');
                            mediaElements.forEach(element => {
                                this.connectMediaElement(element);
                            });
                        }
                    }
                });
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    resetVolume() {
        try {
            // Gain'i normale döndür
            if (this.gainNode) {
                this.gainNode.gain.value = 1.0;
            }

            // Bağlantıları temizle
            this.connectedElements.clear();

            // Observer'ı durdur
            if (this.observer) {
                this.observer.disconnect();
            }

            // Audio context'i kapat
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
                this.audioContext = null;
                this.gainNode = null;
            }

            // Data attribute'larını temizle
            document.querySelectorAll('[data-sound-booster]').forEach(element => {
                element.removeAttribute('data-sound-booster');
            });

            // Kayıtlı ayarları temizle
            this.clearSettings();

            console.log('Sound Booster: Volume level reset');
            
        } catch (error) {
            console.error('Volume reset error:', error);
        }
    }

    getMediaInfo() {
        const mediaElements = document.querySelectorAll('audio, video');
        const info = {
            audioElements: 0,
            videoElements: 0,
            connectedElements: this.connectedElements.size,
            currentVolume: this.gainNode ? this.gainNode.gain.value : 1.0
        };

        mediaElements.forEach(element => {
            if (element.tagName.toLowerCase() === 'audio') {
                info.audioElements++;
            } else {
                info.videoElements++;
            }
        });

        return info;
    }

    async saveSettings(volume) {
        try {
            const settings = {
                [window.location.hostname]: {
                    volume: volume,
                    timestamp: Date.now()
                }
            };
            await chrome.storage.local.set(settings);
        } catch (error) {
            // Extension context invalidated hatası için sessizce geç
            if (!error.message.includes('Extension context invalidated')) {
                console.error('Settings save failed:', error);
            }
        }
    }

    async clearSettings() {
        try {
            await chrome.storage.local.remove(window.location.hostname);
        } catch (error) {
            // Extension context invalidated hatası için sessizce geç
            if (!error.message.includes('Extension context invalidated')) {
                console.error('Settings clear failed:', error);
            }
        }
    }
    
    startYouTubeMonitoring() {
        console.log('YouTube aggressive monitoring started');
        
        // Her 2 saniyede ayarları kontrol et (optimize edilmiş)
        this.monitoringInterval = setInterval(() => {
            this.checkAndReapplySettings();
        }, 2000);
        
        // Her 1 saniyede hızlı kontrol (optimize edilmiş)
        this.aggressiveMonitoringInterval = setInterval(() => {
            this.fastVolumeCheck();
        }, 1000);
        
        // URL değişikliklerini takip et (YouTube SPA)
        this.setupUrlChangeDetection();
        
        // Video değişikliklerini özel olarak takip et
        this.setupVideoChangeDetection();
        
        // Video event listener'ları ekle
        this.setupVideoEventListeners();
    }
    
    checkAndReapplySettings() {
        if (!this.currentSettings) return;
        
        // Mevcut video elementlerini kontrol et
        const videoElements = document.querySelectorAll('video');
        
        videoElements.forEach(video => {
            // Check video element's volume level
            const expectedVolume = this.currentSettings.isMuted ? 0 : Math.max(0, Math.min(1, this.currentSettings.volume / 100));
            
            if (Math.abs(video.volume - expectedVolume) > 0.01) {
                console.log('YouTube: Volume drifted, reapplying...', video.volume, '→', expectedVolume);
                
                // Ayarları yeniden uygula
                if (this.currentSettings.isMuted) {
                    this.setVolume(0);
                } else if (this.currentSettings.volume !== 100) {
                    this.setVolume(this.currentSettings.volume);  // Already a percentage
                }
            }
        });
    }
    
    fastVolumeCheck() {
        if (!this.currentSettings || !this.targetVolume) return;
        
        const now = Date.now();
        if (now - this.lastVolumeCheck < 250) return; // Rate limiting artırıldı
        this.lastVolumeCheck = now;
        
        const videoElements = document.querySelectorAll('video');
        
        videoElements.forEach(video => {
            // HTML media element volume should always be 1.0 when using Web Audio API
            const htmlVolume = 1.0;
            if (Math.abs(video.volume - htmlVolume) > 0.01) { // Threshold artırıldı
                console.log('YouTube: Setting HTML volume to 1.0 for Web Audio amplification', video.volume, '→', htmlVolume);
                video.volume = htmlVolume;
            }
        });
    }
    
    setupVideoEventListeners() {
        const addEventListeners = (video) => {
            if (this.videoEventListeners.has(video)) return;
            
            const listeners = {
                volumechange: (e) => {
                    if (!this.currentSettings) return;
                    
                    // HTML media element should always be at 1.0 when using Web Audio API
                    const expectedVolume = 1.0;
                    
                    if (Math.abs(e.target.volume - expectedVolume) > 0.01) {
                        console.log('YouTube: Volume changed by YouTube, forcing back to 1.0 for Web Audio...', e.target.volume, '→', expectedVolume);
                        
                        // requestAnimationFrame kullanarak performance iyileştir
                        requestAnimationFrame(() => {
                            e.target.volume = expectedVolume;
                        });
                    }
                },
                
                loadedmetadata: (e) => {
                    console.log('YouTube: Video metadata loaded, applying settings...');
                    requestAnimationFrame(() => {
                        this.reapplyAllSettings();
                    });
                },
                
                playing: (e) => {
                    console.log('YouTube: Video started playing, ensuring volume...');
                    requestAnimationFrame(() => {
                        this.reapplyAllSettings();
                    });
                }
            };
            
            Object.entries(listeners).forEach(([event, handler]) => {
                video.addEventListener(event, handler);
            });
            
            this.videoEventListeners.set(video, listeners);
            console.log('YouTube: Event listeners added to video element');
        };
        
        // Mevcut videolara listener ekle
        document.querySelectorAll('video').forEach(addEventListeners);
        
        // Yeni videolar için observer
        const videoObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'VIDEO') {
                            addEventListeners(node);
                            setTimeout(() => this.reapplyAllSettings(), 100);
                        }
                        
                        const videos = node.querySelectorAll ? node.querySelectorAll('video') : [];
                        videos.forEach(addEventListeners);
                    }
                });
            });
        });
        
        videoObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    setupUrlChangeDetection() {
        let lastUrl = location.href;
        
        const urlObserver = new MutationObserver(() => {
            const currentUrl = location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                console.log('YouTube: URL changed, reapplying settings...');
                
                // URL değiştiğinde ayarları yeniden uygula
                setTimeout(() => {
                    this.reapplyAllSettings();
                }, 1000);
            }
        });
        
        urlObserver.observe(document, { subtree: true, childList: true });
    }
    
    setupVideoChangeDetection() {
        // Video elementlerinin eklenme/değişimini izle
        const videoObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'VIDEO') {
                            console.log('YouTube: New video element detected');
                            setTimeout(() => {
                                this.reapplyAllSettings();
                            }, 500);
                        }
                        
                        const videos = node.querySelectorAll ? node.querySelectorAll('video') : [];
                        if (videos.length > 0) {
                            console.log('YouTube: New video elements in subtree');
                            setTimeout(() => {
                                this.reapplyAllSettings();
                            }, 500);
                        }
                    }
                });
            });
        });
        
        videoObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    reapplyAllSettings() {
        if (!this.currentSettings) {
            this.loadSavedSettings();
            return;
        }
        
        console.log('YouTube: Reapplying all settings...', this.currentSettings);
        
        if (this.currentSettings.isMuted) {
            this.setVolume(0);
        } else if (this.currentSettings.volume !== 100) {
            this.setVolume(this.currentSettings.volume);
        }
    }

    // Sayfa kapandığında temizlik yap
    cleanup() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        if (this.aggressiveMonitoringInterval) {
            clearInterval(this.aggressiveMonitoringInterval);
            this.aggressiveMonitoringInterval = null;
        }
        
        // Video event listener'ları temizle
        this.videoEventListeners.forEach((listeners, video) => {
            Object.entries(listeners).forEach(([event, handler]) => {
                video.removeEventListener(event, handler);
            });
        });
        this.videoEventListeners.clear();
        
        if (this.observer) {
            this.observer.disconnect();
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.resetVolume();
        
        console.log('Sound Booster: Cleanup completed');
    }
}

// Content script'i performanslı şekilde başlat
let soundBooster;

function initSoundBooster() {
    // Sadece gerekli sayfalarda çalıştır
    if (document.location.protocol === 'chrome:' || 
        document.location.protocol === 'chrome-extension:' ||
        document.location.protocol === 'moz-extension:') {
        return;
    }
    
    try {
        soundBooster = new SoundBoosterContent();
        console.log('Sound Booster Content Script initialized');
    } catch (error) {
        console.error('Sound Booster initialization failed:', error);
    }
}

// Document ready durumuna göre başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSoundBooster);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    // Sayfa zaten yüklenmişse hemen başlat
    initSoundBooster();
}

// Sayfa kapanırken temizlik yap
window.addEventListener('beforeunload', () => {
    if (soundBooster) {
        soundBooster.cleanup();
    }
});

// Global access için (debugging)
if (typeof window !== 'undefined') {
    window.soundBooster = soundBooster;
}