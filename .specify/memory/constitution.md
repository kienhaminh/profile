<!--
Sync Impact Report
Version change: N/A → 1.0.0
Modified principles: template placeholders → concrete principles (names set below)
Added sections: Section 2: Additional Constraints & Standards; Section 3: Development Workflow & Quality Gates
Removed sections: none
Templates requiring updates:
- .specify/templates/plan-template.md: ✅ updated (version + path reference)
- .specify/templates/spec-template.md: ✅ aligned (no changes needed)
- .specify/templates/tasks-template.md: ✅ aligned (no changes needed)
- .specify/templates/agent-file-template.md: ✅ aligned (no changes needed)
Follow-up TODOs:
- TODO(RATIFICATION_DATE): original adoption date not recorded; set when known.
-->

# porfolio Constitution

## Core Principles

### I. Code Quality (Simplicity, Purity, Maintainability)

Non‑negotiables:

- All business logic MUST be implemented as pure functions in `services` with explicit inputs/outputs; no hidden state, no mutation of inputs, and no global state changes.
- Controllers/transport layers MUST delegate to services only (see `@/services` pattern); no business logic in controllers.
- Code MUST follow DRY, KISS, and YAGNI. Duplicated logic MUST be refactored; unnecessary abstractions are prohibited.
- Strict typing is REQUIRED across the codebase (function signatures, variables, and public APIs). Avoid `any`/untyped constructs.
- Naming MUST be descriptive and intention‑revealing; avoid abbreviations.
- Linting/formatting MUST pass in CI with zero warnings; no disabling without documented justification.
- Errors MUST be explicit, typed/specific, actionable, and logged with context before raising; never silently ignore failures.

Rationale: High‑signal, predictable code with low cognitive load reduces defects and accelerates change safely.

### II. Testing Standards (TDD, Determinism, Coverage)

Non‑negotiables:

- TDD is enforced: write failing tests before implementation; use Red‑Green‑Refactor.
- Test pyramid MUST be balanced: unit tests for pure logic, contract tests for APIs/contracts, integration tests for critical flows.
- Tests MUST be deterministic, isolated, and parallel‑safe. No reliance on real external services unless explicitly marked and isolated.
- Minimum coverage threshold: 85% line and 80% branch on changed files; coverage MUST not decrease for touched areas.
- CI MUST run all tests on every PR; builds with flaky or failing tests MUST be rejected.

Rationale: Tests define behavior, prevent regressions, and enable confident refactoring.

### III. User Experience Consistency (Accessibility, Design System, Behavior)

Non‑negotiables:

- Adhere to a single design system (tokens, components, interaction patterns). New UI elements MUST use or extend existing components first.
- Accessibility MUST meet WCAG 2.1 AA: focus management, keyboard navigation, color contrast, ARIA where applicable, and semantic structure.
- UI MUST provide consistent states: loading, empty, error with actionable messages; no silent failures.
- Content and copy MUST be concise and consistent in tone; reuse established terminology.
- Layouts MUST be responsive across target breakpoints defined by the project.

Rationale: Consistency lowers user friction, improves accessibility, and reduces maintenance.

### IV. Performance Requirements (Budgets, Monitoring, Optimization Discipline)

Non‑negotiables:

- Backend: p95 latency < 200ms and p99 < 500ms for typical requests under expected load; no N+1 queries; apply indexing and caching where appropriate.
- Frontend (web): LCP < 2.5s on 75th percentile, TTI < 3s, CLS < 0.1; JS bundle budget ≤ 200KB gzipped per route unless justified.
- Resource usage MUST be measured in CI/CD or staging using repeatable scripts; regressions MUST block merges.
- Performance work MUST be guided by profiling/measurement; speculative micro‑optimizations are prohibited.
- Introduce caching, batching, and pagination for expensive operations; document cache invalidation strategy.

Rationale: Defined budgets and measurement ensure user‑perceived speed and operational efficiency.

## Additional Constraints & Standards

- Security: input validation, least privilege, secure secrets management, TLS in transit; log sensitive data only in redacted form.
- Observability: structured logs, minimal INFO noise, WARN/ERROR with context; tracing/metrics for critical paths.
- Versioning: follow semantic versioning for public contracts and this constitution; breaking changes require migration notes.
- Documentation: public APIs and significant flows MUST be documented alongside code; update docs with changes.

## Development Workflow & Quality Gates

- Constitution Check: every plan/spec MUST include a gate section derived from this constitution; violations require documented justification.
- PRs MUST pass lint, tests, coverage thresholds, and performance budgets. Two approvals required for risk‑bearing changes.
- CI MUST fail fast on violations; main branch MUST remain releasable.
- Exceptions: time‑boxed with owner, scope, and rollback plan; tracked until resolved.

## Governance

- Authority: This constitution governs engineering practices. Conflicts with other documents are resolved in favor of this document.
- Amendments: Propose via PR describing changes, rationale, and migration/enablement plan. Approval by maintainers required.
- Versioning: Semantic versioning (MAJOR.MINOR.PATCH). MAJOR for incompatible removals/redefinitions; MINOR for new principles/sections; PATCH for clarifications.
- Reviews: Quarterly compliance review; feature plans/specs MUST reference the current constitution version.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date not recorded; set when known | **Last Amended**: 2025-09-28
