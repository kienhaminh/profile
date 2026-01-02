---
trigger: always_on
---

---

## trigger: always_on

# Software Development Principles & Standards

This document serves as the comprehensive guide for all development activities. Adherence to these standards is MANDATORY to ensure code quality, maintainability, and scalability.

---

## 0. SYSTEM KNOWLEDGE & DOCUMENTATION (CRITICAL)

- **Official Source of Truth**: The `/docs` directory is the single source of truth for all system architecture, technical specifications, and domain knowledge.
- **MUST FOLLOW**: You MUST strictly follow the patterns, conventions, and technical decisions documented in `/docs`. Do NOT deviate from what is specified.
- **READ BEFORE ACTION**: Before starting any complex task, refactoring, or architectural change, you MUST consult the relevant files in `/docs` to understand existing constraints and patterns.
- **DO NOT MODIFY DOCS**: You are NOT allowed to modify or update files in `/docs`. Only the user can update documentation. If you believe documentation needs updating, inform the user.
- **References**:
  - `01_Overview.md`: System overview and high-level architecture.
  - Check other files in `/docs` for specific implementation details (Auth, DB, Deployment, etc.).
- **Consultation Rule**: If a user request involves a specific domain, you must first read the relevant documentation to understand the existing constraints and patterns before writing any code.

---

## 1. Core Values

- **Quality over Speed**: Do not rush implementation at the cost of technical debt.
- **Maintainability**: Write code for the next engineer who will read it.
- **Consistency**: Follow established patterns throughout the codebase.
- **Simplicity**: Avoid over-engineering. Favor the simplest solution that works.

---

## 2. Clean Code & Naming Conventions

### 2.1 Meaningful Naming

- **Variables**: Use descriptive nouns. Avoid abbreviations unless standard (e.g., `userProfile` instead of `up`).
- **Functions**: Use verb-noun pairs. `fetchData`, `validateEmail`, `calculateTotal`.
- **Booleans**: Prefix with `is`, `has`, `should`, or `can`. `isActive`, `hasPermission`.
- **Classes/Types**: Use PascalCase nouns. `UserSession`, `OrderRepository`.

### 2.2 Function Best Practices

- **Small & Focused**: Functions should ideally be less than 20 lines.
- **Single Responsibility**: A function should do exactly one thing.
- **Arguments**: Limit to 2-3 arguments. Use objects for more than 3 parameters.
- **No Side Effects**: Prefer pure functions for business logic.

### 2.3 Comments

- Code should be self-documenting. Use comments to explain **WHY**, not **WHAT**.
- Avoid "noise" comments that just restate the code.

---

## 3. SOLID Principles in Practice

### 3.1 Single Responsibility Principle (SRP)

- Every module, class, or function should have one reason to change.
- Separate business logic from UI rendering and data fetching.

### 3.2 Open/Closed Principle (OCP)

- Software entities should be open for extension but closed for modification.
- Use polymorphism and dependency injection.

### 3.3 Liskov Substitution Principle (LSP)

- Subtypes must be substitutable for their base types without altering correctness.

### 3.4 Interface Segregation Principle (ISP)

- Clients should not be forced to depend on interfaces they do not use.
- Prefer smaller, specific interfaces over large, fat ones.

### 3.5 Dependency Inversion Principle (DIP)

- Depend on abstractions, not concretions.
- Use hooks to abstract data fetching from components.

---

## 4. Component Architecture & Reusability (CRITICAL)

### 4.1 Common Components Preference

- **REUSE OVER RECREATE**: Before building a new UI element, check for an existing common component in `/app/components/ui` or `/app/common`.
- **BUSINESS LOGIC REUSE**: If multiple parts of the application share the same business logic, extract it into a dedicated hook or service.
- **GENERIC COMPONENTS**: Build components to be as generic as possible. Use props for variations instead of creating `ButtonRed`, `ButtonBlue`.
- **DRY Logic**: Never duplicate API calls or data transformation logic across components. Use a centralized service layer.

### 4.2 Component Design

- **Atomic Design**: Structure components into Atoms (buttons, inputs), Molecules (form fields), and Organisms (headers, footers).
- **Controlled vs Uncontrolled**: Favor controlled components for predictable state management.
- **Composition**: Use the `children` prop and slots to allow flexible layouts.
- **Theme-able**: Always use design tokens or CSS variables for styling instead of hardcoded hex values.

### 4.3 Prop Typing

- Always provide full Typescript interfaces/types for props.
- Use optional props with sensible defaults.
- Document complex props using JSDoc.

---

## 5. Testing Strategy

### 5.1 Unit Testing

- **Coverage**: Aim for 80%+ coverage on business logic and complex algorithms.
- **Tools**: Use Vitest for fast, isolated unit tests.
- **Isolation**: Mock dependencies to test units in isolation.

### 5.2 Integration Testing

- Test how components interact with each other.
- Use React Testing Library (RTL) for UI behavior testing.
- Focus on user interactions: "When I click X, Y should happen."

### 5.3 E2E Testing

- Focus on critical user journeys (e.g., Login, Registration, Checkout).
- Using Playwright for automated browser testing is recommended.

### 5.4 Test-Driven Development (TDD)

- Highly encouraged to write tests alongside or before implementation to define requirements.
- Use the Red-Green-Refactor cycle.

---

## 6. Library Installation & Dependency Management

### 6.1 Official CLI Usage (MANDATORY)

- **NEVER** manually create boilerplate files if a CLI exists.
- **Official Tools**: Always prioritize official CLI tools (e.g., `npx`, `pnpm dlx`).
- **Examples**:
  - Tailwind: `npx tailwindcss init`
  - Shadcn UI: `npx shadcn-ui@latest add [component]`
  - Prisma: `npx prisma init`
  - Next.js: `npx create-next-app`
  - React Router: `npx react-router init`
- **Verification**: ALWAYS check official documentation for the recommended CLI installation command.

### 6.2 Version Control

- Pin versions of critical libraries to avoid breaking changes.
- Regularly run audit checks for security vulnerabilities.

---

## 7. Project Structure & Organization

### 7.1 Separation of Concerns

- `/app/routes`: Page routes and handlers (React Router v7).
- `/app/components`: UI components.
- `/app/hooks`: Custom React hooks.
- `/app/services`: API calls and external integrations.
- `/app/utils`: Pure utility functions.
- `/app/types`: Shared type definitions.

### 7.2 File Naming

- Use kebab-case for directories and non-component files (`user-profile.ts`).
- Use PascalCase for component files (`UserProfile.tsx`).
- Test files should match the file they test: `UserProfile.test.tsx`.

---

## 8. Error Handling & Logging

### 8.1 Defensive Programming

- Validate inputs. Handle null/undefined cases explicitly.
- Use Optional Chaining (`?.`) and Nullish Coalescing (`??`).
- Use Zod for runtime validation of API responses and Forms.

### 8.2 Error Boundaries

- Implement React Error Boundaries to prevent the entire app from crashing on UI errors.
- Provide a graceful fallback UI.

### 8.3 Centralized Error Handling

- Use a global error handler for API responses.
- Ensure user-facing error messages are localized and helpful.

---

## 9. Performance & Optimization

### 9.1 Rendering Performance

- Use `React.memo`, `useMemo`, and `useCallback` judiciously.
- Profile components using React DevTools to find bottlenecks.
- Implement virtualization for long lists.

### 9.2 Asset Optimization

- Optimize images using WebP format.
- Use lazy loading for non-critical components.

---

## 10. Security Best Practices

### 10.1 Data Protection

- Sanitize user inputs to prevent XSS.
- Never store sensitive data (tokens, PII) in local storage without proper security measures.
- Use `HttpOnly` cookies for session tokens where possible.

### 10.2 Authentication

- Implement proper RBAC (Role-Based Access Control).
- Validate all user actions on the server side.

---

## 11. Documentation Standards

### 11.1 Code Documentation

- **JSDoc**: Document complex functions and hooks.
- **Why**: Explain the "why" behind complex logic.

### 11.2 System Documentation

- The `/docs` folder is maintained by the user only.
- Agent must READ and FOLLOW `/docs`, but NEVER modify it.

---

## 12. Git Workflow

### 12.1 Commit Messages

- Use Conventional Commits: `type(scope): description`.
- **Types**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.

---

## 13. State Management

- **URL State**: Specific filters, pagination, search queries should be in the URL.
- **Server State**: Use libraries like React Query (or React Router loaders) for data fetching.
- **Client State**: Use local state (`useState`) for UI-only state; `Zustand` or Context for global app state.

---

## Conclusion

Following these principles ensures that the software we build is robust, testable, and pleasant to work with. When in doubt, prioritize readability, reusability, and **ALWAYS consult the `/docs` folder first**.
