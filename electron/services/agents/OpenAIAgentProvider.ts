import OpenAI from 'openai';
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

export class OpenAIAgentProvider implements AgentProvider {
  name = 'openai' as const;
  private client: OpenAI | null = null;
  private model = 'gpt-4-turbo';
  private maxTokens = 4096;
  private temperature = 0.7;

  initialize(config: AgentConfig): void {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model || 'gpt-4-turbo';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature ?? 0.7;
    console.log('[OpenAIAgent] Initialized with model:', this.model);
  }

  async chat(
    messages: AgentMessage[],
    context: AgentContext,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI agent not initialized. Please configure your API key in Settings.');
    }

    const systemPrompt = buildSystemPrompt(context);

    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    let fullResponse = '';

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: openaiMessages,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullResponse += delta;
        onChunk(delta);
      }
    }

    return fullResponse;
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10,
      });
      return true;
    } catch (error) {
      console.error('[OpenAIAgent] Connection test failed:', error);
      return false;
    }
  }
}
