// Logic for calculating block time remaining
const TimerManager = {
  async isBlocked() {
    const endTime = await StorageManager.getBlockEndTime();
    return Date.now() < endTime;
  },

  async getRemainingTime() {
    const endTime = await StorageManager.getBlockEndTime();
    const remaining = endTime - Date.now();
    return remaining > 0 ? remaining : 0;
  },

  async startBlock(hours) {
    const endTime = Date.now() + hours * 60 * 60 * 1000;
    await StorageManager.setBlockEndTime(endTime);
    return endTime;
  },

  async isYoutubeBlocked() {
    const endTime = await StorageManager.getYoutubeBlockEndTime();
    return Date.now() < endTime;
  },

  async getYoutubeRemainingTime() {
    const endTime = await StorageManager.getYoutubeBlockEndTime();
    const remaining = endTime - Date.now();
    return remaining > 0 ? remaining : 0;
  },

  async startYoutubeBlock(hours) {
    const endTime = Date.now() + hours * 60 * 60 * 1000;
    await StorageManager.setYoutubeBlockEndTime(endTime);
    return endTime;
  },
  
  formatRemainingTime(milliseconds) {
    if (milliseconds <= 0) return "00:00:00";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
};
