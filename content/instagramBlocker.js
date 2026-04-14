const InstagramBlocker = {
  isBlockedMode: false,

  selectorsToRemove: [
    // Reels links on sidebar navigation
    'a[href^="/reels/"]',
    // Reels links anywhere
    'a[role="link"][href*="/reels/"]'
  ],

  async init() {
    this.isBlockedMode = await TimerManager.isBlocked();
    
    StorageManager.onBlockUpdate((newTime) => {
      this.isBlockedMode = (Date.now() < newTime);
      this.enforce();
    });

    this.enforce();
  },

  enforceRoute() {
    if (!this.isBlockedMode) {
      OverlayManager.removeOverlay();
      return;
    }

    if (window.location.pathname.startsWith('/reels')) {
      OverlayManager.show();
      document.querySelectorAll('video').forEach(vid => vid.pause());
    } else {
      OverlayManager.removeOverlay();
    }
  },

  enforceDOM() {
    if (!this.isBlockedMode) return;

    this.selectorsToRemove.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Find closest list item or div container if possible to hide the whole button
        const parentLi = el.closest('div[role="listitem"]');
        if (parentLi && parentLi.style.display !== 'none') {
            parentLi.style.display = 'none';
        } else if (el.style.display !== 'none') {
            el.style.display = 'none';
        }
      });
    });
  },

  enforce() {
    this.enforceRoute();
    this.enforceDOM();
  }
};
