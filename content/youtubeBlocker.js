const YoutubeBlocker = {
  isBlockedMode: false,
  isWholeYoutubeBlocked: false,

  selectorsToRemove: [
    // Shorts shelf on homepage
    'ytd-rich-shelf-renderer[is-shorts]',
    // New grid shorts shelf
    'ytd-rich-section-renderer.style-scope.ytd-rich-grid-renderer:has(span[title="Shorts"])',
    // Left sidebar Shorts link
    'ytd-guide-entry-renderer a[title="Shorts"]',
    'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
    // Individual shorts on any page
    'ytd-video-renderer ytd-thumbnail[href^="/shorts"]',
    'ytd-grid-video-renderer:has(a[href^="/shorts"])'
  ],

  async init() {
    this.isBlockedMode = await TimerManager.isBlocked();
    this.isWholeYoutubeBlocked = await StorageManager.getBlockWholeYoutube();
    
    // Listen for storage changes
    StorageManager.onBlockUpdate((newTime) => {
      this.isBlockedMode = (Date.now() < newTime);
      this.enforce();
    });

    StorageManager.onSettingsUpdate((isWhole) => {
      this.isWholeYoutubeBlocked = isWhole;
      this.enforce();
    });

    this.enforce();
  },

  enforceRoute() {
    if (!this.isBlockedMode) {
      OverlayManager.removeOverlay();
      return;
    }

    if (this.isWholeYoutubeBlocked || window.location.pathname.startsWith('/shorts')) {
      OverlayManager.show();
      // Try to pause `<video>` elements in background
      document.querySelectorAll('video').forEach(vid => vid.pause());
    } else {
      OverlayManager.removeOverlay();
    }
  },

  enforceDOM() {
    if (!this.isBlockedMode) return;
    if (this.isWholeYoutubeBlocked) return; // No need to hide specific DOM elements if whole site is covered by overlay

    this.selectorsToRemove.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Just hide them instead of removing to resist SPA issues
        if (el.style.display !== 'none') {
          el.style.display = 'none';
        }
      });
    });
    
    // Additional generic fallback for items with 'href' pointing to shorts
    document.querySelectorAll('a[href^="/shorts"]').forEach(el => {
       const parentToHide = el.closest('ytd-rich-item-renderer') || el.closest('ytd-video-renderer');
       if (parentToHide && parentToHide.style.display !== 'none') {
           parentToHide.style.display = 'none';
       } else if (el.style.display !== 'none') {
           el.style.display = 'none'; // hide the link itself
       }
    });
  },

  enforce() {
    this.enforceRoute();
    this.enforceDOM();
  }
};
