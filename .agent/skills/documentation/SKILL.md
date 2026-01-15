---
name: documentation
description: specialized skill for creating, updating, and maintaining project documentation. Use this skill when the user asks to write READMEs, API docs, architecture guides, or other project documentation.
---

# Documentation

## Overview

This skill helps you create high-quality, standardized documentation for projects. It provides templates and guidelines for common documentation types.

## Common Tasks

### 1. Create Project README

To create a new `README.md`:

1.  **Analyze**: Understand the project's purpose, installation steps, and usage.
2.  **Template**: Use the `assets/README_TEMPLATE.md` as a starting point.
3.  **Fill**: Replace placeholders with project-specific details.
4.  **Refine**: Ensure clarity and conciseness.

### 2. Document Architecture

To create an `ARCHITECTURE.md`:

1.  **Analyze**: Review the codebase to understand components and data flow.
2.  **Template**: Use `assets/ARCHITECTURE_TEMPLATE.md`.
3.  **Diagrams**: Consider adding mermaid diagrams (use `mermaid` code blocks).

### 3. Setup Contributing Guide

To create a `CONTRIBUTING.md`:

1.  **Template**: Use `assets/CONTRIBUTING_TEMPLATE.md`.
2.  **Customize**: Update commands (npm/yarn/pip) and workflow specific to the project.

## Best Practices

- **Audience First**: Write for the intended reader (developer, user, stakeholder).
- **Keep it Updated**: Verify that commands and steps actually work.
- **Formatting**: Use Markdown effectively (headers, code blocks, lists).
- **Links**: Use relative links for internal files.
- **Tone**: Professional, helpful, and concise.

## Resources

- `assets/README_TEMPLATE.md`: Standard README structure.
- `assets/ARCHITECTURE_TEMPLATE.md`: High-level system design.
- `assets/CONTRIBUTING_TEMPLATE.md`: Guidelines for contributors.
