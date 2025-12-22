// Background service worker
console.log('Course Grabber background service started');

// TYPES
interface SessionLesson {
  title: string;
  urls: string[];
}
interface RecordingSession {
  isActive: boolean;
  projectName: string;
  lessons: SessionLesson[];
  currentLessonIndex: number;
}

// STATE
let session: RecordingSession = {
  isActive: false,
  projectName: 'New Course',
  lessons: [],
  currentLessonIndex: -1
};

// Listen for messages
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  // START SESSION
  if (message.type === 'START_JSON_SESSION') {
    session = {
      isActive: true,
      projectName: message.projectName || 'New Course',
      lessons: [],
      currentLessonIndex: -1
    };
    sendResponse({ success: true, session });
  }
  // STOP SESSION
  else if (message.type === 'STOP_JSON_SESSION') {
    session.isActive = false;
    sendResponse({ success: true, session });
  }
  // GET SESSION
  else if (message.type === 'GET_JSON_SESSION') {
    sendResponse({ session });
  }
  // LEGACY: Badge updates
  else if (message.type === 'VIDEOS_FOUND') {
    if (message.count > 0 && sender.tab?.id) {
      chrome.action.setBadgeText({ text: message.count.toString(), tabId: sender.tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#6366f1', tabId: sender.tab.id });
    }
  }
  return true;
});

// Track Tab Updates to create new Lesson Groups
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (session.isActive && changeInfo.title) {
    // Filter out irrelevant title updates
    if (changeInfo.title.includes('http') || !tab.active) return;

    const newTitle = changeInfo.title.replace(' | Mindvalley', '').trim();

    // Check if duplicate of current
    const currentLesson = session.lessons[session.currentLessonIndex];
    if (!currentLesson || currentLesson.title !== newTitle) {
      console.log('New Lesson Group:', newTitle);
      session.lessons.push({
        title: newTitle,
        urls: []
      });
      session.currentLessonIndex = session.lessons.length - 1;
    }
  }
});

// Capture Streams
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (!session.isActive) return;

    // Only capture master playlists (main.m3u8), not video/audio/subtitle sub-streams
    if (details.url.endsWith('main.m3u8') || details.url.includes('/main.m3u8?')) {
      // Ensure bucket exists
      if (session.currentLessonIndex === -1) {
        session.lessons.push({ title: 'Introduction', urls: [] });
        session.currentLessonIndex = 0;
      }

      const currentLesson = session.lessons[session.currentLessonIndex];

      if (!currentLesson.urls.includes(details.url)) {
        console.log('Captured:', details.url);
        currentLesson.urls.push(details.url);
      }
    }
  },
  { urls: ["<all_urls>"] }
);
