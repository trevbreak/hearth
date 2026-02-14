# Phase 3: LLM Integration

**Status:** Planned
**Dependencies:** Phase 2 (Complete)
**Estimated Effort:** 2-3 weeks

## Overview

Integrate Large Language Models (Anthropic Claude, OpenAI GPT, Ollama) into the AI Assistant panel, enabling users to get help with their PM work.

## Goals

1. Add pluggable LLM provider system
2. Create settings UI for API configuration
3. Implement chat interface in AI Assistant panel
4. Add context-aware prompts for PM tasks
5. Enable file/project context injection

---

## Task 1: LLM Provider System

### 1.1 Create Provider Interface

**New file:** `electron/services/llm/LLMProvider.ts`

**Interface definition:**
```typescript
export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface LLMProvider {
  name: 'anthropic' | 'openai' | 'ollama';
  sendMessage(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
  streamMessage(messages: LLMMessage[], onChunk: (chunk: string) => void, options?: LLMOptions): Promise<void>;
  testConnection(): Promise<boolean>;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  systemPrompt?: string;
}
```

### 1.2 Anthropic Provider

**New file:** `electron/services/llm/AnthropicProvider.ts`

**Dependencies:**
```bash
npm install @anthropic-ai/sdk
```

**Implementation:**
- Use Anthropic SDK
- Support Claude 3.5 Sonnet, Opus, Haiku
- Handle API errors gracefully
- Implement streaming for real-time responses
- Add retry logic with exponential backoff

**Configuration:**
```typescript
interface AnthropicConfig {
  apiKey: string;
  model: 'claude-3-5-sonnet-20241022' | 'claude-3-opus-20240229' | 'claude-3-haiku-20240307';
  maxTokens: number;
}
```

### 1.3 OpenAI Provider

**New file:** `electron/services/llm/OpenAIProvider.ts`

**Dependencies:**
```bash
npm install openai
```

**Implementation:**
- Use OpenAI SDK
- Support GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- Handle API errors
- Implement streaming
- Add retry logic

**Configuration:**
```typescript
interface OpenAIConfig {
  apiKey: string;
  model: 'gpt-4' | 'gpt-4-turbo-preview' | 'gpt-3.5-turbo';
  maxTokens: number;
}
```

### 1.4 Ollama Provider

**New file:** `electron/services/llm/OllamaProvider.ts`

**Implementation:**
- HTTP requests to local Ollama API (default: http://localhost:11434)
- Support any installed Ollama model
- List available models
- No API key required
- Handle connection errors (Ollama not running)

**Configuration:**
```typescript
interface OllamaConfig {
  baseUrl: string;
  model: string; // User can type any model name
}
```

### 1.5 LLM Service Manager

**New file:** `electron/services/llm/LLMService.ts`

**Purpose:** Manage active provider and route requests

**Implementation:**
```typescript
export class LLMService {
  private providers: Map<string, LLMProvider>;
  private activeProvider: string | null;

  constructor(private configManager: ConfigManager) {
    this.providers = new Map();
  }

  async initialize(): Promise<void> {
    // Load config and initialize active provider
  }

  setActiveProvider(name: string): void {
    // Switch provider
  }

  async sendMessage(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
    // Route to active provider
  }

  async streamMessage(messages: LLMMessage[], onChunk: (chunk: string) => void, options?: LLMOptions): Promise<void> {
    // Route to active provider with streaming
  }
}
```

### 1.6 Update Config Schema

**File:** `electron/services/ConfigManager.ts`

**Add to AppConfig:**
```typescript
llm: {
  defaultProvider: 'anthropic' | 'openai' | 'ollama';
  providers: {
    anthropic?: {
      apiKey: string;
      model: string;
    };
    openai?: {
      apiKey: string;
      model: string;
    };
    ollama?: {
      baseUrl: string;
      model: string;
    };
  };
  temperature: number;
  maxTokens: number;
}
```

---

## Task 2: IPC Communication for LLM

### 2.1 Register LLM Handlers

**File:** `electron/ipc/llmHandlers.ts` (new)

**Handlers:**
```typescript
export function registerLLMHandlers(llmService: LLMService) {
  // Send message (non-streaming)
  ipcMain.handle('llm:send', async (_, messages: LLMMessage[], options?: LLMOptions) => {
    return await llmService.sendMessage(messages, options);
  });

  // Stream message
  ipcMain.handle('llm:stream', async (event, messages: LLMMessage[], options?: LLMOptions) => {
    await llmService.streamMessage(
      messages,
      (chunk) => {
        event.sender.send('llm:stream-chunk', chunk);
      },
      options
    );
  });

  // Test provider connection
  ipcMain.handle('llm:test', async (_, provider: string) => {
    // Test connection to specific provider
  });

  // List available models (for Ollama)
  ipcMain.handle('llm:list-models', async (_, provider: string) => {
    // Return available models
  });
}
```

### 2.2 Update Preload Script

**File:** `electron/preload.ts`

**Add to API:**
```typescript
// LLM operations
sendMessage: (messages: LLMMessage[], options?: LLMOptions) =>
  ipcRenderer.invoke('llm:send', messages, options),
streamMessage: (messages: LLMMessage[], options?: LLMOptions) =>
  ipcRenderer.invoke('llm:stream', messages, options),
onStreamChunk: (callback: (chunk: string) => void) => {
  ipcRenderer.on('llm:stream-chunk', (_, chunk) => callback(chunk));
},
testLLM: (provider: string) => ipcRenderer.invoke('llm:test', provider),
listModels: (provider: string) => ipcRenderer.invoke('llm:list-models', provider),
```

### 2.3 Update Main Process

**File:** `electron/main.ts`

**Changes:**
```typescript
import { LLMService } from './services/llm/LLMService';
import { registerLLMHandlers } from './ipc/llmHandlers';

let llmService: LLMService;

async function initializeApp() {
  // ... existing
  llmService = new LLMService(configManager);
  await llmService.initialize();

  registerLLMHandlers(llmService);
  // ...
}
```

---

## Task 3: Settings UI

### 3.1 Settings Store

**New file:** `src/stores/settingsStore.ts`

**State:**
```typescript
interface SettingsStore {
  config: AppConfig | null;
  isLoading: boolean;

  loadConfig: () => Promise<void>;
  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  testProvider: (provider: string) => Promise<boolean>;
  listModels: (provider: string) => Promise<string[]>;
}
```

### 3.2 Settings Modal

**New file:** `src/components/settings/SettingsModal.tsx`

**Sections:**
1. General (workspace path)
2. LLM Providers (tab-based)
3. Editor preferences
4. Agent settings (placeholder for Phase 4)

**Design:**
- Modal overlay (Cmd+, to open)
- Sidebar navigation between sections
- Save/Cancel buttons
- Form validation

### 3.3 LLM Provider Settings

**New file:** `src/components/settings/LLMSettings.tsx`

**Tabs:**
- Anthropic
- OpenAI
- Ollama

**Each tab shows:**
- API key input (for Anthropic/OpenAI)
- Base URL input (for Ollama)
- Model selector dropdown
- Temperature slider (0-2)
- Max tokens input
- Test connection button
- Active provider radio button

**Validation:**
- API key format (starts with sk- for OpenAI, etc.)
- Test connection before saving
- Show success/error messages

### 3.4 Settings Button

**File:** `src/components/layout/AppLayout.tsx`

**Add settings button:**
- Gear icon in top-left (below window controls)
- Opens SettingsModal
- Keyboard shortcut: Cmd+,

---

## Task 4: Chat Interface

### 4.1 Chat Store

**New file:** `src/stores/chatStore.ts`

**State:**
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatStore {
  messages: Message[];
  isStreaming: boolean;
  currentResponse: string;

  sendMessage: (content: string, context?: ChatContext) => Promise<void>;
  clearChat: () => void;
  stopGeneration: () => void;
}

interface ChatContext {
  currentFile?: FileContent;
  currentProject?: Project;
  selectedText?: string;
}
```

### 4.2 Update Agent Panel

**File:** `src/components/agent/AgentPanel.tsx`

**Current:** Placeholder

**New implementation:**
- Message list (scrollable)
- Message input (textarea with auto-resize)
- Send button
- Clear chat button
- Stop generation button (when streaming)
- Context indicators (show what context is included)

**Features:**
- Auto-scroll to bottom on new messages
- Markdown rendering in assistant messages
- Code syntax highlighting
- Copy message button
- Regenerate response button

### 4.3 Message Component

**New file:** `src/components/agent/Message.tsx`

**Props:**
```typescript
interface MessageProps {
  message: Message;
  isStreaming?: boolean;
}
```

**Rendering:**
- User messages: Right-aligned, blue background
- Assistant messages: Left-aligned, white background
- Markdown formatting for assistant messages
- Timestamp on hover
- Copy button for assistant messages

### 4.4 Input Component

**New file:** `src/components/agent/ChatInput.tsx`

**Features:**
- Auto-resizing textarea (1-5 lines)
- Send on Cmd+Enter
- Shift+Enter for new line
- Character counter (optional)
- Disabled state while streaming
- Context tags (removable pills showing included context)

---

## Task 5: Context-Aware Prompts

### 5.1 System Prompt Templates

**New file:** `electron/services/llm/prompts.ts`

**Base system prompt:**
```typescript
export const BASE_SYSTEM_PROMPT = `You are an AI assistant helping a Product Manager. You have access to their project files and context.

Your role is to help with:
- Writing and reviewing PRDs
- Analyzing user research
- Drafting product specs
- Creating meeting notes
- Brainstorming features
- Prioritizing roadmaps

Be concise, actionable, and PM-focused.`;
```

**Context injection:**
```typescript
export function buildSystemPrompt(context: ChatContext): string {
  let prompt = BASE_SYSTEM_PROMPT;

  if (context.currentProject) {
    prompt += `\n\nCurrent Project: ${context.currentProject.name}`;
  }

  if (context.currentFile) {
    prompt += `\n\nCurrent File: ${context.currentFile.path}\nContent:\n${context.currentFile.content}`;
  }

  if (context.selectedText) {
    prompt += `\n\nSelected Text:\n${context.selectedText}`;
  }

  return prompt;
}
```

### 5.2 Quick Actions

**New file:** `src/components/agent/QuickActions.tsx`

**Purpose:** Pre-made prompts for common PM tasks

**Actions:**
- "Review this PRD" (includes current file)
- "Summarize this research" (includes current file)
- "Generate user stories from this"
- "What's missing from this spec?"
- "Help me prioritize these features"
- "Draft acceptance criteria"

**UI:** Buttons/chips above chat input

**Implementation:**
```typescript
const quickActions = [
  {
    label: 'Review PRD',
    prompt: 'Please review this PRD and provide feedback on clarity, completeness, and feasibility.',
    requiresFile: true,
  },
  // ...
];
```

### 5.3 Context Selector

**New file:** `src/components/agent/ContextSelector.tsx`

**Features:**
- Checkboxes for context inclusion:
  - [ ] Include current file
  - [ ] Include project metadata
  - [ ] Include selected text
- Token counter estimate
- Warning if context is very large

---

## Task 6: Error Handling & Rate Limiting

### 6.1 Error Handling

**Common errors:**
1. **Invalid API key** → Show settings link
2. **Rate limit exceeded** → Show retry timer
3. **Model not available** → Suggest alternative
4. **Network error** → Retry button
5. **Ollama not running** → Show installation instructions

**Implementation:**
```typescript
// In chat store
catch (error) {
  if (error.status === 401) {
    // Invalid API key
    showError('Invalid API key. Please check your settings.');
  } else if (error.status === 429) {
    // Rate limited
    showError('Rate limit exceeded. Please wait before trying again.');
  } else if (error.message.includes('ECONNREFUSED')) {
    // Ollama not running
    showError('Could not connect to Ollama. Make sure Ollama is running.');
  } else {
    showError('An error occurred. Please try again.');
  }
}
```

### 6.2 Rate Limiting (Client-side)

**New file:** `src/lib/rateLimiter.ts`

**Purpose:** Prevent excessive API calls

**Implementation:**
- Track requests per minute
- Warn user before hitting provider limits
- Queue requests if needed
- Show rate limit status in UI

---

## Testing Checklist

### Provider Integration
- [ ] Anthropic provider sends messages
- [ ] OpenAI provider sends messages
- [ ] Ollama provider sends messages
- [ ] Streaming works for all providers
- [ ] API errors are handled gracefully
- [ ] Can switch between providers

### Settings UI
- [ ] Settings modal opens and closes
- [ ] Can save API keys
- [ ] Test connection works
- [ ] Model selector shows available models
- [ ] Settings persist across app restarts
- [ ] Invalid API keys show error

### Chat Interface
- [ ] Can send messages
- [ ] Messages display correctly
- [ ] Streaming responses work
- [ ] Can clear chat
- [ ] Can stop generation
- [ ] Markdown renders in messages
- [ ] Code blocks have syntax highlighting

### Context Awareness
- [ ] Current file is included in context
- [ ] Project metadata is included
- [ ] Selected text is included
- [ ] Quick actions work
- [ ] System prompts are applied correctly

---

## Security Considerations

1. **API Key Storage**
   - Store encrypted in config file
   - Never log API keys
   - Clear from memory after use

2. **File Content**
   - Warn before sending large files
   - Don't send system files
   - User controls what context is shared

3. **Rate Limiting**
   - Prevent runaway API costs
   - Show cost estimates (optional)

---

## Definition of Done

- [ ] All three LLM providers (Anthropic, OpenAI, Ollama) work
- [ ] Settings UI allows configuration
- [ ] Chat interface is functional and polished
- [ ] Streaming responses work smoothly
- [ ] Context injection works correctly
- [ ] Quick actions are helpful
- [ ] Error handling is comprehensive
- [ ] Documentation updated with LLM setup instructions
