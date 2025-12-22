import { useState, useEffect } from 'react';
import './index.css';

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

function App() {
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    // Poll session status
    const checkStatus = () => {
      chrome.runtime.sendMessage({ type: 'GET_JSON_SESSION' }, (response) => {
        if (response && response.session) {
          setSession(response.session);
        }
      });
    };
    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSession = () => {
    if (session?.isActive) {
      chrome.runtime.sendMessage({ type: 'STOP_JSON_SESSION' }, (res) => setSession(res.session));
    } else {
      chrome.runtime.sendMessage({ type: 'START_JSON_SESSION', projectName: 'My Course' }, (res) => setSession(res.session));
    }
  };

  const copyTemplate = async () => {
    if (!session) return;

    const template = {
      name: session.projectName,
      lessons: session.lessons.map(l => ({
        title: l.title,
        urls: l.urls
      }))
    };

    await navigator.clipboard.writeText(JSON.stringify(template, null, 2));
    setStatus('JSON Template Copied!');
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="w-96 min-h-[500px] bg-[#0f0f0f] text-white p-4 flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
        <h1 className="text-lg font-bold text-indigo-500">Course Grabber</h1>
        <div className="flex gap-2">
          {session?.isActive && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/20 text-red-500 text-xs font-bold rounded animate-pulse">
              REC
            </span>
          )}
        </div>
      </div>

      {status && (
        <div className="bg-green-500/20 text-green-400 text-xs p-2 rounded mb-3 text-center">
          {status}
        </div>
      )}

      <div className="flex-1 flex flex-col space-y-4">
        {/* Toggle */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800 flex flex-col items-center justify-center gap-3">
          <div className="text-sm text-gray-400 font-medium">Session Recorder</div>
          <button
            onClick={toggleSession}
            className={`w-full py-2.5 rounded font-bold uppercase tracking-wider transition-all ${session?.isActive
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
          >
            {session?.isActive ? 'Finish Recording' : 'Start New Session'}
          </button>
          <p className="text-[10px] text-gray-500 text-center px-4">
            Navigate through pages. The extension will group streams by page title.
          </p>
        </div>

        {/* Active Session Info */}
        {session && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {session.lessons.map((lesson, idx) => (
              <div key={idx} className={`p-3 rounded border ${idx === session.currentLessonIndex && session.isActive ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-[#1a1a1a] border-gray-800'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-300 line-clamp-2">{lesson.title}</span>
                  <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-gray-500 font-mono">
                    {lesson.urls.length} streams
                  </span>
                </div>
                {lesson.urls.length > 0 && (
                  <div className="text-[10px] text-gray-600 font-mono truncate">
                    {lesson.urls[lesson.urls.length - 1]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        {!session?.isActive && session?.lessons.length! > 0 && (
          <button
            onClick={copyTemplate}
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            Copy JSON Template
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
