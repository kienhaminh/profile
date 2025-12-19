---
description: Enforce Test Driven Development (TDD) for new features and regression testing.
---

This workflow ensures that all new features are developed using TDD and that existing functionality is preserved through regression testing.

1. **Analyze Requirements and Identify Test Scenarios**
   - Before writing any code, understand the requirements.
   - Identify logical test cases (happy path, edge cases, error states).

2. **Create or Update Tests (Red Phase)**
   - Locate the test directory: `apps/web/tests/` (Unit tests in `unit/`, Integration tests in `integration/`).
   - Create a new test file named `[feature].test.ts` or update an existing one.
   - Write tests using `vitest` syntax (`describe`, `it`, `expect`).
   - **CRITICAL**: Run the tests to confirm they fail.
   - Command: `npx vitest run apps/web/tests/path/to/test.ts` (replace path with your actual test file).

3. **Implement Feature (Green Phase)**
   - Write the minimum amount of code required to pass the failing tests.
   - Do not over-engineer. Focus on passing the test.

4. **Verify Implementation**
   - Run the specific test file again to confirm it passes.
   - Command: `npx vitest run apps/web/tests/path/to/test.ts` (replace path with your actual test file).

5. **Regression Testing**
   - Run ALL tests to ensure no regressions were introduced.
   - Command: `turbo run test`
     // turbo

6. **Refactor (Refactor Phase)**
   - Clean up the code while ensuring tests still pass.
