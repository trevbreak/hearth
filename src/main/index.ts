import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { registerFileHandlers } from './ipc/fileHandlers';
import { registerConfigHandlers } from './ipc/configHandlers';
import { FileService } from './services/FileService';
import { ConfigManager } from './services/ConfigManager';
import { ProjectManager } from './services/ProjectManager';

// Services (singleton instances)
let fileService: FileService;
let configManager: ConfigManager;
let projectManager: ProjectManager;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: 'hiddenInset', // Mac-style title bar
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load app
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(join(__dirname, '../../out/renderer/index.html'));
  }

  return win;
}

async function initializeApp() {
  // Initialize services
  configManager = new ConfigManager();
  await configManager.initialize();

  fileService = new FileService(configManager);
  projectManager = new ProjectManager(fileService, configManager);

  // Register IPC handlers
  registerFileHandlers(fileService, projectManager);
  registerConfigHandlers(configManager);

  // Create window
  createWindow();
}

app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
