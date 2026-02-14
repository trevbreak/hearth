import { ipcMain, BrowserWindow } from 'electron';
import { AgentService } from '../services/agents/AgentService';
import { AgentContext } from '../services/agents/agent-types';

export function registerAgentHandlers(agentService: AgentService) {
  // Send chat message with streaming
  ipcMain.handle(
    'agent:chat',
    async (event, message: string, context: AgentContext) => {
      try {
        const response = await agentService.chat(message, context, (chunk) => {
          // Send streaming chunks to renderer
          const win = BrowserWindow.fromWebContents(event.sender);
          if (win && !win.isDestroyed()) {
            event.sender.send('agent:stream-chunk', chunk);
          }
        });
        return response;
      } catch (error) {
        console.error('[Agent IPC] Chat failed:', error);
        throw error;
      }
    }
  );

  // Set active provider
  ipcMain.handle('agent:set-provider', async (_, provider: 'claude' | 'openai') => {
    try {
      agentService.setActiveProvider(provider);
      return true;
    } catch (error) {
      console.error('[Agent IPC] Set provider failed:', error);
      throw error;
    }
  });

  // Get active provider
  ipcMain.handle('agent:get-provider', async () => {
    return agentService.getActiveProviderName();
  });

  // Check if provider is configured
  ipcMain.handle('agent:is-configured', async (_, provider: string) => {
    return agentService.isProviderConfigured(provider);
  });

  // Get conversation history
  ipcMain.handle('agent:get-history', async () => {
    return agentService.getHistory();
  });

  // Clear conversation
  ipcMain.handle('agent:clear', async () => {
    agentService.clearHistory();
    return true;
  });

  // Test connection
  ipcMain.handle('agent:test-connection', async (_, provider: string) => {
    try {
      return await agentService.testConnection(provider);
    } catch (error) {
      console.error('[Agent IPC] Connection test failed:', error);
      return false;
    }
  });

  // Reinitialize after config change
  ipcMain.handle('agent:reinitialize', async () => {
    try {
      agentService.reinitialize();
      return true;
    } catch (error) {
      console.error('[Agent IPC] Reinitialize failed:', error);
      throw error;
    }
  });

  console.log('[IPC] Agent handlers registered');
}
