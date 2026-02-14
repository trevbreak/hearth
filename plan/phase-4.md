# Phase 4: Organization Agent

**Status:** Planned
**Dependencies:** Phase 3 (Complete)
**Estimated Effort:** 3-4 weeks

## Overview

Build an intelligent agent that proactively organizes project files, suggests improvements, generates insights from content, and helps maintain project structure.

## Goals

1. Auto-organize files into correct folders
2. Suggest file naming conventions
3. Generate insights and summaries
4. Detect missing documentation
5. Recommend project structure improvements
6. Auto-tag and categorize content

---

## Task 1: Agent System Architecture

### 1.1 Agent Core

**New file:** `electron/agents/Agent.ts`

**Base agent interface:**
```typescript
export interface AgentTask {
  id: string;
  type: 'organize' | 'analyze' | 'suggest' | 'generate';
  status: 'pending' | 'running' | 'completed' | 'failed';
  description: string;
  createdAt: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export abstract class Agent {
  protected llmService: LLMService;
  protected fileService: FileService;
  protected projectManager: ProjectManager;

  abstract run(task: AgentTask): Promise<void>;
  abstract canHandle(task: AgentTask): boolean;
}
```

### 1.2 Agent Manager

**New file:** `electron/agents/AgentManager.ts`

**Purpose:** Coordinate multiple agents and manage task queue

```typescript
export class AgentManager {
  private agents: Agent[] = [];
  private taskQueue: AgentTask[] = [];
  private runningTasks: Map<string, AgentTask> = new Map();
  private config: AgentConfig;

  constructor(
    private llmService: LLMService,
    private fileService: FileService,
    private projectManager: ProjectManager,
    private configManager: ConfigManager
  ) {}

  async initialize(): Promise<void> {
    // Load config
    this.config = this.configManager.getConfig().agent!;

    // Initialize agents
    this.agents.push(
      new OrganizationAgent(this.llmService, this.fileService, this.projectManager),
      new AnalysisAgent(this.llmService, this.fileService),
      new SuggestionAgent(this.llmService, this.fileService, this.projectManager)
    );
  }

  async queueTask(task: AgentTask): Promise<string> {
    // Add to queue
    this.taskQueue.push(task);
    this.processQueue();
    return task.id;
  }

  private async processQueue(): Promise<void> {
    // Process tasks in queue
    // Respect max concurrent tasks
    // Emit events for UI updates
  }

  getTaskStatus(taskId: string): AgentTask | undefined {
    return this.runningTasks.get(taskId) || this.taskQueue.find(t => t.id === taskId);
  }

  async cancelTask(taskId: string): Promise<void> {
    // Remove from queue or stop running task
  }
}
```

### 1.3 Agent Configuration

**Update:** `electron/services/ConfigManager.ts`

**Add to AppConfig:**
```typescript
agent: {
  enabled: boolean;
  autoOrganize: boolean; // Auto-run organization on file save
  autoAnalyze: boolean; // Auto-analyze PRDs when opened
  suggestionFrequency: 'always' | 'daily' | 'weekly' | 'never';
  maxConcurrentTasks: number;
}
```

---

## Task 2: Organization Agent

### 2.1 OrganizationAgent Implementation

**New file:** `electron/agents/OrganizationAgent.ts`

**Purpose:** Automatically organize files into appropriate folders

**Capabilities:**
1. Detect file type from content
2. Suggest correct folder placement
3. Identify misplaced files
4. Propose folder structure improvements
5. Auto-rename files with proper conventions

**Example logic:**
```typescript
async analyzeFile(filePath: string): Promise<OrganizationSuggestion> {
  const { content, metadata } = await this.fileService.readFile(filePath);

  const prompt = `Analyze this file and suggest:
  1. What type of document is it? (PRD, research, meeting notes, spec, design)
  2. What folder should it be in?
  3. What should it be named following best practices?

  File path: ${filePath}
  Content:
  ${content}`;

  const response = await this.llmService.sendMessage([
    { role: 'system', content: ORGANIZATION_SYSTEM_PROMPT },
    { role: 'user', content: prompt }
  ]);

  return parseOrganizationSuggestion(response.content);
}
```

### 2.2 Organization Rules Engine

**New file:** `electron/agents/rules/OrganizationRules.ts`

**Purpose:** Define rules for file organization

**Rule types:**
```typescript
interface OrganizationRule {
  name: string;
  condition: (file: FileContent) => boolean;
  action: {
    suggestedFolder?: string;
    suggestedName?: string;
    reason: string;
  };
}

// Example rules
const rules: OrganizationRule[] = [
  {
    name: 'PRD Detection',
    condition: (file) => {
      return file.metadata.type === 'prd' ||
             file.content.includes('## Problem Statement') ||
             file.path.includes('PRD');
    },
    action: {
      suggestedFolder: 'root',
      suggestedName: (current) => current.endsWith('.md') ? current : `${current}.md`,
      reason: 'PRDs should be in the project root'
    }
  },
  {
    name: 'Research Notes',
    condition: (file) => {
      return file.metadata.type === 'research' ||
             file.content.includes('## Research') ||
             file.content.includes('## Findings');
    },
    action: {
      suggestedFolder: 'research',
      reason: 'Research notes belong in the research folder'
    }
  },
  {
    name: 'Meeting Notes',
    condition: (file) => {
      return file.metadata.type === 'meeting' ||
             file.path.includes('meeting') ||
             /\d{4}-\d{2}-\d{2}.*meeting/i.test(file.content);
    },
    action: {
      suggestedFolder: 'meetings',
      suggestedName: (current) => {
        // Enforce YYYY-MM-DD-topic.md format
        const date = extractDate(current) || new Date().toISOString().split('T')[0];
        const topic = extractTopic(current) || 'notes';
        return `${date}-${topic}.md`;
      },
      reason: 'Meeting notes should follow date-topic naming convention'
    }
  },
  // More rules...
];
```

### 2.3 Organization Suggestions UI

**New file:** `src/components/agent/OrganizationSuggestions.tsx`

**Purpose:** Show organization suggestions to user

**Features:**
- List of suggested file moves/renames
- Reason for each suggestion
- Accept/Reject buttons
- "Accept All" option
- Undo capability

**UI Design:**
```
┌─────────────────────────────────────────┐
│ 🤖 Organization Suggestions (3)         │
├─────────────────────────────────────────┤
│ ✓ Move "user-interview.md"              │
│   From: / → To: research/               │
│   Reason: Research notes belong in...   │
│   [Accept] [Reject]                     │
├─────────────────────────────────────────┤
│ ✓ Rename "notes.md"                     │
│   To: "2024-02-14-kickoff-meeting.md"   │
│   Reason: Meeting notes should...       │
│   [Accept] [Reject]                     │
├─────────────────────────────────────────┤
│ [Accept All] [Dismiss All]              │
└─────────────────────────────────────────┘
```

### 2.4 Auto-Organization on Save

**Trigger:** File save event

**Workflow:**
1. User saves a file
2. If `autoOrganize` enabled, queue organization task
3. Agent analyzes file
4. If suggestions found, show notification
5. User can review and accept suggestions

---

## Task 3: Analysis Agent

### 3.1 AnalysisAgent Implementation

**New file:** `electron/agents/AnalysisAgent.ts`

**Purpose:** Analyze documents and generate insights

**Capabilities:**
1. PRD completeness check
2. Identify missing sections
3. Detect inconsistencies
4. Extract action items
5. Generate summaries
6. Find related documents

**Example analyses:**

**PRD Completeness:**
```typescript
async analyzePRD(file: FileContent): Promise<PRDAnalysis> {
  const requiredSections = [
    'Problem Statement',
    'Goals',
    'Users & Personas',
    'Requirements',
    'Success Metrics',
    'Timeline'
  ];

  const missingSections = requiredSections.filter(section =>
    !file.content.includes(`## ${section}`)
  );

  const prompt = `Analyze this PRD for completeness and quality:

  ${file.content}

  Provide:
  1. What's missing or unclear?
  2. What's done well?
  3. What needs more detail?
  4. Overall score (1-10)`;

  const response = await this.llmService.sendMessage([...]);

  return {
    missingSections,
    aiInsights: response.content,
    score: extractScore(response.content)
  };
}
```

### 3.2 Analysis Results UI

**New file:** `src/components/agent/AnalysisPanel.tsx`

**Show in Agent Panel when file is analyzed:**

```
┌─────────────────────────────────────────┐
│ 📊 PRD Analysis                          │
├─────────────────────────────────────────┤
│ Score: 7/10 ⭐⭐⭐⭐⭐⭐⭐☆☆☆            │
│                                         │
│ ✅ Strengths:                           │
│ • Clear problem statement               │
│ • Well-defined success metrics          │
│                                         │
│ ⚠️ Missing:                             │
│ • Competitive analysis                  │
│ • Technical feasibility section         │
│                                         │
│ 💡 Suggestions:                         │
│ • Add more detail to timeline           │
│ • Define edge cases in requirements     │
│                                         │
│ [Run Full Analysis] [Dismiss]           │
└─────────────────────────────────────────┘
```

### 3.3 Auto-Analysis Triggers

**Triggers:**
1. PRD file opened (if `autoAnalyze` enabled)
2. User clicks "Analyze" button
3. Scheduled analysis (weekly project health check)

---

## Task 4: Suggestion Agent

### 4.1 SuggestionAgent Implementation

**New file:** `electron/agents/SuggestionAgent.ts`

**Purpose:** Proactively suggest improvements

**Capabilities:**
1. Suggest related documents to link
2. Recommend next steps
3. Identify gaps in project structure
4. Suggest templates to use
5. Flag outdated content

**Example suggestions:**

**Missing Folders:**
```typescript
async suggestProjectStructure(project: Project): Promise<Suggestion[]> {
  const currentDirs = await this.fileService.readDir(project.path);
  const standardDirs = ['research', 'meetings', 'designs', 'specs'];
  const missing = standardDirs.filter(dir =>
    !currentDirs.some(d => d.name === dir && d.isDirectory)
  );

  return missing.map(dir => ({
    type: 'structure',
    title: `Add ${dir} folder`,
    description: `Standard PM projects include a ${dir} folder for organization`,
    action: () => this.fileService.createDir(`${project.path}/${dir}`)
  }));
}
```

**Related Documents:**
```typescript
async findRelatedDocuments(file: FileContent): Promise<Suggestion[]> {
  // Use LLM to analyze content and find semantically related docs
  const allFiles = await this.getAllProjectFiles();

  const prompt = `Given this document:
  ${file.content}

  Which of these documents are related?
  ${allFiles.map(f => `- ${f.path}: ${f.content.substring(0, 200)}...`).join('\n')}`;

  // ... parse response and return link suggestions
}
```

### 4.2 Suggestion Notification System

**New file:** `src/components/agent/SuggestionNotifications.tsx`

**Purpose:** Show proactive suggestions

**UI:** Toast notifications in bottom-right

```
┌─────────────────────────────────────┐
│ 💡 Tip: Link Related Documents      │
│                                     │
│ This PRD might relate to:           │
│ • research/user-interviews.md       │
│                                     │
│ [Add Links] [Dismiss] [Don't Ask]   │
└─────────────────────────────────────┘
```

### 4.3 Suggestion Settings

**Add to Settings UI:**
- Suggestion frequency slider
- Categories to enable/disable:
  - [ ] Organization suggestions
  - [ ] Structure improvements
  - [ ] Related documents
  - [ ] Content quality tips

---

## Task 5: Content Generation

### 5.1 Template Generation

**New file:** `electron/agents/generators/TemplateGenerator.ts`

**Purpose:** Generate document templates based on context

**Templates to generate:**
1. Meeting notes from calendar invite
2. User research questions
3. Feature spec from PRD
4. Acceptance criteria from requirements
5. Go-to-market plan

**Example:**
```typescript
async generateMeetingNotes(params: {
  title: string;
  attendees: string[];
  agenda?: string;
}): Promise<string> {
  const prompt = `Generate meeting notes template for:
  Title: ${params.title}
  Attendees: ${params.attendees.join(', ')}
  Agenda: ${params.agenda || 'TBD'}

  Include sections: Agenda, Discussion, Decisions, Action Items, Next Steps`;

  const response = await this.llmService.sendMessage([...]);
  return response.content;
}
```

### 5.2 Quick Generate Actions

**Add to file tree context menu:**
- "Generate meeting notes" (in meetings folder)
- "Generate spec from PRD" (on PRD file)
- "Generate research questions" (in research folder)

---

## Task 6: Agent Activity & History

### 6.1 Activity Log

**New file:** `electron/services/ActivityLog.ts`

**Purpose:** Track all agent actions for transparency

**Schema:**
```typescript
interface AgentActivity {
  id: string;
  timestamp: Date;
  agentType: string;
  action: string;
  targetFile?: string;
  result: 'success' | 'failed' | 'dismissed';
  details?: any;
}
```

### 6.2 Activity Panel UI

**New file:** `src/components/agent/ActivityLog.tsx`

**Show in Agent Panel:**

```
┌─────────────────────────────────────────┐
│ 📜 Agent Activity                        │
├─────────────────────────────────────────┤
│ 2 min ago                               │
│ 🤖 Suggested moving user-interview.md   │
│    → Accepted                           │
│                                         │
│ 1 hour ago                              │
│ 📊 Analyzed PRD.md                      │
│    → Score: 7/10                        │
│                                         │
│ Yesterday                               │
│ 💡 Suggested adding designs folder      │
│    → Dismissed                          │
└─────────────────────────────────────────┘
```

### 6.3 Undo Capability

**Feature:** Undo agent actions

**Implementation:**
- Store backup before agent makes changes
- "Undo" button in activity log
- Restore files from backup
- Time limit (24 hours)

---

## Task 7: Background Processing

### 7.1 Worker Thread for Agents

**New file:** `electron/workers/agentWorker.ts`

**Purpose:** Run agents in background without blocking UI

**Implementation:**
```typescript
import { Worker } from 'worker_threads';

export class AgentWorker {
  private worker: Worker;

  async runTask(task: AgentTask): Promise<AgentTask> {
    return new Promise((resolve, reject) => {
      this.worker.postMessage({ type: 'run', task });

      this.worker.on('message', (result) => {
        if (result.type === 'complete') {
          resolve(result.task);
        } else if (result.type === 'error') {
          reject(result.error);
        }
      });
    });
  }
}
```

### 7.2 Progress Indicators

**UI:** Show progress for long-running agent tasks

**Components:**
- Progress bar in agent panel
- Status text ("Analyzing 5 of 12 files...")
- Cancel button

---

## Testing Checklist

### Organization Agent
- [ ] Detects misplaced files correctly
- [ ] Suggests appropriate folders
- [ ] Naming convention suggestions are helpful
- [ ] Can accept/reject suggestions
- [ ] Undo works correctly
- [ ] Auto-organize on save works

### Analysis Agent
- [ ] PRD analysis is accurate
- [ ] Missing sections are detected
- [ ] Quality score makes sense
- [ ] Action items are extracted
- [ ] Auto-analysis triggers correctly

### Suggestion Agent
- [ ] Related documents are relevant
- [ ] Structure suggestions are helpful
- [ ] Notification frequency respects settings
- [ ] Can dismiss suggestions permanently

### Content Generation
- [ ] Templates are well-formatted
- [ ] Generated content is relevant
- [ ] Templates include appropriate sections

### Performance
- [ ] Agents don't block UI
- [ ] Background processing works
- [ ] Can handle large projects (50+ files)
- [ ] Memory usage is reasonable

---

## Privacy & Control

**Principles:**
1. **User Control**: All agent actions require approval (except auto-organize if enabled)
2. **Transparency**: All actions logged and visible
3. **Undo**: Recent actions can be undone
4. **Privacy**: No data sent to external services without consent
5. **Disable**: Users can fully disable agents

---

## Definition of Done

- [ ] Organization agent works and provides useful suggestions
- [ ] Analysis agent can evaluate PRDs and documents
- [ ] Suggestion agent proactively helps
- [ ] Content generation produces quality templates
- [ ] Activity log tracks all agent actions
- [ ] Agents run in background without blocking UI
- [ ] Settings UI allows full control over agent behavior
- [ ] Documentation includes agent capabilities and settings
