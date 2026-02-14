import { ipcMain } from 'electron';
import { ConfigManager } from '../services/ConfigManager';

export function registerConfigHandlers(configManager: ConfigManager) {
  ipcMain.handle('config:get', async () => {
    return configManager.getConfig();
  });

  ipcMain.handle('config:update', async (_, config: any) => {
    return await configManager.updateConfig(config);
  });
}
