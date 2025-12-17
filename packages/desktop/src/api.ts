// Type definitions for Electron API exposed via preload
export interface ElectronAPI {
  selectFolder: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// API base URL
const API_BASE = 'http://localhost:8000/api';

// Types
export interface LessonURL {
  id: string;
  url: string;
  part_number: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  filename?: string;
  error?: string;
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
  urls: LessonURL[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  save_location: string;
  lessons: Lesson[];
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  save_location: string;
}

export interface LessonCreate {
  title: string;
  order?: number;
}

export interface URLAdd {
  url: string;
  part_number?: number;
}

// API Functions
export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

export async function createProject(data: ProjectCreate): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete project');
}

export async function addLesson(projectId: string, data: LessonCreate): Promise<Lesson> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add lesson');
  return res.json();
}

export async function deleteLesson(projectId: string, lessonId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/lessons/${lessonId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete lesson');
}

export async function addURL(projectId: string, lessonId: string, data: URLAdd): Promise<LessonURL> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/lessons/${lessonId}/urls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add URL');
  return res.json();
}

export async function deleteURL(projectId: string, lessonId: string, urlId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/lessons/${lessonId}/urls/${urlId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete URL');
}

export async function startDownload(projectId: string, lessonIds?: string[]): Promise<{ download_id: string }> {
  const res = await fetch(`${API_BASE}/downloads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: projectId, lesson_ids: lessonIds }),
  });
  if (!res.ok) throw new Error('Failed to start download');
  return res.json();
}

export async function getDownloadStatus(downloadId: string): Promise<{
  status: string;
  total: number;
  completed: number;
  failed: number;
  downloading: number;
}> {
  const res = await fetch(`${API_BASE}/downloads/${downloadId}/status`);
  if (!res.ok) throw new Error('Failed to get download status');
  return res.json();
}

// Electron folder picker
export async function selectFolder(): Promise<string | null> {
  if (window.electronAPI) {
    return window.electronAPI.selectFolder();
  }
  // Fallback for browser dev
  return prompt('Enter save location path:');
}
