const OverlayManager = {
  overlayElement: null,
  timerInterval: null,
  currentBlockType: null,

  createOverlay(blockType) {
    if (this.overlayElement) {
      // If it exists but blockType changed, update text
      if (this.currentBlockType !== blockType) {
        this.currentBlockType = blockType;
        const h1 = this.overlayElement.querySelector('h1');
        const p = this.overlayElement.querySelector('p');
        if (blockType === 'youtube') {
          h1.textContent = 'YouTube is Blocked';
          p.textContent = 'The entire YouTube site is currently blocked. You can return when the timer expires.';
        } else {
          h1.textContent = 'Focus Mode Active';
          p.textContent = 'Short-form content is currently blocked to protect your attention and time.';
        }
      }
      return;
    }

    this.currentBlockType = blockType;
    this.overlayElement = document.createElement('div');
    this.overlayElement.id = 'shorts-blocker-overlay';
    
    const title = blockType === 'youtube' ? 'YouTube is Blocked' : 'Focus Mode Active';
    const message = blockType === 'youtube' 
      ? 'The entire YouTube site is currently blocked. You can return when the timer expires.'
      : 'Short-form content is currently blocked to protect your attention and time. You can return when the timer expires.';

    this.overlayElement.innerHTML = `
      <div id="shorts-blocker-overlay-content">
        <h1>${title}</h1>
        <p>${message}</p>
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
      this.currentBlockType = null;
      
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
    let isBlocked = false;
    let remainingTime = 0;

    if (this.currentBlockType === 'youtube') {
      isBlocked = await TimerManager.isYoutubeBlocked();
      remainingTime = await TimerManager.getYoutubeRemainingTime();
    } else {
      isBlocked = await TimerManager.isBlocked();
      remainingTime = await TimerManager.getRemainingTime();
    }

    if (!isBlocked) {
      // It's possible the other timer is still active, but youtubeBlocker.js will handle calling show() or removeOverlay()
      this.removeOverlay();
      return;
    }

    const timerDisplay = document.getElementById('shorts-blocker-timer');
    if (timerDisplay) {
      timerDisplay.textContent = TimerManager.formatRemainingTime(remainingTime);
    }
  },

  async show(blockType) {
    this.createOverlay(blockType);
    await this.updateTimer();
    
    if (!this.timerInterval) {
      this.timerInterval = setInterval(() => {
        this.updateTimer();
      }, 1000);
    }
  }
};
