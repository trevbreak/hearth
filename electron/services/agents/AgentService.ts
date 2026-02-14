import { ConfigManager } from '../ConfigManager';
import { AgentProvider, AgentMessage, AgentContext, AgentsConfig } from './agent-types';
import { ClaudeAgentProvider } from './ClaudeAgentProvider';
import { OpenAIAgentProvider } from './OpenAIAgentProvider';

export class AgentService {
  private providers: Map<string, AgentProvider> = new Map();
  private activeProviderName: 'claude' | 'openai' = 'claude';
  private conversationHistory: AgentMessage[] = [];

  constructor(private configManager: ConfigManager) {}

  initialize(): void {
    const config = this.configManager.getConfig();
    const agentsConfig = config.agents as AgentsConfig | undefined;

    if (agentsConfig?.claude?.apiKey) {
      const provider = new ClaudeAgentProvider();
      provider.initialize({
        apiKey: agentsConfig.claude.apiKey,
        model: agentsConfig.claude.model || 'claude-sonnet-4-5-20250929',
        maxTokens: agentsConfig.claude.maxTokens,
        temperature: agentsConfig.claude.temperature,
      });
      this.providers.set('claude', provider);
    }

    if (agentsConfig?.openai?.apiKey) {
      const provider = new OpenAIAgentProvider();
      provider.initialize({
        apiKey: agentsConfig.openai.apiKey,
        model: agentsConfig.openai.model || 'gpt-4-turbo',
        maxTokens: agentsConfig.openai.maxTokens,
        temperature: agentsConfig.openai.temperature,
      });
      this.providers.set('openai', provider);
    }

    this.activeProviderName = agentsConfig?.defaultProvider || 'claude';
    console.log('[AgentService] Initialized. Active provider:', this.activeProviderName);
  }

  reinitialize(): void {
    this.providers.clear();
    this.initialize();
  }

  getActiveProviderName(): 'claude' | 'openai' {
    return this.activeProviderName;
  }

  setActiveProvider(name: 'claude' | 'openai'): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider "${name}" is not configured. Please add an API key in Settings.`);
    }
    this.activeProviderName = name;
  }

  isProviderConfigured(name: string): boolean {
    return this.providers.has(name);
  }

  async chat(
    message: string,
    context: AgentContext,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const provider = this.providers.get(this.activeProviderName);
    if (!provider) {
      throw new Error(
        `No agent provider configured. Please add an API key for ${this.activeProviderName} in Settings.`
      );
    }

    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });

    const response = await provider.chat(this.conversationHistory, context, onChunk);

    this.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    });

    return response;
  }

  async testConnection(providerName: string): Promise<boolean> {
    const provider = this.providers.get(providerName);
    if (!provider) return false;
    return provider.testConnection();
  }

  getHistory(): AgentMessage[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}
