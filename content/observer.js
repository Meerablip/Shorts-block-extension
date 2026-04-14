const MainObserver = {
  activeBlocker: null,

  init() {
    const hostname = window.location.hostname;
    if (hostname.includes('youtube.com')) {
      this.activeBlocker = YoutubeBlocker;
    } else if (hostname.includes('instagram.com')) {
      this.activeBlocker = InstagramBlocker;
    }

    if (this.activeBlocker) {
      this.activeBlocker.init();
      this.setupMutationObserver();
      this.setupNavigationIntercepts();
    }
  },

  setupMutationObserver() {
    // Watch for dynamic DOM changes (infinite scrolling, SPA rendering)
    const observer = new MutationObserver((mutations) => {
      // Throttle enforcement slightly to prevent massive lag
      if (this.mutationTimeout) return;
      this.mutationTimeout = setTimeout(() => {
        this.activeBlocker.enforceDOM();
        this.mutationTimeout = null;
      }, 50); // 50ms throttle
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  },

  setupNavigationIntercepts() {
    // 1. Listen for browser Back/Forward (popstate)
    window.addEventListener('popstate', () => {
      this.activeBlocker.enforceRoute();
    });

    // 2. Intercept pushState and replaceState used by SPAs (YouTube/Instagram)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function() {
      originalPushState.apply(this, arguments);
      // Dispatch custom event to notify our script
      const event = new Event('pushstate');
      window.dispatchEvent(event);
    };

    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      const event = new Event('replacestate');
      window.dispatchEvent(event);
    };

    window.addEventListener('pushstate', () => {
      setTimeout(() => this.activeBlocker.enforce(), 0);
    });
    
    window.addEventListener('replacestate', () => {
      setTimeout(() => this.activeBlocker.enforce(), 0);
    });
  }
};

// Start the whole system
MainObserver.init();
