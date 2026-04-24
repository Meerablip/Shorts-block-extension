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

  async setBlockWholeYoutube(value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ blockWholeYoutube: value }, () => resolve());
    });
  },

  async getBlockWholeYoutube() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['blockWholeYoutube'], (result) => {
        resolve(!!result.blockWholeYoutube);
      });
    });
  },

  // Listen to changes in storage to update state across tabs
  onBlockUpdate(callback) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.blockEndTime) {
        callback(changes.blockEndTime.newValue);
      }
    });
  },

  onSettingsUpdate(callback) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.blockWholeYoutube !== undefined) {
        callback(changes.blockWholeYoutube.newValue);
      }
    });
  }
};
