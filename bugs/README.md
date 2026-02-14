# Bug Tracker

This directory tracks active bugs in Herth. Once bugs are resolved, they are moved to the changelog and deleted from here.

## Current Status

**🎉 No Open Bugs**

All known bugs have been resolved!

## Bug Workflow

### Reporting a Bug

1. Create a new markdown file: `bug-XXX-short-description.md`
2. Use the next available bug number (XXX)
3. Fill out the bug template (see below)
4. Add bug to the index below

### Bug Template

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
- OS: macOS/Windows/Linux
- Node: X.x
- Electron: X.x

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

### Resolving a Bug

1. Update bug file with resolution details
2. Add bug fix to changelog (`/change/phase-X.md`)
3. Delete bug file from `/bugs` folder
4. Update this index

## Bug Index

### Open Bugs
None currently!

### Recently Resolved

#### Bug #003: Error Handling Missing
- **Resolved:** February 14, 2024
- **Severity:** Medium
- **Description:** Errors silently swallowed in project creation
- **Fix:** Added comprehensive error handling throughout
- **Changelog:** [phase-1.md](../change/phase-1.md#bug-fixes)

#### Bug #002: macOS Window Buttons Overlap
- **Resolved:** February 14, 2024
- **Severity:** Low
- **Description:** Traffic light buttons obscured Herth logo
- **Fix:** Added left padding to header
- **Changelog:** [phase-1.md](../change/phase-1.md#bug-fixes)

#### Bug #001: Preload Script Not Loading
- **Resolved:** February 14, 2024
- **Severity:** Critical
- **Description:** `window.api` undefined, project creation failed
- **Fix:** Corrected preload script path from `.cjs` to `.js`
- **Changelog:** [phase-1.md](../change/phase-1.md#bug-fixes)

## Statistics

- **Total Bugs Filed:** 3
- **Currently Open:** 0
- **Resolved:** 3
- **Average Resolution Time:** < 1 day

---

**Last Updated:** February 14, 2024
