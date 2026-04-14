# Shorts & Reels Blocker

A Manifest V3 browser extension to strictly block short-form content on YouTube and Instagram.


## Architecture Overview

The extension utilizes a modular, robust approach resistant to common bypasses:

1. **Manifest V3 Core**
   - Employs appropriate file structure, utilizing service workers for background tasks (`background/serviceWorker.js`), and isolated generic components.
2. **UI Interceptors (`ui/overlay.js`)**
   - Applies an unclickable, absolute high `z-index` overlay over restricted routes (`/shorts` or `/reels`). This effectively stops users without damaging Single Page Application frameworks.
3. **Robust Navigation Fallbacks (`content/observer.js`)**
   - Overrides `pushState` and `replaceState` to correctly detect when a user clicks onto a Short without the page reloading, triggering the lock screen instantly.
   - Leverages `MutationObserver` to constantly comb new DOM insertions (like infinite scrolls on YouTube/Instagram) for Shorts/Reel links and immediately hides them.
4. **Platform-Specific Logic**
   - **`content/youtubeBlocker.js`**: Specifically targets YouTube shelves, grid items, and side menu entries.
   - **`content/instagramBlocker.js`**: Specifically targets Instagram reels side menus.
5. **Strict Timer Enforcement**
   - As requested, no "Stop Block" interface exists. The `core/timerManager.js` dictates block constraints cross-tab using `chrome.storage.local`.
   


## Function Overview

1. Blocks reels and shorts from Instagram and Youtube.
2. Removes the Reels/Shorts tab directly from the site.
3. Lets you select or personlize the time you want the content blocked for.
4. Cannot be overridden before the time ends. It strictly blocks it for the time selected.
   
  
## Installation Instructions

To test the application on your Chromium browser:

1. Clone this repository
2. Open a Chromium-based browser (Chrome, Edge, Brave).
3. Type `chrome://extensions/` in the URL bar (or `edge://extensions/`).
4. Turn on **Developer mode** (usually a toggle in the top right).
5. Click **Load unpacked**.
6. Select the main directory: `c:\Users\meera\OneDrive\Desktop\Personal\coding\Shorts-block extension`.
7. Click the newly added extension puzzle piece in the toolbar and open the generic Popup. Select **1 hr**.
8. Navigate to `youtube.com/shorts` or `instagram.com/reels` and test routing inside the apps directly to verify the overlay block works efficiently. Wait, try scrolling through the homepage to ensure shorts shelves are invisible.
