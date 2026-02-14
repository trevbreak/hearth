import Anthropic from '@anthropic-ai/sdk';
import { AgentProvider, AgentConfig, AgentMessage, AgentContext } from './agent-types';

const PM_SYSTEM_PROMPT = `You are an AI assistant helping a Product Manager. You have context about their current project and files.

Your role is to help with:
- Writing and reviewing PRDs
- Analyzing user research
- Drafting product specs and acceptance criteria
- Creating meeting notes and summaries
- Brainstorming features and solutions
- Organizing project structure
- Generating user stories

Be concise, actionable, and PM-focused. Use markdown formatting in your responses.`;

function buildSystemPrompt(context: AgentContext): string {
  let prompt = PM_SYSTEM_PROMPT;

  if (context.projectName) {
    prompt += `\n\nCurrent Project: ${context.projectName}`;
  }

  if (context.currentFilePath) {
    prompt += `\n\nCurrent File: ${context.currentFilePath}`;
  }

  if (context.currentFileContent) {
    const truncated = context.currentFileContent.slice(0, 8000);
    prompt += `\n\nFile Content:\n${truncated}`;
  }

  if (context.selectedText) {
    prompt += `\n\nSelected Text:\n${context.selectedText}`;
  }

  return prompt;
}

export class ClaudeAgentProvider implements AgentProvider {
  name = 'claude' as const;
  private client: Anthropic | null = null;
  private model = 'claude-sonnet-4-5-20250514';
  private maxTokens = 4096;
  private temperature = 0.7;

  initialize(config: AgentConfig): void {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model || 'claude-sonnet-4-5-20250514';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature ?? 0.7;
    console.log('[ClaudeAgent] Initialized with model:', this.model);
  }

  async chat(
    messages: AgentMessage[],
    context: AgentContext,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Claude agent not initialized. Please configure your API key in Settings.');
    }

    const systemPrompt = buildSystemPrompt(context);

    const anthropicMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    let fullResponse = '';

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        fullResponse += event.delta.text;
        onChunk(event.delta.text);
      }
    }

    return fullResponse;
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      return true;
    } catch (error) {
      console.error('[ClaudeAgent] Connection test failed:', error);
      return false;
    }
  }
}
