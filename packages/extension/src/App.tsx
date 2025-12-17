import { useState, useEffect } from 'react';
import './index.css';

interface DetectedVideo {
  type: 'video' | 'iframe' | 'stream';
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied!');
      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      setStatus('Failed to copy.');
    }
  };

  const copyAll = async () => {
    const allUrls = videos.map(v => v.src).join('\n');
    if (allUrls) {
      await copyToClipboard(allUrls);
      setStatus('All URLs copied!');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'iframe': return 'bg-purple-500/20 text-purple-400';
      case 'stream': return 'bg-green-500/20 text-green-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="w-96 min-h-[300px] bg-[#0f0f0f] text-white p-4">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
        <h1 className="text-lg font-bold text-indigo-500">Course Grabber</h1>
        <div className="flex gap-2">
          {videos.length > 0 && (
            <button
              onClick={copyAll}
              className="px-2 py-1 text-xs font-medium bg-[#1a1a1a] border border-gray-700 hover:bg-[#252525] rounded transition-colors"
            >
              Copy All ({videos.length})
            </button>
          )}
        </div>
      </div>

      {status && (
        <div className="bg-green-500/20 text-green-400 text-xs p-2 rounded mb-3 text-center animate-fade-in">
          {status}
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Scanning page...</div>
        ) : videos.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No videos found on this page.
          </div>
        ) : (
          videos.map((video, idx) => (
            <div key={idx} className="bg-[#1a1a1a] p-3 rounded-lg border border-gray-800 hover:border-indigo-500/50 transition-all group flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${getTypeColor(video.type)}`}>
                  {video.type}
                </span>
                <button
                  onClick={() => copyToClipboard(video.src)}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                  title="Copy single URL"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
              <div className="text-xs text-gray-400 break-all font-mono bg-black/20 p-1.5 rounded select-all">
                {video.src}
              </div>
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
