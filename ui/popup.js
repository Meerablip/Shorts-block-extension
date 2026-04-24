// Popup logic
let shortsInterval = null;
let ytInterval = null;

async function updatePopupState() {
  const isShortsBlocked = await TimerManager.isBlocked();
  const isYtBlocked = await TimerManager.isYoutubeBlocked();
  
  // Shorts UI
  const shortsSetupView = document.getElementById('shorts-setup-view');
  const shortsActiveView = document.getElementById('shorts-active-view');
  if (isShortsBlocked) {
    shortsSetupView.classList.add('hidden');
    shortsActiveView.classList.remove('hidden');
    if (!shortsInterval) shortsInterval = setInterval(updateTimerDisplays, 1000);
  } else {
    shortsSetupView.classList.remove('hidden');
    shortsActiveView.classList.add('hidden');
    if (shortsInterval) {
      clearInterval(shortsInterval);
      shortsInterval = null;
    }
  }

  // YT UI
  const ytSetupView = document.getElementById('yt-setup-view');
  const ytActiveView = document.getElementById('yt-active-view');
  if (isYtBlocked) {
    ytSetupView.classList.add('hidden');
    ytActiveView.classList.remove('hidden');
    if (!ytInterval) ytInterval = setInterval(updateTimerDisplays, 1000);
  } else {
    ytSetupView.classList.remove('hidden');
    ytActiveView.classList.add('hidden');
    if (ytInterval) {
      clearInterval(ytInterval);
      ytInterval = null;
    }
  }

  updateTimerDisplays();
}

async function updateTimerDisplays() {
  const isShortsBlocked = await TimerManager.isBlocked();
  const isYtBlocked = await TimerManager.isYoutubeBlocked();

  if (isShortsBlocked) {
    const remaining = await TimerManager.getRemainingTime();
    document.getElementById('shorts-popup-timer').textContent = TimerManager.formatRemainingTime(remaining);
  }
  
  if (isYtBlocked) {
    const remaining = await TimerManager.getYoutubeRemainingTime();
    document.getElementById('yt-popup-timer').textContent = TimerManager.formatRemainingTime(remaining);
  }

  // If intervals are running but timers expired, trigger state update
  if (!isShortsBlocked && shortsInterval) updatePopupState();
  if (!isYtBlocked && ytInterval) updatePopupState();
}

async function startShortsSession(hours) {
  if (isNaN(hours) || hours <= 0) return;
  await TimerManager.startBlock(hours);
  updatePopupState();
}

async function startYtSession(hours) {
  if (isNaN(hours) || hours <= 0) return;
  await TimerManager.startYoutubeBlock(hours);
  updatePopupState();
}

document.addEventListener('DOMContentLoaded', async () => {
  // Init view
  updatePopupState();

  // Shorts buttons
  document.querySelectorAll('.shorts-duration').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const hours = parseFloat(e.target.dataset.hours);
      startShortsSession(hours);
    });
  });

  document.getElementById('shorts-start-custom-btn').addEventListener('click', () => {
    const hours = parseFloat(document.getElementById('shorts-custom-hours').value);
    startShortsSession(hours);
  });

  // YT buttons
  document.querySelectorAll('.yt-duration').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const hours = parseFloat(e.target.dataset.hours);
      startYtSession(hours);
    });
  });

  document.getElementById('yt-start-custom-btn').addEventListener('click', () => {
    const hours = parseFloat(document.getElementById('yt-custom-hours').value);
    startYtSession(hours);
  });

  // Stay in sync
  StorageManager.onBlockUpdate(() => {
    updatePopupState();
  });
});
