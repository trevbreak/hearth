# Herth Strategic Analysis: Platform Architecture Decision

**Date:** February 14, 2026
**Status:** Strategic Review
**Decision Required:** Choose foundational platform architecture

---

## Executive Summary

This analysis evaluates five architectural approaches for Herth, a Product Manager workspace with AI capabilities. The critical insight is that **the core functionality you're building (file management + AI assistance) is now natively available in VS Code via the Claude Code extension**, which raises the question: should you continue building a bespoke app or leverage existing platforms?

**Recommendation Preview:** Build as a **VS Code Extension** (Option 3) with potential migration to Eclipse Theia (Option 4) if customization needs exceed VS Code's capabilities.

---

## Current State Assessment

### What You've Built (Phases 1-2)
- ✅ Basic Electron app with React + TypeScript
- ✅ File/directory operations and project management
- ✅ TipTap markdown editor with auto-save
- ✅ Three-panel UI layout
- ✅ IPC communication layer
- 📊 **Progress:** ~30% complete (2 of 6 phases)
- 📊 **Investment:** ~2 weeks of development

### What's Planned (Phases 3-6)
- 🔮 LLM integration (Anthropic, OpenAI, Ollama)
- 🔮 AI organization agent
- 🔮 Context management and templates
- 🔮 Analysis, integrations, automation
- 📊 **Estimated Remaining:** 13-19 weeks (3-5 months)

### Key Overlap with Claude Code Extension
The Claude Code extension for VS Code already provides:
- ✅ Multi-LLM support (Claude, GPT, custom agents)
- ✅ Context-aware file analysis
- ✅ Autonomous code/content editing
- ✅ Multi-agent workflows
- ✅ Integrated file management
- ✅ Conversation history and checkpoints

**This represents ~40-50% of your planned functionality.**

---

## Option 1: Continue with Bespoke Electron App

### Overview
Continue current approach: standalone Electron application with custom UI and features.

### Pros
- ✅ **Complete control** - Full freedom over UX, features, branding
- ✅ **No platform constraints** - Build exactly what you envision
- ✅ **Sunk cost preservation** - Leverage existing 2 weeks of work
- ✅ **Self-contained** - Users don't need VS Code installed
- ✅ **Simplified UX** - Can streamline specifically for PM workflows
- ✅ **Native feel** - Can optimize for desktop experience

### Cons
- ❌ **Reinventing the wheel** - Building file management, editor, etc. from scratch
- ❌ **Large scope** - 13-19 weeks of remaining work
- ❌ **Maintenance burden** - Own all bugs, updates, platform compatibility
- ❌ **Extension ecosystem** - Must build all integrations yourself (Jira, Linear, etc.)
- ❌ **Performance overhead** - Electron is heavy (~250MB currently, will grow)
- ❌ **No existing user base** - Starting from zero users
- ❌ **Duplicate effort** - Many features already exist in VS Code ecosystem

### Technical Feasibility
🟢 **High** - Proven approach, you're already making progress

### Development Effort
🔴 **High** - 3-5 months remaining, ongoing maintenance

### Long-term Maintenance
🔴 **High** - Full ownership of codebase, platform updates, security

### Best For
- If you need features impossible in VS Code extensions
- If you want a standalone product brand
- If PM users would never use VS Code

---

## Option 2: Fork VS Code

### Overview
Fork the VS Code codebase and customize it for PM workflows, similar to Cursor, Windsurf, or Codeium.

### Pros
- ✅ **Best of both worlds** - Full customization + proven foundation
- ✅ **Rich editor** - World-class editor and file management included
- ✅ **Large feature set** - Git, search, terminals, themes all built-in
- ✅ **TypeScript codebase** - Familiar stack (already using TS)
- ✅ **Can deeply integrate AI** - Modify core architecture for PM-specific flows

### Cons
- ❌ **No Microsoft Marketplace access** - [Cannot use official VS Code extension marketplace](https://eclipsesource.com/blogs/2024/12/17/is-it-a-good-idea-to-fork-vs-code/)
- ❌ **Must use Open VSX** - Limited extension ecosystem (subset of official marketplace)
- ❌ **Massive codebase** - VS Code is complex; steep learning curve
- ❌ **Merge conflicts** - Staying current with upstream changes is painful
- ❌ **Still Electron** - Same performance limitations as Option 1
- ❌ **Maintenance nightmare** - [Hidden costs of maintenance often outweigh benefits](https://blog.curiousbox.ai/p/the-fork-in-the-road-why-vs-code)
- ❌ **Proprietary extension restrictions** - Microsoft's C++ extension [no longer works in forks](https://www.xda-developers.com/vs-code-forks-built-for-specific-tasks/)
- ❌ **Brand confusion** - Users expect "VS Code" but get something different

### Technical Feasibility
🟡 **Medium** - Complex codebase, requires deep VS Code expertise

### Development Effort
🔴 **Very High** - Initial fork setup (2-3 weeks), then ongoing merge conflicts

### Long-term Maintenance
🔴 **Very High** - Must track upstream, resolve conflicts, maintain custom changes

### Best For
- If you need to modify VS Code's core architecture
- If you're building a venture-backed IDE company (like Cursor)
- If Open VSX's limited extensions are sufficient

### Notable Forks in the Wild
- **Cursor** - AI-first code editor
- **Windsurf (Codeium)** - AI coding assistant
- **VSCodium** - De-Microsoft'd VS Code
- **Code-Server** - Browser-based VS Code

**Trend:** Most successful AI coding tools (Cursor, Windsurf) started as forks but face ongoing maintenance challenges.

---

## Option 3: Build as VS Code Extension ⭐ RECOMMENDED

### Overview
Build Herth as a VS Code extension that adds PM-specific features to the existing editor, leveraging Claude Code extension as a foundation.

### Pros
- ✅ **Instant user base** - Tap into 20M+ VS Code users
- ✅ **80% already done** - Editor, file management, Git, search, etc. included
- ✅ **Full extension ecosystem** - Access to [3000+ extensions](https://theia-ide.org/docs/)
- ✅ **Claude Code integration** - [Work alongside existing AI features](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development)
- ✅ **Low maintenance** - Microsoft maintains the platform
- ✅ **Fast development** - [2-4 weeks instead of 3-5 months](https://abdulkadersafi.com/blog/building-vs-code-extensions-in-2026-the-complete-modern-guide)
- ✅ **Webview API** - [Can build rich custom UIs](https://code.visualstudio.com/api/extension-guides/webview)
- ✅ **PM-specific focus** - Spend time on PM features, not infrastructure
- ✅ **Easier distribution** - VS Code Marketplace handles updates
- ✅ **Professional appearance** - Users already trust VS Code

### Cons
- ❌ **Platform limitations** - [Cannot access VS Code's DOM](https://code.visualstudio.com/api/extension-capabilities/overview)
- ❌ **API constraints** - Bound by [VS Code Extension API](https://code.visualstudio.com/api/references/vscode-api)
- ❌ **Must run in VS Code** - Requires VS Code installation
- ❌ **Less brand identity** - "Just another VS Code extension"
- ❌ **Sandboxed** - [Limited access to system resources](https://code.visualstudio.com/api/extension-guides/web-extensions)
- ❌ **Webview isolation** - [Custom UIs run in isolated context](https://code.visualstudio.com/api/extension-guides/webview)

### Technical Feasibility
🟢 **High** - [Well-documented API, large community, proven patterns](https://code.visualstudio.com/api)

### Development Effort
🟢 **Low-Medium** - 2-4 weeks for MVP, can iterate quickly

### Long-term Maintenance
🟢 **Low** - Microsoft handles platform, you handle extension logic

### Implementation Approach

#### Phase 1: Core Extension (1 week)
- Create workspace view with PM folder structure
- Add "Create Project" command
- Integrate with file explorer
- Custom sidebar for PM tools

#### Phase 2: PM Templates & Tools (1 week)
- PRD templates with snippets
- Quick actions palette for PM tasks
- Document generators (user stories, acceptance criteria)

#### Phase 3: AI Integration (1 week)
- Leverage Claude Code extension API
- Add PM-specific prompts and context
- Quick actions: "Review PRD", "Generate user stories", etc.
- Context injection from project structure

#### Phase 4: Advanced Features (1 week)
- Jira/Linear integration via MCP
- Meeting notes parser
- Roadmap visualization in webview
- Document insights panel

**Total: ~4 weeks** (vs. 13-19 weeks for bespoke app)

### What You Can Build

VS Code extensions can:
- ✅ **Custom sidebars** - PM-specific file organization views
- ✅ **Webview panels** - Rich UI for roadmaps, insights, dashboards
- ✅ **Commands & shortcuts** - PM workflow automation
- ✅ **File templates** - PRD, spec, research templates
- ✅ **Status bar items** - Quick access to PM tools
- ✅ **Tree views** - Custom project explorers
- ✅ **Integrated terminals** - Run PM-specific scripts
- ✅ **Settings UI** - Configure LLM providers, integrations
- ✅ **Decorations** - Highlight important sections in docs
- ✅ **Hover providers** - Show context on hover

### What You Cannot Build
- ❌ Deeply modify VS Code's core UI
- ❌ Replace the title bar or main menu
- ❌ Access internal VS Code state
- ❌ Run without VS Code installed

### Best For
- ✅ **Your use case** - PM workspace with AI integration
- ✅ **Rapid iteration** - Ship in weeks, not months
- ✅ **Professional users** - PMs likely already use VS Code for docs
- ✅ **Leveraging existing tools** - Build on Claude Code foundation

---

## Option 4: Build on Eclipse Theia Framework

### Overview
Use [Eclipse Theia](https://theia-ide.org/) as a framework to build a custom IDE specifically for PMs, with full control over UI while reusing proven components.

### Pros
- ✅ **Modular architecture** - [Pick only the components you need](https://theia-ide.org/docs/composing_applications/)
- ✅ **VS Code extension compatible** - [Access to 3000+ extensions via Open VSX](https://theia-ide.org/docs/)
- ✅ **No forking required** - [Build custom IDEs without forking](https://github.com/eclipse-theia/theia)
- ✅ **Full UI control** - Can redesign entire interface for PM workflows
- ✅ **Cloud & desktop** - Deploy as desktop app or web app
- ✅ **Production-ready** - [Used by Arduino IDE 2.0, Arm Mbed Studio, TI Code Composer](https://projects.eclipse.org/projects/ecd.theia)
- ✅ **AI framework** - [Built-in Theia AI framework for AI integration](https://theia-ide.org/docs/)
- ✅ **Open source** - Full control, no licensing restrictions
- ✅ **Professional backing** - Eclipse Foundation support

### Cons
- ❌ **Still Electron** - Same performance constraints as Option 1
- ❌ **Complex setup** - [Steeper learning curve than VS Code extension](https://dzone.com/articles/theia-deep-dive-build-your-own-ide)
- ❌ **Smaller community** - Less resources than VS Code
- ❌ **More development effort** - 4-6 weeks for MVP vs. 2-4 for extension
- ❌ **Distribution complexity** - Must handle your own updates, installers
- ❌ **Open VSX only** - Cannot use Microsoft's extension marketplace

### Technical Feasibility
🟡 **Medium** - [Well-documented but requires learning Theia architecture](https://theia-ide.org/docs/)

### Development Effort
🟡 **Medium** - 4-6 weeks for MVP, more flexibility than extension

### Long-term Maintenance
🟡 **Medium** - Less than fork, more than extension

### Best For
- If VS Code extension is too limiting
- If you need full UI customization but want proven components
- If you're building a specialized tool (like Arduino IDE)
- If you want both desktop and web deployment

### Migration Path
Theia could be a "Plan B" if you start with VS Code extension and later need more customization. Many Theia concepts align with VS Code.

---

## Option 5: Native Alternatives (Tauri / Rust-based)

### Overview
Build with modern, lightweight frameworks like [Tauri](https://tauri.app/) (instead of Electron) or use native Rust editors like [Zed](https://zed.dev/) or [Lapce](https://lapce.dev/) as a base.

### Pros
- ✅ **Performance** - [Tauri apps as small as 600KB vs 250MB+ Electron](https://github.com/sudhakar3697/awesome-electron-alternatives)
- ✅ **Resource efficient** - [Zed uses GPU acceleration, multi-core CPUs](https://blog.logrocket.com/native-alternatives-vscode/)
- ✅ **Modern architecture** - Rust backend, web frontend
- ✅ **Security** - Better sandboxing than Electron
- ✅ **Fast development** - [Tauri similar dev experience to Electron](https://raftlabs.medium.com/tauri-vs-electron-a-practical-guide-to-picking-the-right-framework-5df80e360f26)

### Cons
- ❌ **Requires Rust knowledge** - Different skill set from your current TS stack
- ❌ **Less mature** - Smaller ecosystem than Electron
- ❌ **No editor foundation** - Would still need to build file management, editing, etc.
- ❌ **Longer timeline** - Learning curve + development
- ❌ **Zed/Lapce are young** - Not as proven as VS Code for extensions

### Technical Feasibility
🟡 **Medium** - Tauri is approachable; native editors require Rust expertise

### Development Effort
🔴 **High** - 2-3 weeks learning + 8-12 weeks building

### Long-term Maintenance
🟡 **Medium** - Better performance, but you own the whole stack

### Best For
- If performance is critical (not typical for PM tool)
- If you're already comfortable with Rust
- If you want smallest possible app size

**Verdict:** Performance benefits don't justify the learning curve for a PM productivity tool.

---

## Comparative Analysis

| Factor | Bespoke Electron | VS Code Fork | VS Code Extension ⭐ | Eclipse Theia | Tauri/Native |
|--------|------------------|--------------|---------------------|---------------|--------------|
| **Development Time** | 3-5 months | 4-6 months | 2-4 weeks | 4-6 weeks | 3-4 months |
| **Initial Complexity** | Medium | Very High | Low | Medium | High |
| **Long-term Maintenance** | High | Very High | Low | Medium | Medium |
| **Feature Control** | Complete | Complete | Limited | High | Complete |
| **Performance** | Poor (Electron) | Poor (Electron) | Good (native VS Code) | Poor (Electron) | Excellent |
| **Extension Ecosystem** | None | Open VSX | Full Marketplace | Open VSX | Minimal |
| **Distribution** | Self-hosted | Self-hosted | VS Code Marketplace | Self-hosted | Self-hosted |
| **User Base Access** | 0 (cold start) | 0 (cold start) | 20M+ existing | 0 (cold start) | 0 (cold start) |
| **AI Integration** | Build from scratch | Build from scratch | Use Claude Code | Use Theia AI | Build from scratch |
| **PM-Specific Focus** | 100% | 100% | 100% | 100% | 100% |
| **Technical Risk** | Low | Medium | Very Low | Low | Medium |
| **Market Fit** | Unknown | Unknown | Proven (PMs use VS Code) | Unknown | Unknown |

---

## Recommendation: Build as VS Code Extension

### Why This Is The Right Choice

#### 1. **Time to Market**
- **4 weeks to MVP** vs. 13-19 weeks for bespoke app
- Ship in March 2026 instead of May-June 2026
- Faster user feedback and iteration

#### 2. **Leverage Existing Work**
- Claude Code extension already provides ~40% of your planned functionality
- VS Code handles file management, editor, Git, search, etc.
- Focus on **PM-specific features** instead of infrastructure

#### 3. **User Adoption**
- **20M+ VS Code users** already installed
- PMs are increasingly technical and likely use VS Code
- Lower barrier to adoption (just install extension vs. new app)

#### 4. **Technical Validation**
- Your CLAUDE.md workflow already works in VS Code with Claude Code
- Similar project (Claude Code) proves viability
- Well-documented APIs and patterns

#### 5. **Economic Efficiency**
- **85% cost reduction** (4 weeks vs. 19 weeks)
- No ongoing infrastructure maintenance
- Microsoft handles platform updates, security

#### 6. **Strategic Flexibility**
- Start as extension, migrate to Theia later if needed
- Can always build standalone app if extension proves limiting
- Many extensions later become standalone products (e.g., GitHub Desktop started as Git integration)

### What This Means for Your Roadmap

#### Salvage from Current Work
- ✅ **TypeScript patterns** - Reusable in extension
- ✅ **LLM provider interfaces** - Can port to extension
- ✅ **PM templates and prompts** - Directly usable
- ✅ **File structure knowledge** - Informs extension design
- ❌ **Electron setup** - Not needed
- ❌ **Custom editor** - VS Code provides this
- ❌ **IPC layer** - Extension API replaces this

**Estimated Salvage:** ~40% of code/concepts reusable

#### New Roadmap (Extension-Based)

**Phase 1: Core Extension (1 week)**
- Create PM workspace extension
- Custom sidebar with project structure
- File templates (PRD, specs, research)
- Basic commands and snippets

**Phase 2: AI Integration (1 week)**
- Integrate with Claude Code extension
- PM-specific prompt library
- Context injection from project files
- Quick actions panel

**Phase 3: PM Tools (1 week)**
- Jira/Linear integration via MCP
- Meeting notes parser
- Document insights panel
- Roadmap visualization (webview)

**Phase 4: Advanced Features (1 week)**
- Auto-organization agent
- Template system
- User/company context management
- Analytics dashboard

**Total: 4 weeks to full-featured extension**

### Migration Strategy

#### Week 1: Setup & Core
1. Initialize VS Code extension project
2. Set up TypeScript build pipeline
3. Create sidebar view for PM workspace
4. Port file templates and structure logic
5. Add "Create PM Project" command

#### Week 2: AI Integration
1. Study Claude Code extension API
2. Build PM prompt library
3. Create context injection system
4. Add quick actions palette
5. Test multi-file context handling

#### Week 3: PM-Specific Tools
1. Build Jira/Linear MCP integration
2. Create meeting notes parser
3. Develop document insights panel
4. Add roadmap webview
5. Implement file organization suggestions

#### Week 4: Polish & Launch
1. Add settings UI
2. Create onboarding experience
3. Write documentation
4. Package for VS Code Marketplace
5. Beta test with PM users
6. Public launch

### When to Reconsider

You should revisit this decision if:

1. **Extension APIs prove insufficient** - If you can't build a key feature due to VS Code limitations
2. **Performance becomes critical** - If PM tools need sub-millisecond latency (unlikely)
3. **Brand/standalone value** - If you pivot to a venture-backed product company
4. **User backlash** - If PMs reject "just an extension" (test this hypothesis first)

**Recommendation:** Start with extension. If you hit real limitations (not hypothetical ones), migrate to Eclipse Theia (Option 4).

---

## Alternative Perspective: Why You Might Choose Differently

### Choose Bespoke Electron If:
- You're building a product company, not a tool
- You need features impossible in VS Code
- You want complete brand control
- You have 3-5 months available

### Choose VS Code Fork If:
- You need to modify VS Code's core architecture
- You're funded and hiring a team
- You're building a venture-scale AI coding tool
- You can handle ongoing merge conflicts

### Choose Eclipse Theia If:
- VS Code extension proves too limiting (try it first)
- You need cloud + desktop deployment
- You want full UI control with proven components
- You have 4-6 weeks and want flexibility

### Choose Tauri/Native If:
- Performance is critical (it's not for PM tools)
- You're comfortable with Rust
- You need tiny app size
- You have 3-4 months

---

## Final Recommendation Summary

**Start with Option 3: VS Code Extension**

### Rationale
1. ⚡ **85% faster to market** (4 weeks vs. 19 weeks)
2. 💰 **85% lower development cost**
3. 🎯 **Focus on PM features**, not infrastructure
4. 👥 **Instant access to 20M users**
5. 🔌 **Leverage Claude Code** foundation
6. 🛡️ **Low technical risk** - proven patterns
7. 🔄 **Reversible decision** - can migrate to Theia later
8. ✅ **Aligns with your insight** - the functionality exists in VS Code

### Success Metrics (4 weeks)
- ✅ Extension published to VS Code Marketplace
- ✅ PM project templates working
- ✅ AI integration with Claude Code
- ✅ 10 beta users providing feedback
- ✅ Core PM workflows automated

### Pivot Triggers (when to reconsider)
- ⚠️ Can't build key feature due to API limits
- ⚠️ User feedback demands standalone app
- ⚠️ Performance issues in VS Code
- ⚠️ Strategic shift to product company

### Next Steps
1. **This week:** Prototype core extension structure
2. **Next week:** Validate with 3-5 PM users
3. **Week 3-4:** Build and refine based on feedback
4. **Week 5:** Public beta launch
5. **Week 6+:** Iterate based on usage data

---

## Appendix: Additional Research

### VS Code Extension Ecosystem (2026)
- [Claude Code Extension Documentation](https://code.claude.com/docs/en/vs-code)
- [VS Code Multi-Agent Development](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development)
- [Building VS Code Extensions in 2026](https://abdulkadersafi.com/blog/building-vs-code-extensions-in-2026-the-complete-modern-guide)
- [VS Code Extension API Reference](https://code.visualstudio.com/api/references/vscode-api)

### VS Code Fork Analysis
- [Is Forking VS Code a Good Idea?](https://eclipsesource.com/blogs/2024/12/17/is-it-a-good-idea-to-fork-vs-code/)
- [Why Extensions Beat Forks for AI Development](https://blog.curiousbox.ai/p/the-fork-in-the-road-why-vs-code)
- [Coding Agents Showdown: Forks vs Extensions](https://forgecode.dev/blog/coding-agents-showdown/)
- [4 VS Code Forks Built for Specific Tasks](https://www.xda-developers.com/vs-code-forks-built-for-specific-tasks/)

### Eclipse Theia Resources
- [Eclipse Theia Official Site](https://theia-ide.org/)
- [Build Your Own IDE with Theia](https://theia-ide.org/docs/composing_applications/)
- [Theia Deep Dive Tutorial](https://dzone.com/articles/theia-deep-dive-build-your-own-ide)
- [Theia GitHub Repository](https://github.com/eclipse-theia/theia)

### Alternative Frameworks
- [Tauri vs Electron Comparison](https://raftlabs.medium.com/tauri-vs-electron-a-practical-guide-to-picking-the-right-framework-5df80e360f26)
- [Native VS Code Alternatives (Zed, Lapce)](https://blog.logrocket.com/native-alternatives-vscode/)
- [Electron Alternatives List](https://github.com/sudhakar3697/awesome-electron-alternatives)

---

**Document Status:** Complete
**Review Date:** February 14, 2026
**Decision Owner:** Trev
**Next Action:** Validate recommendation with prototype
