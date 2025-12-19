---
description: Standard workflow for developing new features or fixing bugs
---

1. **Analysis & Planning**
   - Review the user request and explore relevant files.
   - Create or update `implementation_plan.md` with a detailed plan.
   - **User Review**: Ask the user to review the plan if the change is complex.

2. **Implementation**
   - Implement the changes according to the plan.
   - **Coding Standards**:
     - **File Header**: All source files MUST include a general description (max 100 lines) at the top. This allows agents to understand the file context by scanning just the header.
     - **Atomic & Reusable**: Break code into small, atomic, reusable components. Strictly follow DRY and KISS principles.
     - **Size Limit**: Limit source files to 300-400 lines (excluding the description header). Refactor if a file exceeds this limit.
   - If database schema is modified:
     - Run `pnpm db:generate` to generate Prisma client.
     - Run `pnpm db:migrate` to apply migrations.

3. **Verification**
   - Run `pnpm lint` to check for linting errors.
     // turbo
   - Run `pnpm build` to ensure the project builds successfully.
   - Verify the changes manually or with tests.

4. **Documentation**
   - Update `walkthrough.md` with a summary of changes and verification steps.
