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

  // LLM operations
  summarizeFolder: (folderPath: string) => ipcRenderer.invoke('llm:summarize-folder', folderPath),
  testLLMConnection: () => ipcRenderer.invoke('llm:test-connection'),
  invalidateFolderCache: (folderPath?: string) => ipcRenderer.invoke('llm:invalidate-cache', folderPath),

  // Agent operations
  agentChat: (message: string, context: any) =>
    ipcRenderer.invoke('agent:chat', message, context),
  agentSetProvider: (provider: 'claude' | 'openai') =>
    ipcRenderer.invoke('agent:set-provider', provider),
  agentGetProvider: () =>
    ipcRenderer.invoke('agent:get-provider') as Promise<'claude' | 'openai'>,
  agentIsConfigured: (provider: string) =>
    ipcRenderer.invoke('agent:is-configured', provider) as Promise<boolean>,
  agentGetHistory: () =>
    ipcRenderer.invoke('agent:get-history'),
  agentClear: () =>
    ipcRenderer.invoke('agent:clear'),
  agentTestConnection: (provider: string) =>
    ipcRenderer.invoke('agent:test-connection', provider) as Promise<boolean>,
  agentReinitialize: () =>
    ipcRenderer.invoke('agent:reinitialize'),
  onAgentStreamChunk: (callback: (chunk: string) => void) => {
    const handler = (_: any, chunk: string) => callback(chunk);
    ipcRenderer.on('agent:stream-chunk', handler);
    return () => {
      ipcRenderer.removeListener('agent:stream-chunk', handler);
    };
  },

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
