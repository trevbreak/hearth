import { create } from 'zustand';
import { useFileStore } from './fileStore';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AgentStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  activeProvider: 'claude' | 'openai';
  error: string | null;

  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  setProvider: (provider: 'claude' | 'openai') => Promise<void>;
  setError: (error: string | null) => void;
  loadProvider: () => Promise<void>;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamingContent: '',
  activeProvider: 'claude',
  error: null,

  loadProvider: async () => {
    try {
      const provider = await window.api.agentGetProvider();
      set({ activeProvider: provider });
    } catch {
      // Default to claude
    }
  },

  sendMessage: async (content: string) => {
    const { isStreaming } = get();
    if (isStreaming) return;

    const fileStore = useFileStore.getState();

    const context = {
      currentFilePath: fileStore.currentFile?.path,
      currentFileContent: fileStore.currentFile?.content,
      projectName: fileStore.currentProject?.name,
      projectPath: fileStore.currentProject?.path,
    };

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
      streamingContent: '',
      error: null,
    }));

    // Listen for streaming chunks
    let fullResponse = '';
    const removeListener = window.api.onAgentStreamChunk((chunk: string) => {
      fullResponse += chunk;
      set({ streamingContent: fullResponse });
    });

    try {
      await window.api.agentChat(content, context);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isStreaming: false,
        streamingContent: '',
      }));
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to get response from AI assistant.';
      set({
        isStreaming: false,
        streamingContent: '',
        error: errorMsg,
      });
    } finally {
      removeListener();
    }
  },

  clearChat: () => {
    window.api.agentClear();
    set({ messages: [], streamingContent: '', error: null });
  },

  setProvider: async (provider: 'claude' | 'openai') => {
    try {
      await window.api.agentSetProvider(provider);
      set({ activeProvider: provider });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to switch provider.' });
    }
  },

  setError: (error: string | null) => set({ error }),
}));
