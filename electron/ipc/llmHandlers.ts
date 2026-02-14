import { ipcMain } from 'electron';
import { LLMService } from '../services/LLMService';

export function registerLLMHandlers(llmService: LLMService) {
  // Generate folder summary
  ipcMain.handle('llm:summarize-folder', async (_, folderPath: string) => {
    try {
      return await llmService.summarizeFolder({ folderPath });
    } catch (error) {
      console.error('[LLM IPC] Failed to summarize folder:', error);
      throw error;
    }
  });

  // Test OpenAI connection
  ipcMain.handle('llm:test-connection', async () => {
    try {
      return await llmService.testConnection();
    } catch (error) {
      console.error('[LLM IPC] Connection test failed:', error);
      return false;
    }
  });

  // Invalidate cache
  ipcMain.handle('llm:invalidate-cache', async (_, folderPath?: string) => {
    llmService.invalidateCache(folderPath);
  });

  console.log('[IPC] LLM handlers registered');
}
