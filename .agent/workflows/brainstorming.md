---
description: Brainstorm, analyze requirements against codebase, and clarify ambiguities
---

1. **Context Discovery & Codebase Analysis**
   - Identify the domain of the request (e.g., Frontend, Backend, Database, Styling).
   - Search for relevant existing files using `find_by_name` or `grep_search`.
   - Read the core files involved (e.g., `schema.prisma`, key components, API routes) using `view_file` to understand the _current state_.

2. **Requirement Gap Analysis**
   - Compare the User's request against the current implementation.
   - Determine technically what is missing (e.g., "Need a new DB table?", "New API route?", "New UI component?").
   - Check for conflicting patterns or rules (refer to `.agent/rules/development-standards.md`).

3. **Ambiguity Check (CRITICAL)**
   - evaluating if the request has enough detail to ANY of the following:
     - Data models (fields, types, relationships).
     - UI/UX behavior (loading states, error states, interactions).
     - Business logic (permissions, validation).
   - If _anything_ is unclear, you MUST stop and prepare questions.

4. **Output Generation**
   - **Scenario A: Unclear Requirements**
     - Present a list of specific, clarifying questions to the User.
     - Explain _why_ you are asking (e.g., "To avoid breaking the existing auth flow, I need to know...").
   - **Scenario B: Clear Requirements**
     - Propose a detailed Implementation Plan.
     - Breakdown the task into smaller steps (e.g., "1. Update DB, 2. Create Server Action, 3. Build UI").
     - Ask for User confirmation before writing code.
