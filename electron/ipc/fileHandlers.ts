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

  // Directory operations
  ipcMain.handle('dir:read', async (_, path: string) => {
    return await fileService.readDir(path);
  });

  ipcMain.handle('dir:create', async (_, path: string) => {
    return await fileService.createDir(path);
  });

  // Project operations
  ipcMain.handle('project:create', async (_, name: string) => {
    return await projectManager.createProject(name);
  });

  ipcMain.handle('project:list', async () => {
    return await projectManager.listProjects();
  });
}
