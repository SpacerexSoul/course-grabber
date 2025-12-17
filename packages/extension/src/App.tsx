import { useState, useEffect } from 'react';
import './index.css';

interface DetectedVideo {
  type: 'video' | 'iframe';
  src: string;
}

function App() {
  const [videos, setVideos] = useState<DetectedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    // Get current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      const tab = tabs[0];
      if (tab?.id) {
        // Ask content script for videos
        chrome.tabs.sendMessage(tab.id, { type: 'GET_VIDEOS' }, (response: any) => {
          if (response && response.videos) {
            // Remove duplicates
            const unique = response.videos.filter((v: DetectedVideo, i: number, self: DetectedVideo[]) =>
              i === self.findIndex((t) => t.src === v.src)
            );
            setVideos(unique);
          }
          setLoading(false);
        });
      }
    });
  }, []);

  const sendToApp = async (url: string) => {
    try {
      // Assuming desktop app is running on localhost:5173 (React) or accessed via clipboard
      // For now, we'll write to clipboard as a simple bridge
      await navigator.clipboard.writeText(url);
      setStatus('Copied to clipboard! Paste in App.');

      // Clear status after 2 seconds
      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      setStatus('Failed to copy.');
    }
  };

  return (
    <div className="w-80 min-h-[300px] bg-[#0f0f0f] text-white p-4">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
        <h1 className="text-lg font-bold text-indigo-500">Course Grabber</h1>
        <div className="text-xs text-gray-500">v1.0</div>
      </div>

      {status && (
        <div className="bg-green-500/20 text-green-400 text-xs p-2 rounded mb-3 text-center animate-fade-in">
          {status}
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Scanning page...</div>
        ) : videos.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No videos found on this page.
          </div>
        ) : (
          videos.map((video, idx) => (
            <div key={idx} className="bg-[#1a1a1a] p-3 rounded-lg border border-gray-800 hover:border-indigo-500/50 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${video.type === 'iframe' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                  {video.type.toUpperCase()}
                </span>
                <span className="flex-1 text-xs truncate text-gray-400" title={video.src}>
                  {video.src}
                </span>
              </div>
              <button
                onClick={() => sendToApp(video.src)}
                className="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-medium transition-colors"
              >
                Copy URL
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-2 border-t border-gray-800 text-center">
        <button
          onClick={() => chrome.tabs.create({ url: 'http://localhost:5173' })}
          className="text-xs text-gray-500 hover:text-white transition-colors"
        >
          Open Desktop App
        </button>
      </div>
    </div>
  );
}

export default App;
