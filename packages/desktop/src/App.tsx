import { useState, useEffect, useCallback } from 'react';
import './index.css';
import {
  type Project,
  fetchProjects,
  createProject,
  deleteProject,
  addLesson,
  deleteLesson,
  addURL,
  deleteURL,
  startDownload,
  getDownloadStatus,
  selectFolder,
} from './api';

// Icons as simple SVG components
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ completed: number; total: number } | null>(null);

  // Form states
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [lessonCount, setLessonCount] = useState(1);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to connect to backend. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSelectFolder = async () => {
    const folder = await selectFolder();
    if (folder) {
      setNewProjectLocation(folder);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !newProjectLocation) return;

    try {
      const project = await createProject({
        name: newProjectName,
        save_location: newProjectLocation,
      });

      // Add lessons based on count
      for (let i = 1; i <= lessonCount; i++) {
        await addLesson(project.id, { title: `Lesson ${i}`, order: i });
      }

      await loadProjects();
      setShowNewProject(false);
      setNewProjectName('');
      setNewProjectLocation('');
      setLessonCount(1);

      // Select the new project
      const updated = await fetchProjects();
      const newProject = updated.find(p => p.id === project.id);
      if (newProject) setSelectedProject(newProject);
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      if (selectedProject?.id === id) setSelectedProject(null);
      await loadProjects();
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  const handleAddLesson = async () => {
    if (!selectedProject || !newLessonTitle) return;
    try {
      await addLesson(selectedProject.id, {
        title: newLessonTitle,
        order: selectedProject.lessons.length + 1,
      });
      const updated = await fetchProjects();
      setSelectedProject(updated.find(p => p.id === selectedProject.id) || null);
      setNewLessonTitle('');
    } catch (err) {
      setError('Failed to add lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedProject) return;
    try {
      await deleteLesson(selectedProject.id, lessonId);
      const updated = await fetchProjects();
      setSelectedProject(updated.find(p => p.id === selectedProject.id) || null);
    } catch (err) {
      setError('Failed to delete lesson');
    }
  };

  const handleAddURL = async (lessonId: string, url: string) => {
    if (!selectedProject || !url) return;
    try {
      await addURL(selectedProject.id, lessonId, { url });
      const updated = await fetchProjects();
      setSelectedProject(updated.find(p => p.id === selectedProject.id) || null);
    } catch (err) {
      setError('Failed to add URL');
    }
  };

  const handleDeleteURL = async (lessonId: string, urlId: string) => {
    if (!selectedProject) return;
    try {
      await deleteURL(selectedProject.id, lessonId, urlId);
      const updated = await fetchProjects();
      setSelectedProject(updated.find(p => p.id === selectedProject.id) || null);
    } catch (err) {
      setError('Failed to delete URL');
    }
  };

  const handleStartDownload = async () => {
    if (!selectedProject) return;
    try {
      setDownloading(true);
      const { download_id } = await startDownload(selectedProject.id);

      // Poll for progress
      const pollProgress = async () => {
        try {
          const status = await getDownloadStatus(download_id);
          setDownloadProgress({ completed: status.completed, total: status.total });

          if (status.status !== 'completed' && status.status !== 'failed') {
            setTimeout(pollProgress, 1000);
          } else {
            setDownloading(false);
            setDownloadProgress(null);
          }
        } catch {
          setDownloading(false);
          setDownloadProgress(null);
        }
      };

      pollProgress();
    } catch (err) {
      setError('Failed to start download');
      setDownloading(false);
    }
  };

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Title Bar */}
      <div className="drag-region h-12 flex items-center justify-center bg-[var(--bg-secondary)] border-b border-[var(--border-color)] relative">
        <h1 className="gradient-text font-bold text-lg">Course Grabber</h1>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/20 border-b border-red-500/50 px-4 py-2 text-red-400 text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-white">×</button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Projects List */}
        <div className="w-72 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col">
          <div className="p-4 border-b border-[var(--border-color)]">
            <button
              onClick={() => setShowNewProject(true)}
              className="no-drag w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white font-medium transition-all glow"
            >
              <PlusIcon />
              New Project
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="text-center py-8 text-[var(--text-muted)]">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <p>No projects yet</p>
                <p className="text-sm mt-1">Create one to get started</p>
              </div>
            ) : (
              projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`no-drag group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all mb-1 ${selectedProject?.id === project.id
                    ? 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/50'
                    : 'hover:bg-[var(--bg-hover)]'
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{project.name}</h3>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {project.lessons.length} lessons
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-all"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedProject ? (
            <div className="p-6 animate-fade-in">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                  <p className="text-[var(--text-muted)] text-sm flex items-center gap-2 mt-1">
                    <FolderIcon />
                    {selectedProject.save_location}
                  </p>
                </div>
                <button
                  onClick={handleStartDownload}
                  disabled={downloading || selectedProject.lessons.every(l => l.urls.length === 0)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--success)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all"
                >
                  {downloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {downloadProgress ? `${downloadProgress.completed}/${downloadProgress.total}` : 'Starting...'}
                    </>
                  ) : (
                    <>
                      <DownloadIcon />
                      Download All
                    </>
                  )}
                </button>
              </div>

              {/* Add Lesson */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLesson()}
                  placeholder="New lesson title..."
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:outline-none text-white placeholder-[var(--text-muted)]"
                />
                <button
                  onClick={handleAddLesson}
                  disabled={!newLessonTitle}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] disabled:opacity-50 transition-all"
                >
                  <PlusIcon />
                </button>
              </div>

              {/* Lessons */}
              <div className="space-y-3">
                {selectedProject.lessons.map(lesson => (
                  <div key={lesson.id} className="glass rounded-xl overflow-hidden">
                    <div
                      onClick={() => toggleLesson(lesson.id)}
                      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[var(--bg-hover)] transition-all"
                    >
                      <ChevronIcon open={expandedLessons.has(lesson.id)} />
                      <div className="flex-1">
                        <h3 className="font-medium">{lesson.title}</h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          {lesson.urls.length} URL{lesson.urls.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}
                        className="p-1.5 rounded hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-all"
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    {expandedLessons.has(lesson.id) && (
                      <div className="px-4 pb-4 border-t border-[var(--border-color)] pt-4 space-y-2 animate-fade-in">
                        {lesson.urls.map(url => (
                          <div key={url.id} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-secondary)]">
                            <span className="text-xs text-[var(--text-muted)] w-8">#{url.part_number}</span>
                            <span className="flex-1 text-sm truncate text-[var(--text-secondary)]">{url.url}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${url.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              url.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                url.status === 'downloading' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-gray-500/20 text-gray-400'
                              }`}>
                              {url.status}
                            </span>
                            <button
                              onClick={() => handleDeleteURL(lesson.id, url.id)}
                              className="p-1 rounded hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-all"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        ))}
                        <URLInput
                          onAdd={(url) => handleAddURL(lesson.id, url)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
              <div className="text-center">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg">Select a project to get started</p>
                <p className="text-sm mt-1">or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 w-full max-w-md m-4 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Course"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Save Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProjectLocation}
                    onChange={(e) => setNewProjectLocation(e.target.value)}
                    placeholder="/path/to/save"
                    className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSelectFolder}
                    className="px-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]"
                  >
                    <FolderIcon />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Number of Lessons</label>
                <input
                  type="number"
                  value={lessonCount}
                  onChange={(e) => setLessonCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProject(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName || !newProjectLocation}
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] disabled:opacity-50 font-medium"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// URL Input Component
function URLInput({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    if (url.trim()) {
      onAdd(url.trim());
      setUrl('');
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Add video URL..."
        className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:outline-none placeholder-[var(--text-muted)]"
      />
      <button
        onClick={handleSubmit}
        disabled={!url.trim()}
        className="px-3 py-2 rounded-lg bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/30 disabled:opacity-50 transition-all"
      >
        <PlusIcon />
      </button>
    </div>
  );
}

export default App;
