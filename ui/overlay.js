const OverlayManager = {
  overlayElement: null,
  timerInterval: null,

  createOverlay() {
    if (this.overlayElement) return;

    this.overlayElement = document.createElement('div');
    this.overlayElement.id = 'shorts-blocker-overlay';
    
    this.overlayElement.innerHTML = `
      <div id="shorts-blocker-overlay-content">
        <h1>Focus Mode Active</h1>
        <p>Short-form content is currently blocked to protect your attention and time. You can return when the timer expires.</p>
        <div id="shorts-blocker-timer">00:00:00</div>
      </div>
    `;

    // Prevent scrolling behind overlay
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';

    // Must be injected at the very top level
    if (document.documentElement) {
      document.documentElement.appendChild(this.overlayElement);
    } else {
      // Very edge case if documentElement is not there yet
      window.addEventListener('DOMContentLoaded', () => {
        document.documentElement.appendChild(this.overlayElement);
      });
    }

    // Stop events from reaching underlying page
    this.overlayElement.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
    }, true);
    
    this.overlayElement.addEventListener('keydown', (e) => {
      e.stopPropagation();
    }, true);
  },

  removeOverlay() {
    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
      this.overlayElement = null;
      
      // Restore scrolling
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
      
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }
  },

  async updateTimer() {
    const isBlocked = await TimerManager.isBlocked();
    if (!isBlocked) {
      this.removeOverlay();
      return;
    }

    const remainingTime = await TimerManager.getRemainingTime();
    const timerDisplay = document.getElementById('shorts-blocker-timer');
    if (timerDisplay) {
      timerDisplay.textContent = TimerManager.formatRemainingTime(remainingTime);
    }
  },

  async show() {
    const isBlocked = await TimerManager.isBlocked();
    if (isBlocked) {
      this.createOverlay();
      await this.updateTimer();
      
      if (!this.timerInterval) {
        this.timerInterval = setInterval(() => {
          this.updateTimer();
        }, 1000);
      }
    }
  }
};
