class SoundBoosterPopup {
    constructor() {
        this.currentVolume = 100;
        this.isMuted = false;
        this.savedVolumeBeforeMute = null;
        this.statusTimeout = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.updateTabInfo();
    }

    bindEvents() {
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');

        let sliderTimeout;
        volumeSlider.addEventListener('input', (e) => {
            this.currentVolume = parseInt(e.target.value);
            volumeValue.textContent = `${this.currentVolume}%`;
            this.updatePresetButtons();
            this.clearMuteState();

            clearTimeout(sliderTimeout);
            sliderTimeout = setTimeout(() => {
                this.applyVolumeToTab();
            }, 100);
        });

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const volume = parseInt(e.target.dataset.volume);
                this.setVolume(volume);
                this.clearMuteState();
                this.applyVolumeToTab();
            });
        });

        document.getElementById('applyBtn').addEventListener('click', () => {
            this.applyVolumeToTab();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetVolume();
        });

        document.getElementById('muteBtn').addEventListener('click', () => {
            this.toggleMute();
        });
    }

    setVolume(volume) {
        this.currentVolume = volume;
        document.getElementById('volumeSlider').value = volume;
        document.getElementById('volumeValue').textContent = `${volume}%`;
        this.updatePresetButtons();
    }

    updatePresetButtons() {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            const btnVolume = parseInt(btn.dataset.volume);
            btn.classList.toggle('active', btnVolume === this.currentVolume);
        });
    }

    async applyVolumeToTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab) {
                throw new Error('No active tab found');
            }

            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'setVolume',
                volume: this.currentVolume
            });

            if (response && response.success) {
                await this.saveSettings(tab.id, this.currentVolume, this.isMuted, this.savedVolumeBeforeMute);
                this.updateStatus('Volume level applied!', 'success');
            } else {
                throw new Error('Content script did not respond successfully');
            }

        } catch (error) {
            console.error('Failed to apply volume level:', error);
            this.updateStatus('Error: Failed to apply volume level', 'error');
        }
    }

    async resetVolume() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab) {
                throw new Error('No active tab found');
            }

            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'resetVolume'
            });

            if (response && response.success) {
                this.setVolume(100);
                this.isMuted = false;
                this.savedVolumeBeforeMute = null;
                await this.saveSettings(tab.id, 100, false, null);
                this.updateStatus('Volume reset to 100%', 'success');
            } else {
                throw new Error('Content script did not respond successfully');
            }

        } catch (error) {
            console.error('Failed to reset volume:', error);
            this.updateStatus('Error: Failed to reset volume', 'error');
        }
    }

    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
    }

    mute() {
        if (this.isMuted) return;

        this.isMuted = true;
        this.savedVolumeBeforeMute = this.currentVolume;

        document.getElementById('volumeSlider').value = 0;
        document.getElementById('volumeValue').textContent = '0%';
        document.getElementById('muteBtn').textContent = 'Unmute';

        this.applyVolumeToTab();
    }

    unmute() {
        if (!this.isMuted) return;

        this.isMuted = false;

        this.setVolume(this.savedVolumeBeforeMute || 100);
        document.getElementById('muteBtn').textContent = 'Mute';

        this.applyVolumeToTab();
    }

    clearMuteState() {
        if (this.isMuted) {
            this.isMuted = false;
            document.getElementById('muteBtn').textContent = 'Mute';
        }
    }

    async loadSettings() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) return;

            const result = await chrome.storage.local.get([`tab_${tab.id}`]);
            const settings = result[`tab_${tab.id}`];

            if (settings) {
                this.currentVolume = settings.volume || 100;
                this.isMuted = settings.isMuted || false;
                this.savedVolumeBeforeMute = settings.savedVolumeBeforeMute || null;

                this.setVolume(this.currentVolume);

                if (this.isMuted) {
                    document.getElementById('volumeSlider').value = 0;
                    document.getElementById('volumeValue').textContent = '0%';
                    document.getElementById('muteBtn').textContent = 'Unmute';
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    async saveSettings(tabId, volume, isMuted, savedVolumeBeforeMute) {
        try {
            await chrome.storage.local.set({
                [`tab_${tabId}`]: {
                    volume,
                    isMuted,
                    savedVolumeBeforeMute,
                    timestamp: Date.now()
                }
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    updateStatus(message, type) {
        const statusElement = document.getElementById('status');
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;

        clearTimeout(this.statusTimeout);
        this.statusTimeout = setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'status';
        }, 3000);
    }

    async updateTabInfo() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                document.getElementById('tabTitle').textContent = tab.title || 'Unknown Tab';
                document.getElementById('tabUrl').textContent = tab.url || '';
            }
        } catch (error) {
            console.error('Failed to update tab info:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SoundBoosterPopup();
});