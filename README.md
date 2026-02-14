# Herth - Product Manager Workspace

A self-hosted desktop application for Product Managers built with Electron, React, and TypeScript.

## What's New in Phase 2 (Feb 2026) ✨

- 🎨 **WYSIWYG Markdown Editor** - TipTap editor with full formatting support
- 📁 **File Navigation** - Click to open files from the sidebar
- 💾 **Auto-Save** - Automatic saving with status indicators
- ➕ **File Creation** - Create new files and folders on the fly
- ⌨️ **Keyboard Shortcuts** - CMD+S to save, plus editor shortcuts

[View Full Changelog →](change/phase-2.md)

## Features

- **Project Management**: Organize projects as folders with standard PM structure
- **Markdown Editing**: WYSIWYG editor (TipTap) for PRDs and documentation
- **AI-Powered Organization**: Agentic assistant for auto-organizing content
- **MCP Integration**: Connect to tools like Jira, Linear, Zoom, and Slack
- **Local-First**: All your data stays on your machine

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- macOS (currently optimized for Mac)

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Build and run the app
npm run dev

# Or for development with auto-rebuild on file changes:
# Terminal 1: Watch for changes
npm run dev:watch

# Terminal 2: Run the app (restart when needed)
npm start
```

### Production Build

```bash
# Build the app
npm run build

# Run the built app
npm start
```

## Project Structure

```
herth/
├── electron/          # Electron main process
│   ├── main.ts        # App entry point
│   ├── preload.ts     # IPC bridge
│   ├── services/      # File, config, project management
│   ├── ipc/           # IPC handlers
│   └── agents/        # AI agent system (future)
├── src/               # React renderer process
│   ├── components/    # UI components
│   ├── stores/        # Zustand state management
│   ├── types/         # TypeScript types
│   └── styles/        # CSS styles
├── out/               # Build output
│   ├── main/          # Built main process
│   ├── preload/       # Built preload script
│   └── renderer/      # Built React app
└── resources/         # Static assets and templates
```

## User Data Location

By default, Herth creates your workspace at:
```
~/Documents/Herth/
├── .herth/           # System config
│   ├── config.json
│   ├── user-context.md
│   └── company-context.md
├── personas/         # Global personas
├── research/         # Company-wide research
├── roadmap/          # Roadmap data
└── projects/         # Your PM projects
    └── {project-name}/
        ├── PRD.md
        ├── research/
        ├── meetings/
        ├── designs/
        └── specs/
```

## Development Roadmap

**Current Progress:** ~30% complete (2 of 6 phases done)

### ✅ Phase 1: Project Scaffold (Complete)

- Electron + React + TypeScript setup
- File management system
- Project creation with standard folders
- IPC communication layer
- 3-panel UI layout

### ✅ Phase 2: Core Features (Complete)

- TipTap WYSIWYG markdown editor with formatting toolbar
- File tree navigation with click-to-open
- Auto-save functionality (2-second debounce)
- File and folder creation
- Keyboard shortcuts (Cmd/Ctrl+S)
- Markdown round-trip conversion
- Empty states and loading indicators

### 🚧 Phase 3: LLM Integration (Next Up)

- Pluggable LLM providers (Anthropic, OpenAI, Ollama)
- Chat interface in AI Assistant panel
- Context-aware prompts for PM tasks
- Settings UI for API configuration
- Streaming responses

### 📋 Phase 4: Organization Agent (Planned)

- Auto-organize files into correct locations
- Suggest naming conventions
- Generate insights from content
- Detect missing documentation
- Project structure recommendations
- Auto-tagging and categorization

### 📋 Phase 5: Context & Templates (Planned)

- User/company context management
- Persona system
- Comprehensive template library
- Custom template creation
- Context-aware document generation
- Template variables and placeholders

### 📋 Phase 6: Analysis & Automation (Planned)

- PRD analysis and feedback system
- Integration with Jira/Linear/GitHub
- Meeting transcript processing
- Marketing material generation
- Roadmap visualization
- Full-text search and insights
- Workflow automation engine

## Tech Stack

- **Electron** - Desktop app framework
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TipTap** - WYSIWYG markdown editor
- **Zustand** - State management
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons

## Scripts

- `npm run dev` - Build and run the app
- `npm run dev:watch` - Watch mode for development
- `npm run build` - Production build
- `npm start` - Run the built app
- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint code linting

## Contributing

This is currently a personal project. Contributions, issues, and feature requests are welcome!

## License

MIT

---

Built with ❤️ for Product Managers
