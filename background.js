let timeTracker = {};
let blockList = [];
let focusMode = false;
let focusEndTime = 0;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ timeTracker: {}, blockList: [], focusMode: false, focusEndTime: 0, previousDays: {} });
  chrome.alarms.create('checkTime', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'checkTime') {
    updateTimeSpent();
    checkFocusMode();
    saveDailyUsage();
  }
});

function updateTimeSpent() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const currentUrl = new URL(tabs[0].url).hostname;
    chrome.storage.sync.get(['timeTracker'], data => {
      let tracker = data.timeTracker;
      tracker[currentUrl] = (tracker[currentUrl] || 0) + 1;
      chrome.storage.sync.set({ timeTracker: tracker });
    });
  });
}

function checkFocusMode() {
  chrome.storage.sync.get(['focusMode', 'focusEndTime'], data => {
    if (data.focusMode && Date.now() >= data.focusEndTime) {
      chrome.storage.sync.set({ focusMode: false });
      focusMode = false;
    }
  });
}

function saveDailyUsage() {
  let today = new Date().toISOString().split('T')[0];
  chrome.storage.sync.get(['timeTracker', 'previousDays'], data => {
    let previousDays = data.previousDays;
    previousDays[today] = data.timeTracker;
    chrome.storage.sync.set({ previousDays: previousDays, timeTracker: {} });
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    chrome.storage.sync.get(['blockList', 'focusMode'], data => {
      if (data.blockList.includes(new URL(tab.url).hostname) || data.focusMode) {
        chrome.tabs.remove(tabId);
      }
    });
  }
});
