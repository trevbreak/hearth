# Getting Started with Herth

## ✅ Installation Complete!

The Herth application is set up and ready to use.

## Running the Application

```bash
# Development mode (build and run):
npm run dev

# Or run the already-built app:
npm start
```

The app will:
1. Create a workspace at `~/Documents/Herth/`
2. Open a window with the 3-panel interface
3. Allow you to create your first project

## Development Workflow

For active development with auto-rebuild:

```bash
# Terminal 1: Watch for changes and rebuild
npm run dev:watch

# Terminal 2: Run the app (restart when you see rebuild complete)
npm start
```

## Project Status

### ✅ Working Now
- Project scaffold complete
- Electron app launches successfully
- 3-panel UI (File Tree | Editor | AI Assistant)
- File and project management services
- IPC communication layer
- TypeScript compilation
- Production builds

### 🚧 Next Steps (Phase 2)
- Implement TipTap markdown editor
- File tree interaction (click to open files)
- Auto-save functionality
- Project creation UI

## Workspace Structure

When you create a project, it will be organized like this:

```
~/Documents/Herth/
├── .herth/              # System configuration
├── personas/            # Shared persona definitions
├── research/            # Company-wide research
├── roadmap/             # Visual roadmap
└── projects/
    └── your-project/
        ├── PRD.md       # Product Requirements Document
        ├── research/    # Research notes
        ├── meetings/    # Meeting notes
        ├── designs/     # Design specs
        └── specs/       # Technical specs
```

## Troubleshooting

If the app doesn't start:
1. Rebuild: `npm run build`
2. Check Electron is installed: `npm ls electron`
3. Try reinstalling: `npm install`

## Next Features to Build

1. **Markdown Editor** - Replace placeholder with TipTap WYSIWYG editor
2. **File Operations** - Click files to open, edit, save
3. **LLM Integration** - Connect to Claude/GPT/Ollama
4. **Organization Agent** - Auto-organize files and suggest improvements

Enjoy building with Herth! 🚀
