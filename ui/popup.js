// Popup logic

let popupInterval = null;

async function updatePopupState() {
  const isBlocked = await TimerManager.isBlocked();
  const setupView = document.getElementById('setup-view');
  const activeView = document.getElementById('active-view');
  
  if (isBlocked) {
    setupView.classList.add('hidden');
    activeView.classList.remove('hidden');
    
    // Start live timer update
    if (!popupInterval) {
      popupInterval = setInterval(updateTimerDisplay, 1000);
    }
    updateTimerDisplay(); // Initial synchronous update
  } else {
    setupView.classList.remove('hidden');
    activeView.classList.add('hidden');
    
    if (popupInterval) {
      clearInterval(popupInterval);
      popupInterval = null;
    }
  }
}

async function updateTimerDisplay() {
  const isBlocked = await TimerManager.isBlocked();
  if (!isBlocked) {
    updatePopupState();
    return;
  }
  
  const remaining = await TimerManager.getRemainingTime();
  const display = document.getElementById('popup-timer');
  display.textContent = TimerManager.formatRemainingTime(remaining);
}

async function startBlockingSession(hours) {
  if (isNaN(hours) || hours <= 0) return;
  await TimerManager.startBlock(hours);
  updatePopupState();
}

document.addEventListener('DOMContentLoaded', async () => {
  // Init view
  updatePopupState();

  // Load block whole youtube setting
  const blockWholeYoutubeCheckbox = document.getElementById('block-whole-youtube');
  if (blockWholeYoutubeCheckbox) {
    blockWholeYoutubeCheckbox.checked = await StorageManager.getBlockWholeYoutube();
    blockWholeYoutubeCheckbox.addEventListener('change', async (e) => {
      await StorageManager.setBlockWholeYoutube(e.target.checked);
    });
  }

  // Preset buttons
  document.querySelectorAll('.duration-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const hours = parseFloat(e.target.dataset.hours);
      startBlockingSession(hours);
    });
  });

  // Custom duration logic
  document.getElementById('start-custom-btn').addEventListener('click', () => {
    const customHoursInput = document.getElementById('custom-hours');
    const customHours = parseFloat(customHoursInput.value);
    if (customHours > 0) {
      startBlockingSession(customHours);
    }
  });

  // Also listen for storage changes to stay in sync
  StorageManager.onBlockUpdate(() => {
    updatePopupState();
  });
});
