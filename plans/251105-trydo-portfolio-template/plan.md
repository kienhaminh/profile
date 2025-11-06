# Trydo Portfolio Template Integration Plan

**Created**: 2025-11-05
**Status**: Planning
**Target**: Next.js 15 portfolio with tRPC, Drizzle ORM, PostgreSQL

## Overview

Integrate Trydo portfolio landing template design patterns into existing Next.js portfolio while maintaining current tech stack and improving UX/UI consistency.

## Template Analysis

**Source**: https://trydo.rainbowit.net/portfolio-landing
**Screenshot**: `/Users/kien.ha/Code/profile/docs/screenshots/trydo-template-full.png`

### Identified Sections

1. **Hero**: Split layout - text left, profile image right
2. **About Me**: Profile image left, tabbed content right (Skills/Awards/Experience/Education)
3. **Services**: 6 service cards, 3-column grid, icon-based
4. **Projects**: 6 project cards, 3-column grid, image overlays
5. **News/Blog**: 3 blog cards with images
6. **Contact/Hire Me**: Form left, profile image right

### Design System

**Colors**:
- Primary: Pink (#f81f58)
- Background: White, Light Gray (#f8f9fa)
- Text: Black (#1e1e1e), Gray (#6c757d)
- Accent: Dark (#000), Red gradients

**Typography**:
- Headings: Bold, Large (48px-60px hero, 36px-42px sections)
- Body: Regular, 16px-18px
- Small: 14px (metadata, labels)

**Spacing**:
- Section padding: 80px-100px vertical
- Card gaps: 30px
- Container max-width: 1200px

**Components**:
- Cards: White bg, subtle shadow, rounded corners (8px)
- Buttons: Solid fills, rounded (6px), hover effects
- Tabs: Underline active state, smooth transitions
- Forms: Clean inputs, labels above fields

## Current State Analysis

**Existing Implementation** (`apps/web/src/app/page.tsx`):
- Hero: Centered layout with avatar, gradient text, social links
- Projects: 2-column grid, card-based
- Blog: 3-column grid, card-based
- Color scheme: Blue/Purple gradients
- Style: Modern, glassmorphism effects

**Reusable Components**:
- `components/ui/card.tsx` - shadcn Card component
- `components/ui/button.tsx` - shadcn Button component
- `components/Navbar.tsx` - Sticky navigation
- `components/Footer.tsx` - Footer with contact info

**Missing Elements**:
- About Me section
- Services section
- Tabbed content UI
- Contact form section
- Split hero layout option

## Implementation Phases

### Phase 1: Analysis & Design (Week 1)
- Detailed component inventory
- Design token mapping
- Component architecture
- Data model updates
- Asset requirements

### Phase 2: Component Development (Week 2-3)
- Tabs component
- Service card component
- Contact form component
- Enhanced project cards
- About section layout

### Phase 3: Integration (Week 4)
- Homepage restructure
- Database schema updates
- API endpoints for services
- Content migration
- Style harmonization

### Phase 4: Testing & Polish (Week 5)
- Responsive testing
- Performance optimization
- Accessibility audit
- Cross-browser testing
- User testing

## Key Decisions

**Design Approach**:
- Keep current blue/purple gradient theme (brand consistency)
- Adopt Trydo layout patterns and spacing
- Hybrid approach: Trydo structure + current aesthetics

**Component Strategy**:
- Build on shadcn/ui foundation
- Create composable section components
- Maintain TypeScript strict mode
- Follow existing code standards

**Data Strategy**:
- New `services` table for service offerings
- Extend `configs` table for about content
- Keep existing posts/projects schema
- Add skill categories support

## Success Criteria

- [ ] All 6 Trydo sections implemented
- [ ] Responsive across mobile/tablet/desktop
- [ ] Accessibility score 95+
- [ ] Performance: LCP <2.5s, CLS <0.1
- [ ] Type-safe throughout
- [ ] Test coverage >80%
- [ ] Documentation updated

## Risk Mitigation

**Design Conflicts**: Document design decisions, create style guide
**Scope Creep**: Strict phase boundaries, MVP first approach
**Performance**: Lazy load images, code splitting, optimize bundles
**Data Migration**: Seed scripts, backup strategies, rollback plan

## Phase Documents

1. [Phase 01: Analysis](./phase-01-analysis.md) - Component inventory, design tokens, architecture
2. [Phase 02: Component Design](./phase-02-component-design.md) - Component specs, API design, schemas
3. [Phase 03: Implementation](./phase-03-implementation.md) - Development tasks, integration steps
4. [Phase 04: Testing](./phase-04-testing.md) - Test strategy, QA checklist, deployment

## Next Steps

1. Review and approve plan
2. Set up development branch
3. Begin Phase 1 analysis
4. Create design system documentation

## Unresolved Questions

- Use pink accent from Trydo or keep blue/purple gradients?
- Implement dark mode support in this iteration?
- Keep current hero or switch to split layout?
- Static content or CMS-driven for About/Services sections?
