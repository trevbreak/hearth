# Herth Test Suite

This directory contains all tests for Herth.

## Current Status

**⚠️ Tests Not Yet Implemented**

Testing infrastructure will be set up in Phase 2. This README will be updated with test commands and guidelines once tests are added.

## Planned Test Structure

```
/test
  ├── unit/              # Unit tests for services and utilities
  │   ├── services/      # FileService, ProjectManager, etc.
  │   └── utils/         # Helper functions
  ├── integration/       # Integration tests for IPC and workflows
  │   ├── ipc/          # IPC handler tests
  │   └── workflows/     # Multi-step user workflows
  ├── e2e/              # End-to-end tests using Electron testing
  │   └── user-flows/    # Complete user scenarios
  ├── fixtures/         # Test data and mocks
  │   ├── projects/     # Sample projects
  │   └── files/        # Sample files
  └── README.md         # This file
```

## Test Framework (Planned)

- **Unit/Integration:** Vitest
- **E2E:** Playwright or Spectron
- **Mocking:** Vitest mocks
- **Coverage:** Vitest coverage

## Running Tests (Once Implemented)

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- unit
npm test -- integration
npm test -- e2e

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage

# Run tests before commit
npm run precommit  # Runs tests + linting
```

## Writing Tests

### Unit Test Example
```typescript
// test/unit/services/FileService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileService } from '@/electron/services/FileService';

describe('FileService', () => {
  let fileService: FileService;

  beforeEach(() => {
    fileService = new FileService(mockConfigManager);
  });

  describe('readFile', () => {
    it('should read file with frontmatter', async () => {
      // Test implementation
    });

    it('should throw error for non-existent file', async () => {
      // Test implementation
    });
  });
});
```

### Integration Test Example
```typescript
// test/integration/ipc/fileHandlers.test.ts
import { describe, it, expect } from 'vitest';

describe('File IPC Handlers', () => {
  it('should create file through IPC', async () => {
    // Test IPC communication
  });
});
```

### E2E Test Example
```typescript
// test/e2e/user-flows/create-project.test.ts
import { test, expect } from '@playwright/test';

test('user can create a new project', async ({ page }) => {
  await page.click('[data-testid="new-project-button"]');
  await page.fill('[data-testid="project-name-input"]', 'My Project');
  await page.click('[data-testid="create-button"]');
  await expect(page.locator('[data-testid="project-list"]')).toContainText('My Project');
});
```

## Test Coverage Goals

- **Unit Tests:** 80%+ coverage for services and utilities
- **Integration Tests:** All IPC handlers covered
- **E2E Tests:** Critical user flows covered

## CI/CD Integration (Future)

Tests should run:
- On every commit (pre-commit hook)
- On every pull request
- Before deployment
- Nightly (full suite including slow tests)

## Test Data Management

Test fixtures will be stored in `/test/fixtures/` and should:
- Be realistic but minimal
- Be easy to understand
- Not contain sensitive data
- Be version controlled

## Performance Testing (Future)

Phase 6 may include:
- Load testing for large workspaces
- Memory leak detection
- Startup time benchmarks

---

**Note:** This is a placeholder. Will be fully implemented in Phase 2.

**Last Updated:** February 14, 2024
