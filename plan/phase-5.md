# Phase 5: Context & Templates

**Status:** Planned
**Dependencies:** Phase 4 (Complete)
**Estimated Effort:** 2-3 weeks

## Overview

Implement user/company context management and sophisticated template system to personalize the PM workspace and accelerate document creation.

## Goals

1. Manage user and company context
2. Create persona system
3. Build comprehensive PRD template library
4. Enable custom template creation
5. Implement context-aware document generation
6. Add template variables and placeholders

---

## Task 1: Context Management

### 1.1 Context Schema

**New file:** `electron/services/context/ContextSchema.ts`

**Schemas:**
```typescript
export interface UserContext {
  name: string;
  role: string; // e.g., "Senior Product Manager"
  team: string;
  timezone: string;
  preferences: {
    defaultPRDTemplate?: string;
    writingStyle?: 'concise' | 'detailed' | 'technical';
    favoriteTools?: string[];
  };
  background?: string; // Free-form background about user
}

export interface CompanyContext {
  name: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  stage: 'pre-seed' | 'seed' | 'series-a' | 'series-b+' | 'public';
  mission?: string;
  values?: string[];
  products?: {
    name: string;
    description: string;
    targetAudience: string;
  }[];
  competitors?: {
    name: string;
    notes?: string;
  }[];
  stakeholders?: {
    name: string;
    role: string;
    department: string;
  }[];
}
```

### 1.2 Context Service

**New file:** `electron/services/context/ContextService.ts`

**Purpose:** Manage and persist context

```typescript
export class ContextService {
  private userContext: UserContext | null = null;
  private companyContext: CompanyContext | null = null;

  constructor(private configManager: ConfigManager) {}

  async initialize(): Promise<void> {
    const workspacePath = this.configManager.getWorkspacePath();
    const herthDir = join(workspacePath, '.herth');

    // Load user context
    try {
      const userContextPath = join(herthDir, 'user-context.json');
      this.userContext = JSON.parse(await fs.readFile(userContextPath, 'utf-8'));
    } catch {
      this.userContext = this.getDefaultUserContext();
    }

    // Load company context
    try {
      const companyContextPath = join(herthDir, 'company-context.json');
      this.companyContext = JSON.parse(await fs.readFile(companyContextPath, 'utf-8'));
    } catch {
      this.companyContext = this.getDefaultCompanyContext();
    }
  }

  async updateUserContext(updates: Partial<UserContext>): Promise<void> {
    this.userContext = { ...this.userContext!, ...updates };
    await this.save();
  }

  async updateCompanyContext(updates: Partial<CompanyContext>): Promise<void> {
    this.companyContext = { ...this.companyContext!, ...updates };
    await this.save();
  }

  getUserContext(): UserContext {
    return this.userContext!;
  }

  getCompanyContext(): CompanyContext {
    return this.companyContext!;
  }

  // Build prompt context for LLM
  buildPromptContext(): string {
    const user = this.userContext!;
    const company = this.companyContext!;

    return `User Context:
    - Name: ${user.name}
    - Role: ${user.role}
    - Team: ${user.team}

    Company Context:
    - Company: ${company.name}
    - Industry: ${company.industry}
    - Stage: ${company.stage}
    - Mission: ${company.mission || 'N/A'}`;
  }

  private async save(): Promise<void> {
    const workspacePath = this.configManager.getWorkspacePath();
    const herthDir = join(workspacePath, '.herth');

    await fs.writeFile(
      join(herthDir, 'user-context.json'),
      JSON.stringify(this.userContext, null, 2)
    );
    await fs.writeFile(
      join(herthDir, 'company-context.json'),
      JSON.stringify(this.companyContext, null, 2)
    );
  }
}
```

### 1.3 Context Setup Wizard

**New file:** `src/components/onboarding/ContextWizard.tsx`

**Purpose:** First-run wizard to collect context

**Steps:**
1. **Welcome** - Explain what Herth does
2. **User Info** - Name, role, team
3. **Company Info** - Name, industry, stage
4. **Products** - Add main products
5. **Complete** - Show workspace location, next steps

**Design:**
- Multi-step form
- Progress indicator
- Skip option for each step
- Save and continue later

### 1.4 Context Editor UI

**New file:** `src/components/settings/ContextSettings.tsx`

**Add to Settings Modal:**

**User Context Tab:**
- Personal info fields
- Writing style selector
- Background textarea
- Favorite tools multi-select

**Company Context Tab:**
- Company info fields
- Products list (add/edit/delete)
- Competitors list
- Stakeholders list

**Design:**
- Forms with sections
- Add/remove buttons for lists
- Save button with validation
- Export context to JSON (backup)

### 1.5 IPC Handlers for Context

**New file:** `electron/ipc/contextHandlers.ts`

```typescript
export function registerContextHandlers(contextService: ContextService) {
  ipcMain.handle('context:get-user', async () => {
    return contextService.getUserContext();
  });

  ipcMain.handle('context:get-company', async () => {
    return contextService.getCompanyContext();
  });

  ipcMain.handle('context:update-user', async (_, updates: Partial<UserContext>) => {
    await contextService.updateUserContext(updates);
  });

  ipcMain.handle('context:update-company', async (_, updates: Partial<CompanyContext>) => {
    await contextService.updateCompanyContext(updates);
  });

  ipcMain.handle('context:get-prompt-context', async () => {
    return contextService.buildPromptContext();
  });
}
```

---

## Task 2: Persona System

### 2.1 Persona Schema

**New file:** `electron/services/personas/PersonaSchema.ts`

```typescript
export interface Persona {
  id: string;
  name: string;
  role?: string;
  demographics?: {
    age?: string;
    location?: string;
    education?: string;
    income?: string;
  };
  goals: string[];
  painPoints: string[];
  behaviors?: string[];
  motivations?: string[];
  techSavviness?: 'low' | 'medium' | 'high';
  notes?: string;
  photo?: string; // Path to image or URL
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 Persona Service

**New file:** `electron/services/personas/PersonaService.ts`

```typescript
export class PersonaService {
  private personas: Map<string, Persona> = new Map();

  constructor(private configManager: ConfigManager) {}

  async initialize(): Promise<void> {
    const workspacePath = this.configManager.getWorkspacePath();
    const personasDir = join(workspacePath, 'personas');

    await fs.mkdir(personasDir, { recursive: true });

    // Load all persona files
    const files = await fs.readdir(personasDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const persona = JSON.parse(
          await fs.readFile(join(personasDir, file), 'utf-8')
        );
        this.personas.set(persona.id, persona);
      }
    }
  }

  async createPersona(persona: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>): Promise<Persona> {
    const newPersona: Persona = {
      ...persona,
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.personas.set(newPersona.id, newPersona);
    await this.save(newPersona);
    return newPersona;
  }

  async updatePersona(id: string, updates: Partial<Persona>): Promise<Persona> {
    const persona = this.personas.get(id);
    if (!persona) throw new Error('Persona not found');

    const updated = {
      ...persona,
      ...updates,
      updatedAt: new Date()
    };

    this.personas.set(id, updated);
    await this.save(updated);
    return updated;
  }

  async deletePersona(id: string): Promise<void> {
    const persona = this.personas.get(id);
    if (!persona) return;

    const workspacePath = this.configManager.getWorkspacePath();
    await fs.unlink(join(workspacePath, 'personas', `${id}.json`));
    this.personas.delete(id);
  }

  listPersonas(): Persona[] {
    return Array.from(this.personas.values());
  }

  getPersona(id: string): Persona | undefined {
    return this.personas.get(id);
  }

  // Generate persona summary for LLM context
  getPersonaSummary(id: string): string {
    const persona = this.personas.get(id);
    if (!persona) return '';

    return `Persona: ${persona.name}
    Role: ${persona.role || 'N/A'}
    Goals: ${persona.goals.join(', ')}
    Pain Points: ${persona.painPoints.join(', ')}`;
  }

  private async save(persona: Persona): Promise<void> {
    const workspacePath = this.configManager.getWorkspacePath();
    const filePath = join(workspacePath, 'personas', `${persona.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(persona, null, 2));
  }
}
```

### 2.3 Persona Manager UI

**New file:** `src/components/personas/PersonaManager.tsx`

**Purpose:** CRUD interface for personas

**Features:**
- List all personas (card view)
- Create new persona (form modal)
- Edit persona
- Delete persona (with confirmation)
- Search/filter personas
- Export personas to markdown/JSON

**Card Design:**
```
┌────────────────────────────────┐
│ [Photo]  Sarah Chen            │
│          Product Designer      │
│                                │
│ Goals: Streamline workflow     │
│ Pains: Too many tools          │
│                                │
│ [Edit] [Delete] [View Full]    │
└────────────────────────────────┘
```

### 2.4 Persona Form

**New file:** `src/components/personas/PersonaForm.tsx`

**Sections:**
1. Basic Info (name, role, photo upload)
2. Demographics (optional)
3. Goals (list with add/remove)
4. Pain Points (list with add/remove)
5. Behaviors (optional list)
6. Notes (textarea)

**Features:**
- Add/remove list items dynamically
- Photo upload (stored in workspace)
- Form validation
- Save draft

### 2.5 Persona Integration in PRDs

**Feature:** Link personas to PRDs

**Implementation:**
- Add `personas: string[]` to PRD frontmatter
- Persona selector in PRD editor
- Show linked personas in sidebar
- Include persona context when analyzing PRD

---

## Task 3: Template System

### 3.1 Template Schema

**New file:** `electron/services/templates/TemplateSchema.ts`

```typescript
export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'prd' | 'research' | 'meeting' | 'spec' | 'design' | 'other';
  content: string; // Template content with variables
  variables: TemplateVariable[];
  metadata?: {
    author?: string;
    version?: string;
    tags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  isBuiltIn: boolean; // Can't be deleted if true
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'persona';
  required: boolean;
  defaultValue?: any;
  options?: string[]; // For select/multiselect
  placeholder?: string;
  helpText?: string;
}
```

### 3.2 Template Service

**New file:** `electron/services/templates/TemplateService.ts`

```typescript
export class TemplateService {
  private templates: Map<string, Template> = new Map();

  constructor(
    private configManager: ConfigManager,
    private contextService: ContextService,
    private personaService: PersonaService
  ) {}

  async initialize(): Promise<void> {
    // Load built-in templates
    await this.loadBuiltInTemplates();

    // Load custom templates from workspace
    await this.loadCustomTemplates();
  }

  async renderTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    let content = template.content;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    }

    // Replace context variables
    const userContext = this.contextService.getUserContext();
    const companyContext = this.contextService.getCompanyContext();

    content = content.replace(/{{user\.name}}/g, userContext.name);
    content = content.replace(/{{user\.role}}/g, userContext.role);
    content = content.replace(/{{company\.name}}/g, companyContext.name);
    content = content.replace(/{{date}}/g, new Date().toISOString().split('T')[0]);

    // Replace persona variables
    const personaMatches = content.match(/{{persona\.([^}]+)\.([^}]+)}}/g);
    if (personaMatches) {
      for (const match of personaMatches) {
        const [_, personaId, field] = match.match(/{{persona\.([^}]+)\.([^}]+)}}/)!;
        const persona = this.personaService.getPersona(personaId);
        if (persona) {
          content = content.replace(match, (persona as any)[field] || '');
        }
      }
    }

    return content;
  }

  private async loadBuiltInTemplates(): Promise<void> {
    // Load from resources/templates/
    const templatesDir = join(__dirname, '../../resources/templates');
    // ... load JSON template definitions
  }

  private async loadCustomTemplates(): Promise<void> {
    const workspacePath = this.configManager.getWorkspacePath();
    const templatesDir = join(workspacePath, '.herth', 'templates');
    // ... load user-created templates
  }
}
```

### 3.3 Built-in Templates

**Directory:** `resources/templates/`

**Templates to include:**

1. **Standard PRD** (`standard-prd.json`)
2. **One-Pager PRD** (`one-pager.json`)
3. **Feature Spec** (`feature-spec.json`)
4. **User Research Plan** (`research-plan.json`)
5. **Interview Guide** (`interview-guide.json`)
6. **Meeting Notes** (`meeting-notes.json`)
7. **Design Brief** (`design-brief.json`)
8. **Go-to-Market Plan** (`gtm-plan.json`)
9. **Sprint Planning** (`sprint-planning.json`)
10. **Retrospective** (`retrospective.json`)

**Example:** `standard-prd.json`
```json
{
  "id": "standard-prd",
  "name": "Standard PRD",
  "description": "Comprehensive Product Requirements Document template",
  "category": "prd",
  "variables": [
    {
      "name": "productName",
      "label": "Product/Feature Name",
      "type": "text",
      "required": true,
      "placeholder": "e.g., User Dashboard v2.0"
    },
    {
      "name": "targetPersonas",
      "label": "Target Personas",
      "type": "persona",
      "required": false
    },
    {
      "name": "launchDate",
      "label": "Target Launch Date",
      "type": "date",
      "required": false
    }
  ],
  "content": "---\ntitle: {{productName}}\ntype: prd\nstatus: draft\nauthor: {{user.name}}\ndate: {{date}}\npersonas: {{targetPersonas}}\n---\n\n# {{productName}}\n\n## Executive Summary\n\n*One paragraph overview of what this is and why it matters.*\n\n## Problem Statement\n\n### Current State\n\n*What's the problem we're solving?*\n\n### Impact\n\n*Who does this affect and how?*\n\n## Goals & Success Metrics\n\n### Primary Goals\n\n1. \n2. \n3. \n\n### Success Metrics\n\n- **Metric 1**: [Target]\n- **Metric 2**: [Target]\n\n## Users & Personas\n\n{{#each targetPersonas}}\n### {{name}}\n\n- **Goals**: {{goals}}\n- **Pain Points**: {{painPoints}}\n{{/each}}\n\n## Solution Overview\n\n*High-level description of the solution*\n\n## Requirements\n\n### Must Have (P0)\n\n1. \n\n### Should Have (P1)\n\n1. \n\n### Nice to Have (P2)\n\n1. \n\n## User Stories\n\n- As a [persona], I want to [action] so that [benefit]\n\n## Out of Scope\n\n*What are we explicitly NOT doing?*\n\n## Timeline\n\n{{#if launchDate}}\n- **Target Launch**: {{launchDate}}\n{{/if}}\n\n- **Discovery**: \n- **Design**: \n- **Development**: \n- **Testing**: \n- **Launch**: \n\n## Dependencies & Risks\n\n### Dependencies\n\n- \n\n### Risks\n\n| Risk | Impact | Mitigation |\n|------|--------|------------|\n|      |        |            |\n\n## Open Questions\n\n1. \n\n## Appendix\n\n### Related Documents\n\n- \n\n### Research\n\n- ",
  "isBuiltIn": true
}
```

### 3.4 Template Selector UI

**New file:** `src/components/templates/TemplateSelector.tsx`

**Purpose:** Choose template when creating new file

**Trigger:** Click "New File" button

**Design:**
```
┌─────────────────────────────────────────┐
│ Choose a Template                       │
├─────────────────────────────────────────┤
│ Search: [____________]                  │
│                                         │
│ PRDs                                    │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│ │Standard │ │One-Pager│ │ Feature │  │
│ │   PRD   │ │   PRD   │ │  Spec   │  │
│ └─────────┘ └─────────┘ └─────────┘  │
│                                         │
│ Research                                │
│ ┌─────────┐ ┌─────────┐               │
│ │Research │ │Interview│               │
│ │  Plan   │ │  Guide  │               │
│ └─────────┘ └─────────┘               │
│                                         │
│ [Blank Document] [Cancel]               │
└─────────────────────────────────────────┘
```

### 3.5 Template Variable Form

**New file:** `src/components/templates/TemplateForm.tsx`

**Purpose:** Collect template variables before rendering

**Flow:**
1. User selects template
2. Form appears with variables
3. User fills in values
4. Template is rendered and file created

**Dynamic form:** Generate inputs based on variable definitions

### 3.6 Custom Template Creator

**New file:** `src/components/templates/TemplateCreator.tsx`

**Purpose:** Allow users to create custom templates

**Features:**
- Template editor (markdown with variable placeholders)
- Variable definitions (add/edit/remove)
- Preview with sample data
- Save to workspace
- Duplicate existing template to customize

---

## Task 4: Context-Aware Generation

### 4.1 Smart Defaults

**Feature:** Pre-fill template variables from context

**Examples:**
- Author name from user context
- Company name from company context
- Linked personas from project
- Related documents from project

### 4.2 LLM-Enhanced Templates

**Feature:** Use LLM to help fill in templates

**Examples:**
1. **Generate Problem Statement**: User provides brief description, LLM expands it
2. **Suggest Success Metrics**: Based on goals, LLM suggests metrics
3. **Create User Stories**: From requirements, LLM generates user stories
4. **Draft Timeline**: Based on scope, LLM suggests timeline

**UI:** "AI Assist" button next to each section

---

## Testing Checklist

### Context Management
- [ ] Can save and load user context
- [ ] Can save and load company context
- [ ] Context wizard works for new users
- [ ] Context appears in Settings UI
- [ ] Context is injected into LLM prompts

### Persona System
- [ ] Can create personas
- [ ] Can edit personas
- [ ] Can delete personas
- [ ] Personas save to workspace
- [ ] Can link personas to PRDs
- [ ] Persona context appears in PRD analysis

### Template System
- [ ] Built-in templates load correctly
- [ ] Can render templates with variables
- [ ] Template selector shows all templates
- [ ] Variable form collects values
- [ ] Context variables are replaced
- [ ] Persona variables work
- [ ] Can create custom templates
- [ ] Custom templates persist

---

## Definition of Done

- [ ] User and company context can be managed
- [ ] Persona system is fully functional
- [ ] All built-in templates are included
- [ ] Template rendering works with variables
- [ ] Can create custom templates
- [ ] Context is used in LLM prompts
- [ ] Documentation covers context and template usage
