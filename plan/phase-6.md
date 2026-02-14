# Phase 6: Analysis & Automation

**Status:** Planned
**Dependencies:** Phase 5 (Complete)
**Estimated Effort:** 4-5 weeks

## Overview

Build advanced analysis capabilities and workflow automation to make Herth an indispensable PM tool. Integrate with external tools and automate repetitive tasks.

## Goals

1. PRD analysis and feedback
2. Integration with Jira, Linear, GitHub
3. Meeting transcript processing
4. Marketing material generation
5. Roadmap visualization
6. Advanced search and insights
7. Workflow automation

---

## Task 1: PRD Analysis & Feedback

### 1.1 Comprehensive PRD Analyzer

**New file:** `electron/agents/analyzers/PRDAnalyzer.ts`

**Capabilities:**
1. **Completeness Check**
   - Verify all required sections present
   - Check for placeholder text
   - Ensure metrics are quantifiable
   - Validate timeline is realistic

2. **Clarity Analysis**
   - Identify vague language
   - Flag jargon without definitions
   - Suggest more specific wording
   - Check readability score

3. **Feasibility Assessment**
   - Analyze technical complexity
   - Identify potential blockers
   - Flag unrealistic timelines
   - Suggest scope reduction options

4. **Stakeholder Alignment**
   - Check if all stakeholders mentioned
   - Identify missing perspectives
   - Suggest reviewers

5. **Competitive Analysis**
   - Check if competitors analyzed
   - Suggest differentiation points
   - Flag market risks

**Implementation:**
```typescript
export class PRDAnalyzer {
  async analyze(file: FileContent): Promise<PRDAnalysisReport> {
    const sections = this.extractSections(file.content);

    const completeness = await this.checkCompleteness(sections);
    const clarity = await this.analyzeClarity(file.content);
    const feasibility = await this.assessFeasibility(file.content);
    const alignment = await this.checkAlignment(file.content);

    return {
      score: this.calculateOverallScore(completeness, clarity, feasibility, alignment),
      completeness,
      clarity,
      feasibility,
      alignment,
      recommendations: this.generateRecommendations(...)
    };
  }

  private async analyzeClarity(content: string): Promise<ClarityAnalysis> {
    const prompt = `Analyze this PRD for clarity:

    ${content}

    Identify:
    1. Vague or ambiguous statements
    2. Undefined jargon or acronyms
    3. Sections that need more detail
    4. Overly complex sentences

    Format as JSON: { vaguePhrases: [], undefinedTerms: [], needsMoreDetail: [] }`;

    const response = await this.llmService.sendMessage([...]);
    return JSON.parse(response.content);
  }
}
```

### 1.2 PRD Review Mode

**New file:** `src/components/editor/ReviewMode.tsx`

**Purpose:** Side-by-side review interface

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ PRD.md                            [Review Mode]         │
├──────────────────────────┬──────────────────────────────┤
│ ## Problem Statement     │ 📊 Analysis                  │
│                          │                              │
│ Users struggle with      │ ⚠️ Clarity Issue             │
│ managing multiple        │ "struggle with" is vague     │
│ tools...                 │                              │
│                          │ 💡 Suggestion                │
│                          │ Be more specific:            │
│                          │ "Users spend 2+ hours/day    │
│                          │ switching between tools..."  │
│                          │                              │
│                          │ [Accept] [Dismiss]           │
└──────────────────────────┴──────────────────────────────┘
```

**Features:**
- Highlight issues inline
- Show suggestions in sidebar
- Accept/dismiss feedback
- Track changes from feedback
- Export review report

### 1.3 Automated PRD Checklist

**New file:** `src/components/editor/PRDChecklist.tsx`

**Purpose:** Interactive checklist for PRD quality

**Checks:**
- [ ] Problem statement is clear and specific
- [ ] Target users/personas are defined
- [ ] Success metrics are quantifiable
- [ ] Requirements are prioritized (P0/P1/P2)
- [ ] Timeline includes all phases
- [ ] Dependencies are identified
- [ ] Risks are documented with mitigations
- [ ] Out of scope is explicitly stated
- [ ] Stakeholders have been identified
- [ ] Technical feasibility assessed

**Auto-check:** Agent runs checks and marks items

**Manual check:** PM can check items as they address them

---

## Task 2: Integration with Project Management Tools

### 2.1 Integration Framework

**New file:** `electron/services/integrations/IntegrationService.ts`

**Purpose:** Abstract integration layer

```typescript
export interface Integration {
  name: string;
  type: 'jira' | 'linear' | 'github' | 'asana' | 'notion';
  enabled: boolean;
  config: any;
}

export interface IntegrationProvider {
  authenticate(): Promise<boolean>;
  testConnection(): Promise<boolean>;

  // Issues/Tasks
  listIssues(filters?: any): Promise<Issue[]>;
  createIssue(issue: CreateIssueInput): Promise<Issue>;
  updateIssue(id: string, updates: any): Promise<Issue>;
  syncIssue(id: string): Promise<Issue>;

  // Projects
  listProjects(): Promise<ExternalProject[]>;
  getProject(id: string): Promise<ExternalProject>;
}
```

### 2.2 Jira Integration

**New file:** `electron/services/integrations/JiraIntegration.ts`

**Dependencies:**
```bash
npm install jira-client
```

**Features:**
1. **Authentication**: API token or OAuth
2. **Sync Issues**: Pull issues into Herth
3. **Create from PRD**: Generate Jira stories from PRD requirements
4. **Link Issues**: Link PRD sections to Jira issues
5. **Status Updates**: Show issue status in Herth

**Implementation:**
```typescript
export class JiraIntegration implements IntegrationProvider {
  private client: JiraClient;

  async createIssuesFromPRD(prd: FileContent): Promise<Issue[]> {
    // Parse requirements from PRD
    const requirements = this.extractRequirements(prd.content);

    const issues: Issue[] = [];
    for (const req of requirements) {
      const issue = await this.client.addNewIssue({
        fields: {
          project: { key: this.config.projectKey },
          summary: req.title,
          description: req.description,
          issuetype: { name: 'Story' },
          priority: this.mapPriority(req.priority),
          labels: ['herth-generated']
        }
      });
      issues.push(issue);
    }

    return issues;
  }

  private extractRequirements(content: string): Requirement[] {
    // Parse markdown to extract requirements
    // Look for sections like "### Must Have (P0)"
    // Extract list items as requirements
  }
}
```

### 2.3 Linear Integration

**New file:** `electron/services/integrations/LinearIntegration.ts`

**Dependencies:**
```bash
npm install @linear/sdk
```

**Features:**
- Similar to Jira
- Better support for roadmaps
- Sync project status
- Create issues from requirements

### 2.4 GitHub Integration

**New file:** `electron/services/integrations/GitHubIntegration.ts`

**Dependencies:**
```bash
npm install @octokit/rest
```

**Features:**
1. **Link PRDs to Repos**: Associate PRDs with GitHub repos
2. **Create Issues**: Generate GitHub issues from specs
3. **Track PRs**: Show related PRs in Herth
4. **Release Notes**: Generate release notes from merged PRs
5. **Milestones**: Sync GitHub milestones with timelines

### 2.5 Integration UI

**New file:** `src/components/integrations/IntegrationsSettings.tsx`

**Add to Settings:**

**For each integration:**
- Enable/disable toggle
- Authentication (API key, OAuth)
- Configuration (project ID, board ID, etc.)
- Test connection button
- Sync settings (frequency, what to sync)

**Actions:**
- "Create Jira Issues from PRD"
- "Sync Linear Issues"
- "Link GitHub Repo"

---

## Task 3: Meeting Transcript Processing

### 3.1 Transcript Upload

**New file:** `src/components/meetings/TranscriptUpload.tsx`

**Features:**
- Drag-and-drop upload
- Paste transcript text
- Import from common formats (VTT, SRT, TXT)
- Integrate with Zoom, Google Meet (via API)

### 3.2 Transcript Analyzer

**New file:** `electron/agents/analyzers/TranscriptAnalyzer.ts`

**Capabilities:**
1. **Extract Action Items**
   - Identify commitments and tasks
   - Assign to people
   - Suggest due dates

2. **Summarize Discussion**
   - Key points
   - Decisions made
   - Open questions

3. **Identify Speakers**
   - Map speakers to known stakeholders
   - Track who said what

4. **Generate Notes**
   - Create structured meeting notes
   - Include agenda, discussion, actions

**Implementation:**
```typescript
export class TranscriptAnalyzer {
  async analyze(transcript: string): Promise<TranscriptAnalysis> {
    const prompt = `Analyze this meeting transcript:

    ${transcript}

    Extract:
    1. Action items (who, what, when)
    2. Key decisions made
    3. Open questions
    4. Main discussion topics
    5. Next steps

    Format as JSON.`;

    const response = await this.llmService.sendMessage([...]);
    return JSON.parse(response.content);
  }

  async generateNotes(analysis: TranscriptAnalysis, template: string): Promise<string> {
    // Use template to generate formatted meeting notes
  }
}
```

### 3.3 Meeting Notes Generator

**UI Flow:**
1. User uploads transcript
2. Agent analyzes it
3. Shows preview of extracted info
4. User reviews and edits
5. Generate meeting notes file
6. Optionally create Jira/Linear tasks from action items

---

## Task 4: Marketing Material Generation

### 4.1 Material Types

**Supported outputs:**
1. **Press Release** - From PRD
2. **Product Brief** - 1-pager summary
3. **Feature Announcement** - Blog post style
4. **Email Campaign** - Launch email
5. **Social Media Posts** - Twitter, LinkedIn
6. **FAQ** - Common questions about feature
7. **Sales Enablement** - Deck outline

### 4.2 Marketing Generator

**New file:** `electron/agents/generators/MarketingGenerator.ts`

```typescript
export class MarketingGenerator {
  async generatePressRelease(prd: FileContent): Promise<string> {
    const context = this.contextService.buildPromptContext();

    const prompt = `Generate a press release for this product launch:

    ${context}

    PRD:
    ${prd.content}

    Press release should:
    - Lead with the news
    - Include a quote from leadership
    - Highlight key benefits
    - Include a call to action
    - Be under 500 words`;

    const response = await this.llmService.sendMessage([...]);
    return response.content;
  }

  async generateFeatureAnnouncement(prd: FileContent, tone: 'formal' | 'casual' | 'technical'): Promise<string> {
    // Generate blog post style announcement
  }

  async generateSocialPosts(prd: FileContent, platforms: string[]): Promise<Record<string, string>> {
    // Generate platform-specific posts
    // Twitter: 280 chars
    // LinkedIn: Professional tone, longer
  }
}
```

### 4.3 Marketing Generator UI

**New file:** `src/components/marketing/MarketingGenerator.tsx`

**Interface:**
```
┌─────────────────────────────────────────┐
│ Generate Marketing Materials             │
├─────────────────────────────────────────┤
│ From PRD: Product Dashboard v2.0        │
│                                         │
│ Select materials to generate:           │
│ [x] Press Release                       │
│ [x] Product Brief                       │
│ [ ] Feature Announcement                │
│ [x] Email Campaign                      │
│ [x] Social Media Posts                  │
│ [ ] FAQ                                 │
│                                         │
│ Tone: [Casual ▼]                        │
│                                         │
│ [Generate]                              │
└─────────────────────────────────────────┘
```

**Output:** Creates folder `marketing/product-dashboard-v2/` with all generated materials

---

## Task 5: Roadmap Visualization

### 5.1 Roadmap Data Model

**New file:** `electron/services/roadmap/RoadmapSchema.ts`

```typescript
export interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  timeline: {
    start: Date;
    end: Date;
    quarter?: string; // e.g., "Q2 2024"
  };
  owner?: string;
  linkedPRD?: string; // Path to PRD
  linkedIssues?: string[]; // Jira/Linear IDs
  dependencies?: string[]; // IDs of other items
  confidence: 'high' | 'medium' | 'low';
  tags?: string[];
}

export interface Roadmap {
  id: string;
  name: string;
  description?: string;
  items: RoadmapItem[];
  timeframe: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 Roadmap Service

**New file:** `electron/services/roadmap/RoadmapService.ts`

**Features:**
- Create/update roadmaps
- Add/remove items
- Auto-populate from PRDs
- Sync with Jira/Linear milestones
- Export to various formats (PDF, PNG, JSON)

### 5.3 Roadmap Visualization

**New file:** `src/components/roadmap/RoadmapView.tsx`

**Views:**

**1. Timeline View:**
- Gantt-chart style
- Items on timeline
- Dependencies shown as arrows
- Color-coded by status

**2. Kanban View:**
- Columns: Planned, In Progress, Completed
- Drag-and-drop to change status
- Sort by priority

**3. Quarter View:**
- Group by quarter
- Show capacity/commitment
- Color-code by confidence

**Libraries:**
```bash
npm install react-beautiful-dnd @nivo/calendar
```

### 5.4 Roadmap Editor

**Features:**
- Add items (from scratch or link PRD)
- Set timelines (drag to resize)
- Add dependencies (click and drag)
- Change status
- Filter by tags, owner, priority

---

## Task 6: Advanced Search & Insights

### 6.1 Full-Text Search

**New file:** `electron/services/search/SearchService.ts`

**Dependencies:**
```bash
npm install flexsearch
```

**Features:**
- Index all files in workspace
- Search across all content
- Filter by file type, project, date
- Fuzzy matching
- Highlight matches
- Search in metadata

**Implementation:**
```typescript
import { Index } from 'flexsearch';

export class SearchService {
  private index: Index;

  async indexWorkspace(): Promise<void> {
    const files = await this.getAllFiles();

    for (const file of files) {
      const content = await this.fileService.readFile(file.path);
      this.index.add(file.path, content.content);
    }
  }

  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    const results = this.index.search(query);
    // Apply filters, rank results, return
  }
}
```

### 6.2 Search UI

**New file:** `src/components/search/SearchModal.tsx`

**Trigger:** Cmd+K or Cmd+F globally

**Interface:**
```
┌─────────────────────────────────────────┐
│ 🔍 [Search files and content...       ]│
├─────────────────────────────────────────┤
│ 📄 PRD.md                               │
│    ...users struggle with managing...  │
│    projects/dashboard-v2/PRD.md         │
│                                         │
│ 📝 user-research.md                     │
│    ...managing multiple tools is...    │
│    projects/dashboard-v2/research/...   │
│                                         │
│ Filters: [All ▼] [Any time ▼]          │
└─────────────────────────────────────────┘
```

### 6.3 Insights Dashboard

**New file:** `src/components/insights/InsightsDashboard.tsx`

**Purpose:** AI-generated insights about workspace

**Insights:**
1. **Project Health**
   - PRDs missing sections
   - Stale documents (not updated in 30 days)
   - Projects without clear timelines

2. **Content Analysis**
   - Most mentioned personas
   - Common pain points across projects
   - Frequently referenced competitors

3. **Productivity**
   - Documents created this week/month
   - Active vs. inactive projects
   - Most edited files

4. **Recommendations**
   - "Update old PRDs"
   - "Link related documents"
   - "Review incomplete projects"

---

## Task 7: Workflow Automation

### 7.1 Automation Rules

**New file:** `electron/services/automation/AutomationEngine.ts`

**Rule Schema:**
```typescript
export interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    type: 'file-created' | 'file-saved' | 'project-created' | 'schedule';
    conditions?: any;
  };
  actions: AutomationAction[];
  enabled: boolean;
}

export interface AutomationAction {
  type: 'move-file' | 'rename-file' | 'create-issues' | 'send-notification' | 'run-analysis' | 'generate-content';
  params: any;
}
```

**Examples:**
```typescript
// Auto-create Jira issues when PRD is marked as "ready"
{
  name: "Create Jira Issues from PRD",
  trigger: {
    type: 'file-saved',
    conditions: {
      fileType: 'prd',
      metadataField: 'status',
      metadataValue: 'ready'
    }
  },
  actions: [
    {
      type: 'create-issues',
      params: {
        integration: 'jira',
        issueType: 'story'
      }
    }
  ]
}

// Weekly project health check
{
  name: "Weekly Health Check",
  trigger: {
    type: 'schedule',
    schedule: '0 9 * * 1' // Every Monday 9am
  },
  actions: [
    {
      type: 'run-analysis',
      params: {
        analysisType: 'project-health'
      }
    },
    {
      type: 'send-notification',
      params: {
        message: 'Weekly project health report ready'
      }
    }
  ]
}
```

### 7.2 Automation Builder UI

**New file:** `src/components/automation/AutomationBuilder.tsx`

**Interface:** Visual rule builder
- Select trigger
- Add conditions
- Add actions
- Test rule
- Enable/disable

---

## Testing Checklist

### PRD Analysis
- [ ] Completeness check works
- [ ] Clarity analysis identifies issues
- [ ] Feasibility assessment is reasonable
- [ ] Review mode highlights issues correctly
- [ ] Can accept/dismiss suggestions

### Integrations
- [ ] Jira authentication works
- [ ] Can create Jira issues from PRD
- [ ] Linear integration syncs correctly
- [ ] GitHub repo linking works
- [ ] Integration status shows correctly

### Transcript Processing
- [ ] Can upload transcripts
- [ ] Action items are extracted accurately
- [ ] Meeting notes generation works
- [ ] Speaker identification works

### Marketing Generation
- [ ] Press releases are well-formatted
- [ ] Social posts fit platform constraints
- [ ] Tone control works
- [ ] Materials are saved correctly

### Roadmap
- [ ] Can create and edit roadmaps
- [ ] Timeline view renders correctly
- [ ] Dependencies show correctly
- [ ] Can export roadmaps

### Search
- [ ] Full-text search finds relevant results
- [ ] Filters work correctly
- [ ] Search is fast (< 200ms)
- [ ] Highlights are accurate

### Automation
- [ ] Rules trigger correctly
- [ ] Actions execute as expected
- [ ] Scheduled rules run on time
- [ ] Can disable rules

---

## Performance Considerations

1. **Search Indexing**: Index in background, don't block UI
2. **Large Workspaces**: Paginate results, lazy load
3. **Integration Sync**: Rate limit API calls
4. **LLM Usage**: Cache results where possible
5. **Roadmap Rendering**: Virtualize large roadmaps

---

## Definition of Done

- [ ] PRD analysis provides actionable feedback
- [ ] At least one PM tool integration works (Jira or Linear)
- [ ] Transcript processing generates useful notes
- [ ] Marketing material generation produces quality content
- [ ] Roadmap visualization is usable and attractive
- [ ] Search finds relevant results quickly
- [ ] Automation rules can be created and work reliably
- [ ] All features are documented
- [ ] Performance is acceptable (< 2s for most operations)
