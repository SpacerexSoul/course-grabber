// Utility to detect video elements and iframes
function detectVideos() {
  const videos = Array.from(document.querySelectorAll('video')).map(v => ({
    type: 'video',
    src: v.currentSrc || v.src,
    element: v
  })).filter(v => v.src);

  const iframes = Array.from(document.querySelectorAll('iframe')).map(i => ({
    type: 'iframe',
    src: i.src,
    element: i
  })).filter(i => i.src);

  // Send found videos to background script
  const count = videos.length + iframes.length;
  if (count > 0) {
    chrome.runtime.sendMessage({
      type: 'VIDEOS_FOUND',
      count,
      videos: [...videos.map(v => ({ type: v.type, src: v.src })), ...iframes.map(i => ({ type: i.type, src: i.src }))]
    });
  }
}

// Run detection on load and DOM changes
detectVideos();

const observer = new MutationObserver(detectVideos);
observer.observe(document.body, { childList: true, subtree: true });

// Listen for requests from popup
chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.type === 'GET_VIDEOS') {
    const videos = Array.from(document.querySelectorAll('video'))
      .map(v => ({ type: 'video', src: v.currentSrc || v.src }))
      .filter(v => v.src);

    const iframes = Array.from(document.querySelectorAll('iframe'))
      .map(i => ({ type: 'iframe', src: i.src }))
      .filter(i => i.src);

    sendResponse({ videos: [...videos, ...iframes] });
  }
});
