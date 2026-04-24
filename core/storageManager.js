// Wrapper around chrome.storage.local
const StorageManager = {
  async setBlockEndTime(timestamp) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ blockEndTime: timestamp }, () => {
        resolve();
      });
    });
  },

  async getBlockEndTime() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['blockEndTime'], (result) => {
        resolve(result.blockEndTime || 0);
      });
    });
  },

  async setYoutubeBlockEndTime(timestamp) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ youtubeBlockEndTime: timestamp }, () => resolve());
    });
  },

  async getYoutubeBlockEndTime() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['youtubeBlockEndTime'], (result) => {
        resolve(result.youtubeBlockEndTime || 0);
      });
    });
  },

  // Listen to changes in storage to update state across tabs
  onBlockUpdate(callback) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        const updates = {};
        if (changes.blockEndTime) {
          updates.blockEndTime = changes.blockEndTime.newValue;
        }
        if (changes.youtubeBlockEndTime) {
          updates.youtubeBlockEndTime = changes.youtubeBlockEndTime.newValue;
        }
        if (Object.keys(updates).length > 0) {
          callback(updates);
        }
      }
    });
  }
};
