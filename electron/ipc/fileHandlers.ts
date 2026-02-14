import { ipcMain } from 'electron';
import { FileService } from '../services/FileService';
import { ProjectManager } from '../services/ProjectManager';

export function registerFileHandlers(
  fileService: FileService,
  projectManager: ProjectManager
) {
  // File operations
  ipcMain.handle('file:read', async (_, path: string) => {
    return await fileService.readFile(path);
  });

  ipcMain.handle('file:write', async (_, path: string, content: string, metadata?: any) => {
    return await fileService.writeFile(path, content, metadata);
  });

  ipcMain.handle('file:delete', async (_, path: string) => {
    return await fileService.deleteFile(path);
  });

  ipcMain.handle('file:rename', async (_, oldPath: string, newPath: string) => {
    return await fileService.renameFile(oldPath, newPath);
  });

  ipcMain.handle('file:create', async (_, path: string, content: string, metadata?: any) => {
    return await fileService.createFile(path, content, metadata);
  });

  // Directory operations
  ipcMain.handle('dir:read', async (_, path: string) => {
    return await fileService.readDir(path);
  });

  ipcMain.handle('dir:create', async (_, path: string) => {
    return await fileService.createDir(path);
  });

  // Project operations
  ipcMain.handle('project:create', async (_, name: string) => {
    try {
      console.log('[IPC] Creating project:', name);
      const project = await projectManager.createProject(name);
      console.log('[IPC] Project created successfully:', project);
      return project;
    } catch (error) {
      console.error('[IPC] Failed to create project:', error);
      throw error;
    }
  });

  ipcMain.handle('project:list', async () => {
    try {
      console.log('[IPC] Listing projects');
      const projects = await projectManager.listProjects();
      console.log('[IPC] Found projects:', projects.length);
      return projects;
    } catch (error) {
      console.error('[IPC] Failed to list projects:', error);
      throw error;
    }
  });
}
