const YoutubeBlocker = {
  isShortsBlocked: false,
  isYoutubeBlocked: false,

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
    this.isShortsBlocked = await TimerManager.isBlocked();
    this.isYoutubeBlocked = await TimerManager.isYoutubeBlocked();
    
    // Listen for storage changes
    StorageManager.onBlockUpdate((updates) => {
      if (updates.blockEndTime !== undefined) {
        this.isShortsBlocked = (Date.now() < updates.blockEndTime);
      }
      if (updates.youtubeBlockEndTime !== undefined) {
        this.isYoutubeBlocked = (Date.now() < updates.youtubeBlockEndTime);
      }
      this.enforce();
    });

    this.enforce();
  },

  enforceRoute() {
    if (this.isYoutubeBlocked) {
      OverlayManager.show('youtube');
      document.querySelectorAll('video').forEach(vid => vid.pause());
      return;
    }

    if (this.isShortsBlocked && window.location.pathname.startsWith('/shorts')) {
      OverlayManager.show('shorts');
      document.querySelectorAll('video').forEach(vid => vid.pause());
      return;
    }

    OverlayManager.removeOverlay();
  },

  enforceDOM() {
    if (this.isYoutubeBlocked) return; // No need to hide specific DOM elements if whole site is covered by overlay
    if (!this.isShortsBlocked) return;

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
