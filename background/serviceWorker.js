// The service worker handles cross-communication if necessary, and state persistence tasks.
// In MV3, the service worker runs statelessly.

chrome.runtime.onInstalled.addListener(() => {
  console.log('Shorts & Reels Blocker installed.');
});

// We can optionally use the background worker to aggressively kill a tab if the user tries to break the overlay
// but for now, the content script's overlay is robust enough.

// A background listener just in case other parts of the system want to send ping messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ping') {
    sendResponse({ status: 'ok' });
  }
  return true;
});
