// Background service worker
console.log('Course Grabber background service started');

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, _sendResponse: (response?: any) => void) => {
  if (message.type === 'VIDEOS_FOUND') {
    // Update badge to show number of videos found
    const count = message.count;
    if (count > 0) {
      chrome.action.setBadgeText({
        text: count.toString(),
        tabId: sender.tab?.id
      });
      chrome.action.setBadgeBackgroundColor({
        color: '#6366f1', // Indigo-500
        tabId: sender.tab?.id
      });
    } else {
      chrome.action.setBadgeText({
        text: '',
        tabId: sender.tab?.id
      });
    }
  }
});
