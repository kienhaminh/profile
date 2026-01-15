---
trigger: always_on
---

# Antigravity Development Standards & Protocols

**System Version**: 2.0
**Enforcement**: STRICT & MANDATORY

This document encapsulates the engineering and design standards for the Antigravity Agent. You must adhere to these rules without exception. These standards prioritize premium aesthetics, robust architecture, and a disciplined workflow.

---

## 1. 🎨 Design & Aesthetics (THE "WOW" STANDARD)

**Principle**: If it looks basic, you have FAILED. Visuals are not an afterthought; they are a priority.

### 1.1 Visual Excellence

- **Premium Feel**: Avoid generic browser defaults (plain blue links, Times New Roman). Use curated color palettes (HSL), custom fonts (Inter, Roboto, Outfit), and sophisticated spacing.
- **Dynamic Interface**: The UI must feel "alive" and responsive.
  - **MANDATORY**: Hover effects on all interactive elements.
  - **MANDATORY**: Smooth transitions (e.g., `transition: all 0.3s ease`) for state changes.
  - **RECOMMENDED**: Micro-animations for user feedback (clicks, loading, success states).
- **Modern Styling**: Use gradients, glassmorphism (backdrop-blur), and subtle shadows to create depth. Flat design is acceptable only if executed with high-end typography and perfect whitespace.

### 1.2 No Placeholders

- **Real Content**: Never use "Lorem Ipsum" or "Text Here" unless strictly necessary for layouting. Generate context-aware dummy data.
- **Assets**: If an image is needed and none exists, use the `generate_image` tool to create a working demonstration. Do not leave blank boxes.

---

## 2. 🛠 Technology Stack & Implementation

### 2.1 Core Technologies

- **Structure**: Semantic HTML5.
- **Logic**: Modern JavaScript/TypeScript (ES6+).
- **Styling**:
  - **DEFAULT**: Vanilla CSS (CSS Variables, Flexbox, Grid) for maximum flexibility.
  - **TAILWIND**: Use **ONLY** if the User explicitly requests it.
- **Frameworks**: Next.js or Vite only when explicitly requested for complex web apps.

### 2.2 New Project Protocol

1.  **Initialization**: Use `npx -y [package] ./` (non-interactive in current folder).
2.  **Verification**: Always run `--help` first to see available options before creating.
3.  **Local Dev**: Use `npm run dev` for development; build only when requested/verifying.

---

## 3. 🏗 Implementation Workflow (The 5-Step Process)

You must follow this systematic approach for building applications:

1.  **PLAN**: Understand requirements -> Outline features -> Design mental model -> Check `/docs`.
2.  **FOUNDATION**: Create/Update `index.css` -> Define Design System (Colors, Typography, Tokens).
3.  **COMPONENTS**: Build reusable, atomic components (Buttons, Cards, Inputs) using the foundation.
4.  **ASSEMBLE**: Construct pages using components -> Handle Routing/Navigation -> Layouts.
5.  **POLISH**: Review Experience -> Optimize Performance -> Check SEO -> Verify "Wow" Factor.

---

## 4. 🧹 Clean Code & Architecture

### 4.1 The "Docs First" Rule

- **Source of Truth**: The `/docs` directory is inviolable. Read it before coding.
- **Immutable**: Never modify `/docs` without explicit user instruction.
- **Consistency**: Follow the patterns documented in `/docs` (Auth, DB, Deployment).

### 4.2 Naming & Structure

- **Variables/Functions**: Descriptive, verb-noun (e.g., `fetchUserData`, `isLoggedIn`). Avoid abbreviations.
- **Files**: `kebab-case` for utils/files (`user-profile.ts`), `PascalCase` for Components (`UserProfile.tsx`).
- **SOLID Principles**:
  - **SRP**: One function, one purpose.
  - **DRY**: Don't Repeat Yourself - extract shared logic to hooks/utils.
  - **Components**: Prefer Composition (children prop) over Inheritance or massive "God components".

### 4.3 Component Architecture

- **Reuse**: Check `.app/components/` before creating new ones.
- **Generic**: Components should be agnostic of specific business logic where possible to maximize reuse.
- **Types**: Always use TypeScript interfaces for Props.

### 4.4 Code Hygiene

- **Delete, Don't Comment**: Remove unused code entirely. Git history preserves it if needed. Do not leave commented-out blocks of code.
- **Clean Imports**: Remove unused imports immediately. Keep the file header clean.

### 4.5 No Hardcoded Strings

- **Use Enums/Constants**: All reusable text strings MUST be declared as enums, constants, or configuration objects. Never hardcode strings directly in the codebase.
- **Scope**:
  - **UI Labels**: Button text, form labels, headings, tooltips, error messages.
  - **API Endpoints**: Route paths, query parameters, header keys.
  - **Status/State Values**: `'loading'`, `'success'`, `'error'`, etc.
  - **Keys/Identifiers**: Object keys, localStorage keys, event names.
- **Organization**:
  - Group related constants in dedicated files (e.g., `constants/ui.ts`, `constants/api.ts`).
  - Use TypeScript `enum` for finite sets of values, `as const` objects for complex mappings.
- **Example**:

  ```typescript
  // ❌ BAD: Hardcoded strings
  if (status === 'loading') { ... }
  <button>Submit</button>

  // ✅ GOOD: Using constants/enums
  enum Status { Loading = 'loading', Success = 'success' }
  const UI_LABELS = { submitButton: 'Submit' } as const;

  if (status === Status.Loading) { ... }
  <button>{UI_LABELS.submitButton}</button>
  ```

---

## 5. 🔍 SEO & Performance Standards

**Every public-facing page must include:**

1.  **Title Tags**: `<title>Descriptive Content</title>`
2.  **Meta Description**: `<meta name="description" ... />`
3.  **Semantic Hierarchy**: Single `<h1>` per page, logical `<h2>`...`<h6>`.
4.  **Optimization**: WebP images, lazy loading, proper bundle splitting.
5.  **Unique IDs**: Ensure interactive elements have unique IDs for testing/accessibility.

---

## 6. 🛡 Security & Safety

- **No Dangerous Commands**: Never auto-run `rm -rf`, system installs, or unverified complex scripts.
- **Input Validation**: Sanitize everything. Zod is recommended for runtime validation.
- **Secrets**: Never hardcode API keys or secrets. Use `.env` variables.
- **Auth**: Validate permissions on the server-side, not just client-side.

---

## 7. 🤖 Agent Behavior & Communication

- **Proactive**: Don't just answer; solve. If a build fails, fix it. If a design looks bad, improve it.
- **Formatting**: Use Markdown headers, bold text for key terms, and code blocks.
- **Clarity**: Explain **WHY** a technical decision was made (e.g., "Choosing Context API over Redux for simplicity here").
- **Collaboration**: Acknowledge mistakes immediately and correct them.

---
