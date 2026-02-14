# Claude Development Guide for Herth

This document defines the development workflows and standards for building Herth. Follow these guidelines strictly in all sessions.

---

## Project Overview

**Herth** is a self-hosted desktop application for Product Managers built with Electron, React, and TypeScript. It provides an AI-powered workspace for managing PRDs, research, meetings, and project documentation.

**Tech Stack:**
- Electron + React 19 + TypeScript
- Vite for building
- TipTap (planned - Phase 2)
- Zustand for state management
- Tailwind CSS 4
- Anthropic/OpenAI/Ollama LLM integration (planned - Phase 3)

**Key Locations:**
- Main process: `electron/`
- Renderer process: `src/`
- Build output: `out/`
- Plans: `plan/`
- Changelog: `change/`
- Tests: `test/`
- Bugs: `bugs/`

---

## Development Workflow

### 1. Planning Process

#### Adding New Features
When planning new features or phases:

1. **Create or update plan files** in `/plan` folder
   - Use markdown format
   - Include detailed task breakdowns
   - Provide code examples and schemas
   - Add testing checklists
   - Define "Definition of Done"

2. **Plan structure:**
   ```markdown
   # Phase X: Feature Name

   Status: Planned | Next | In Progress
   Dependencies: Previous phases
   Estimated Effort: X weeks

   ## Overview
   ## Goals
   ## Task 1: Description
   ### 1.1 Subtask
   ## Testing Checklist
   ## Definition of Done
   ```

3. **Update plan/README.md** to reflect current status

#### Implementing Features
When implementing a planned feature:

1. **Mark phase as "In Progress"** in plan file
2. **Check off tasks** as you complete them (add ✅ next to task)
3. **Update plan** if you deviate from original approach
4. **Document architectural decisions** in plan file

#### Completing Features
When a feature/phase is fully implemented:

1. **Move content to changelog:**
   - Create/update file in `/change` folder
   - Document what was added
   - Include implementation date
   - Reference phase number

2. **Delete the plan file** from `/plan` folder

3. **Update plan/README.md** to mark phase as complete

4. **Update README files:**
   - Update `/plan/README.md` with current phase status
   - Update `/change/README.md` with completed phase
   - Update root `README.md` with latest progress and features

### 2. Changelog Management

#### Structure
Changelogs live in `/change` folder with this structure:

```
/change
  ├── phase-1.md        # Phase 1 completed features
  ├── phase-2.md        # Phase 2 completed features
  ├── ...
  └── README.md         # Changelog index
```

#### Changelog Format
Each phase changelog file:

```markdown
# Phase X: [Phase Name] - Completed

**Completion Date:** YYYY-MM-DD
**Duration:** X weeks
**Status:** ✅ Complete

## Features Added

### Feature Category 1
- [YYYY-MM-DD] Feature description
  - Implementation details
  - Files changed: `file1.ts`, `file2.tsx`
  - Commit: `abc1234`

### Feature Category 2
- [YYYY-MM-DD] Another feature
  - Details...

## Features Removed
- [YYYY-MM-DD] Removed feature X because...

## Breaking Changes
- [YYYY-MM-DD] Changed API from X to Y

## Bug Fixes Included
- Fixed bug #123 - Description
- Fixed bug #456 - Description

## Technical Decisions
- Chose Library X over Y because...
- Changed approach from A to B due to...

## Lessons Learned
- What went well
- What could be improved
```

#### When to Update Changelog
- After completing each major feature
- When removing/deprecating features
- When making breaking changes
- At end of each phase

### 3. Testing Process

#### Test Organization

Tests live in `/test` folder:

```
/test
  ├── unit/              # Unit tests
  ├── integration/       # Integration tests
  ├── e2e/              # End-to-end tests
  ├── fixtures/         # Test data
  └── README.md         # Testing guide
```

#### Writing Tests

1. **Create tests alongside feature implementation**
   - Unit tests for services, utilities
   - Integration tests for IPC communication
   - E2E tests for user workflows

2. **Test file naming:**
   - Unit: `ServiceName.test.ts`
   - Integration: `feature-name.integration.test.ts`
   - E2E: `user-workflow.e2e.test.ts`

3. **Test structure:**
   ```typescript
   describe('FeatureName', () => {
     describe('specificBehavior', () => {
       it('should do X when Y happens', () => {
         // Arrange
         // Act
         // Assert
       });
     });
   });
   ```

#### Running Tests

**CRITICAL:** After implementing any feature:

1. **Run all existing tests:**
   ```bash
   npm test
   ```

2. **Verify no regressions** - All previous tests must pass

3. **Add tests for new features** - Maintain test coverage

4. **Update test documentation** if test commands change

#### Test-First Approach for Bug Fixes
When fixing bugs:

1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify test now passes
4. Keep test to prevent regression

### 4. Bug Tracking

#### Bug Documentation

Bugs live in `/bugs` folder:

```
/bugs
  ├── bug-001-preload-not-loading.md
  ├── bug-002-file-tree-crash.md
  └── README.md         # Bug index
```

#### Bug Report Format

```markdown
# Bug #XXX: Short Description

**Status:** Open | In Progress | Resolved
**Severity:** Critical | High | Medium | Low
**Reported:** YYYY-MM-DD
**Resolved:** YYYY-MM-DD (if resolved)

## Description
Clear description of the bug and its impact.

## Steps to Reproduce
1. Step one
2. Step two
3. Bug occurs

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: macOS 12.6
- Node: 18.x
- Electron: 28.x

## Error Messages
```
Paste error logs here
```

## Investigation Notes
- Finding 1
- Finding 2

## Resolution
(Once resolved)
- Root cause: ...
- Fix: ...
- Commit: abc1234
- Tests added: bug-xxx.test.ts

## Related Issues
- Related to bug #YYY
- Caused by feature in Phase X
```

#### Bug Workflow

1. **Discovery:**
   - Create bug file in `/bugs` folder
   - Set status to "Open"
   - Assign severity

2. **Investigation:**
   - Update "Investigation Notes"
   - Change status to "In Progress"

3. **Resolution:**
   - Fix the bug
   - Add tests to prevent regression
   - Update bug file with resolution details
   - **Move to changelog** under "Bug Fixes"
   - **Delete bug file** from `/bugs` folder

4. **Update bugs/README.md** to track open bugs

---

## Code Standards

### File Organization
- Main process code: `electron/`
- React components: `src/components/`
- State management: `src/stores/`
- Types: `src/types/` and `electron/types/`
- Services: `electron/services/`
- IPC handlers: `electron/ipc/`

### TypeScript
- Always use TypeScript, never plain JavaScript
- Define interfaces for all data structures
- Avoid `any` - use `unknown` if type truly unknown
- Export types from dedicated type files

### React Components
- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic to custom hooks
- Use Zustand for state management

### Error Handling
- Always wrap IPC calls in try-catch
- Log errors with context: `console.error('[Module] Error:', error)`
- Show user-friendly error messages
- Never silently swallow errors

### Naming Conventions
- Components: PascalCase (`FileTree.tsx`)
- Files/folders: kebab-case (`file-service.ts`)
- Functions/variables: camelCase (`createProject`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_CONFIG`)
- Types/Interfaces: PascalCase (`FileContent`, `Project`)

---

## Git Workflow

### Commits
- Write clear commit messages
- Format: `type: description`
- Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Include Co-Authored-By when AI-assisted

Example:
```
feat: add TipTap markdown editor integration

- Install TipTap packages
- Create TipTapEditor component
- Add toolbar with formatting options
- Connect to file store

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Branches (future)
When project grows:
- `main` - stable releases
- `develop` - integration branch
- `feature/phase-X-feature-name` - feature branches

---

## AI Assistant Guidelines

### When Implementing Features

1. **Read the plan first** - Review `/plan/phase-X.md` before starting
2. **Follow the plan** - Implement as specified unless you find a better approach
3. **Update the plan** - Document deviations and architectural decisions
4. **Test immediately** - Run tests after implementation
5. **Update changelog** - Document what was added

### When User Reports a Bug

1. **Create bug file** in `/bugs` with full details
2. **Reproduce the issue** - Understand the problem
3. **Write failing test** - Test-first approach
4. **Fix the bug** - Implement solution
5. **Verify tests pass** - Including new test
6. **Update changelog** - Document the fix
7. **Delete bug file** - Clean up after resolution

### When User Requests New Feature

1. **Check if planned** - Review `/plan` folder
2. **If planned:** Follow the plan
3. **If not planned:**
   - Create plan file or update existing phase
   - Get user approval before implementing
   - Follow planning workflow

### Code Quality Checklist

Before considering any feature "done":

- [ ] Code follows TypeScript best practices
- [ ] Error handling is comprehensive
- [ ] User-facing errors are clear and helpful
- [ ] Code is documented (complex logic)
- [ ] Tests are written and passing
- [ ] No console errors in dev tools
- [ ] Feature works in both dev and production build
- [ ] Changelog is updated
- [ ] Plan file is updated or removed

---

## Build and Development

### Development Commands
```bash
npm run dev          # Build and run
npm run dev:watch    # Watch mode
npm start            # Run built app
npm run build        # Production build
npm test             # Run tests (when implemented)
npm run lint         # Run linter
npm run typecheck    # Check types
```

### Before Committing
1. Run `npm run build` - Ensure no build errors
2. Run `npm test` - Ensure tests pass
3. Run `npm run typecheck` - Ensure no type errors
4. Test the app - Quick smoke test

---

## Phase Status Tracking

### Current Status
- **Phase 1:** ✅ Complete
- **Phase 2:** ✅ Complete
- **Phase 3:** ✅ Complete
- **Phase 4:** 🚧 Next Up
- **Phase 5:** 📋 Planned
- **Phase 6:** 📋 Planned

### Quick Reference
- ✅ Complete
- 🚧 In Progress
- 📋 Planned
- ⏸️ On Hold
- ❌ Cancelled

---

## Important Reminders

### ALWAYS
- ✅ Update changelog when features are complete
- ✅ Write tests for new features
- ✅ Run tests before committing
- ✅ Document bugs in `/bugs` folder
- ✅ Follow the plan or update it
- ✅ Handle errors gracefully
- ✅ Log with clear context

### NEVER
- ❌ Skip testing after implementation
- ❌ Silently swallow errors
- ❌ Leave empty catch blocks
- ❌ Commit broken code
- ❌ Ignore the plan without documenting why
- ❌ Delete plan files before moving to changelog
- ❌ Leave resolved bugs in `/bugs` folder

---

## Questions?

If unsure about:
- **Architecture:** Check plan files for technical decisions
- **Workflow:** Reference this document
- **Bugs:** Create bug file and investigate
- **New features:** Create/update plan, get user approval

---

**Last Updated:** February 14, 2024
**Version:** 1.0.0
