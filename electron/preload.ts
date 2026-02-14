import { contextBridge, ipcRenderer } from 'electron';

// Expose typed API to renderer
const api = {
  // File operations
  readFile: (path: string) => ipcRenderer.invoke('file:read', path),
  writeFile: (path: string, content: string, metadata?: any) =>
    ipcRenderer.invoke('file:write', path, content, metadata),
  deleteFile: (path: string) => ipcRenderer.invoke('file:delete', path),
  renameFile: (oldPath: string, newPath: string) =>
    ipcRenderer.invoke('file:rename', oldPath, newPath),
  createFile: (path: string, content: string, metadata?: any) =>
    ipcRenderer.invoke('file:create', path, content, metadata),

  // Directory operations
  readDir: (path: string) => ipcRenderer.invoke('dir:read', path),
  createDir: (path: string) => ipcRenderer.invoke('dir:create', path),

  // Project operations
  createProject: (name: string) => ipcRenderer.invoke('project:create', name),
  getProjects: () => ipcRenderer.invoke('project:list'),

  // Config operations
  getConfig: () => ipcRenderer.invoke('config:get'),
  updateConfig: (config: any) => ipcRenderer.invoke('config:update', config),

  // Event listeners
  onFileChanged: (callback: (path: string) => void) => {
    ipcRenderer.on('file:changed', (_, path) => callback(path));
  },

  onProjectCreated: (callback: (project: any) => void) => {
    ipcRenderer.on('project:created', (_, project) => callback(project));
  }
};

contextBridge.exposeInMainWorld('api', api);

// Type declaration for TypeScript
export type API = typeof api;
