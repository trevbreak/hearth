export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AgentContext {
  currentFilePath?: string;
  currentFileContent?: string;
  projectName?: string;
  projectPath?: string;
  selectedText?: string;
}

export interface AgentConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AgentProvider {
  name: 'claude' | 'openai';

  initialize(config: AgentConfig): void;

  chat(
    messages: AgentMessage[],
    context: AgentContext,
    onChunk: (chunk: string) => void
  ): Promise<string>;

  testConnection(): Promise<boolean>;
}

export interface AgentsConfig {
  defaultProvider: 'claude' | 'openai';
  claude?: {
    apiKey: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
  };
  openai?: {
    apiKey: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
  };
}
