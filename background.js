let activeSite = null;
let startTime = Date.now();

console.log("Background service worker started");
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) handleTracking(tab.url);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    handleTracking(tab.url);
  }
});

function handleTracking(url) {
  if (!url.startsWith("http")) return;

  const site = new URL(url).hostname;
  const now = Date.now();

  if (site === activeSite) return;

  if (activeSite) {
    const timeSpent = now - startTime;
    if (timeSpent > 1000) saveTime(activeSite, timeSpent);
  }

  activeSite = site;
  startTime = now;
}

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) return;
  if (!activeSite) return;

  const now = Date.now();
  const timeSpent = now - startTime;
  if (timeSpent > 1000) saveTime(activeSite, timeSpent);

  activeSite = null;
  startTime = now;
});

function saveTime(site, timeSpent) {
  chrome.storage.local.get(["usage"], (res) => {
    const usage = res.usage || {};
    usage[site] = (usage[site] || 0) + timeSpent;

    chrome.storage.local.set({ usage }, () => {
      const seconds = (timeSpent / 1000).toFixed(2);
      console.log(`Saved: ${site} ${seconds} sec`);
    });
  });
}
