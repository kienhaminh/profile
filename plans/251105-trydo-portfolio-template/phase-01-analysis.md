# Phase 01: Analysis & Design

**Duration**: Week 1 (5 days)
**Goal**: Complete component inventory, design token mapping, architecture planning

## Component Inventory

### Existing Components (Reusable)

**UI Primitives** (`components/ui/`):
- `button.tsx` - Button with variants (default, outline, ghost)
- `card.tsx` - Card, CardHeader, CardTitle, CardContent
- `input.tsx` - Form input field
- `badge.tsx` - Tag/badge component
- `alert.tsx` - Alert messages
- `dialog.tsx` - Modal dialog
- `skeleton.tsx` - Loading placeholders

**Layout Components**:
- `Navbar.tsx` - Sticky nav with gradient logo, responsive
- `Footer.tsx` - 3-column footer, gradient bg, social links
- `HomeAnimations.tsx` - Animation orchestration

**Admin Components** (reference for patterns):
- `admin/BlogForm.tsx` - Rich text editor integration
- `admin/ProjectForm.tsx` - Multi-field forms
- `admin/TagSelect.tsx` - Tag selection UI
- `ui/rich-text-editor.tsx` - TipTap editor

### New Components Needed

**About Section** (`components/about/`):
- `AboutSection.tsx` - Main section wrapper
- `AboutTabs.tsx` - Tabbed content switcher
- `SkillCard.tsx` - Individual skill display
- `ExperienceTimeline.tsx` - Timeline component
- `EducationCard.tsx` - Education entry card

**Services Section** (`components/services/`):
- `ServicesSection.tsx` - Services grid wrapper
- `ServiceCard.tsx` - Service card with icon

**Contact Section** (`components/contact/`):
- `ContactSection.tsx` - Split layout wrapper
- `ContactForm.tsx` - Form with validation
- `ContactInfo.tsx` - Info display component

**Enhanced Components**:
- `ProjectCard.tsx` - Image overlay variant
- `BlogCard.tsx` - Enhanced with metadata

## Design Token Mapping

### Trydo → Current Mapping

**Colors**:
```
Trydo Pink (#f81f58) → Current Blue-Purple Gradient
  - Primary CTA: from-blue-600 to-purple-600
  - Accent: purple-600
  - Hover: from-blue-700 to-purple-700

Trydo Black (#1e1e1e) → gray-900
Trydo Gray (#6c757d) → gray-600
Trydo Light (#f8f9fa) → slate-50
```

**Typography Scale**:
```
Hero Heading: 48px-60px → text-5xl md:text-7xl
Section Heading: 36px-42px → text-4xl
Card Title: 20px-24px → text-xl md:text-2xl
Body: 16px-18px → text-base md:text-lg
Small: 14px → text-sm
```

**Spacing System**:
```
Section Vertical: 80px-100px → py-20 (80px)
Container Padding: 20px-40px → px-4 sm:px-6 lg:px-8
Card Gap: 30px → gap-8
Element Spacing: 16px-24px → space-y-4 to space-y-6
```

**Border Radius**:
```
Cards: 8px → rounded-lg
Buttons: 6px → rounded-lg
Inputs: 6px → rounded-lg
Avatars: 50% → rounded-full
```

**Shadows**:
```
Card Default: shadow-md
Card Hover: shadow-xl hover:shadow-2xl
Subtle: shadow-sm
```

## Architecture Design

### Component Structure

```
apps/web/src/
├── components/
│   ├── sections/          # NEW: Full-width sections
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── BlogSection.tsx
│   │   └── ContactSection.tsx
│   ├── about/             # NEW: About components
│   │   ├── AboutTabs.tsx
│   │   ├── SkillCard.tsx
│   │   ├── ExperienceTimeline.tsx
│   │   └── EducationCard.tsx
│   ├── services/          # NEW: Services components
│   │   └── ServiceCard.tsx
│   ├── contact/           # NEW: Contact components
│   │   ├── ContactForm.tsx
│   │   └── ContactInfo.tsx
│   ├── ui/                # Existing shadcn/ui
│   └── [existing]/
├── app/
│   └── page.tsx           # Refactor to use sections
```

### Data Model Updates

**New Tables**:

```typescript
// services table
services {
  id: serial
  title: varchar(255)
  description: text
  icon: varchar(100)        // icon name (lucide-react)
  order: integer
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}

// skills table
skills {
  id: serial
  name: varchar(100)
  category: varchar(50)     // main_skill, award, experience, education
  description: text
  level: integer            // 1-5 proficiency
  startDate: date
  endDate: date
  organization: varchar(255)
  order: integer
  isActive: boolean
}

// contact_submissions table
contact_submissions {
  id: serial
  name: varchar(255)
  email: varchar(255)
  subject: varchar(255)
  message: text
  status: varchar(50)       // new, read, replied
  createdAt: timestamp
}
```

**Config Additions**:
```
ABOUT_INTRO: text
ABOUT_IMAGE: varchar(255)
HIRE_ME_TAGLINE: varchar(255)
HIRE_ME_DESCRIPTION: text
```

### API Design

**tRPC Routers**:

```typescript
// services.router.ts
export const servicesRouter = router({
  list: publicProcedure
    .query(async () => { /* get active services */ }),

  create: adminProcedure
    .input(serviceSchema)
    .mutation(async ({ input }) => { /* create */ }),

  // ... update, delete, reorder
});

// skills.router.ts
export const skillsRouter = router({
  listByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => { /* get by category */ }),

  // ... CRUD operations
});

// contact.router.ts
export const contactRouter = router({
  submit: publicProcedure
    .input(contactSchema)
    .mutation(async ({ input }) => { /* save & notify */ }),

  list: adminProcedure
    .query(async () => { /* list submissions */ }),
});
```

### Style System

**Globals Extensions** (`globals.css`):

```css
/* Tab component styles */
.tab-list {
  @apply flex gap-6 border-b border-gray-200;
}

.tab-trigger {
  @apply pb-3 border-b-2 border-transparent transition-all;
  @apply hover:text-purple-600 hover:border-purple-300;
}

.tab-trigger[data-state="active"] {
  @apply text-purple-600 border-purple-600 font-semibold;
}

/* Service card hover */
.service-card {
  @apply transition-all duration-300;
  @apply hover:-translate-y-2 hover:shadow-xl;
}

/* Contact form focus states */
.contact-input:focus {
  @apply ring-2 ring-purple-500 border-purple-500;
}
```

## Asset Requirements

**Images Needed**:
- About profile image (800x800px)
- Service icons (use lucide-react, no assets)
- Contact section profile image (600x800px)
- Fallback/placeholder images

**Icon Library**:
- Already using lucide-react ✓
- Service icons: Monitor, Smartphone, Code, TrendingUp, BarChart, etc.

## Responsive Breakpoints

**Strategy**:
```
Mobile: < 640px    - 1 column
Tablet: 640-1024px - 2 columns
Desktop: > 1024px  - 3 columns (projects/services/blog)
                   - 2 columns (featured items)
```

**Section Layouts**:
- Hero: Stack on mobile, split on tablet+
- About: Stack on mobile, split on desktop
- Services/Projects/Blog: 1→2→3 column progression
- Contact: Stack on mobile, split on desktop

## Performance Targets

**Metrics**:
- LCP (Largest Contentful Paint): <2.5s
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1
- TTI (Time to Interactive): <3.5s

**Optimization Strategies**:
- Lazy load images (Next.js Image)
- Code split sections (dynamic imports)
- Prefetch critical routes
- Optimize fonts (next/font)
- Minimize CSS bundle

## Accessibility Requirements

**WCAG 2.1 AA Compliance**:
- Semantic HTML (headings hierarchy)
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Color contrast ratio 4.5:1 minimum
- Alt text for all images
- Form labels and error messages
- Skip to content link

**Screen Reader Testing**:
- Test with VoiceOver (macOS)
- Test with NVDA (Windows)
- Verify landmark regions

## Deliverables

- [ ] Component inventory spreadsheet
- [ ] Design token documentation
- [ ] Component architecture diagram
- [ ] Database schema updates
- [ ] API endpoint specifications
- [ ] Asset list with specifications
- [ ] Responsive layout mockups
- [ ] Accessibility checklist

## Timeline (5 Days)

**Day 1**: Component inventory + design token mapping
**Day 2**: Database schema design + API specifications
**Day 3**: Component architecture + file structure
**Day 4**: Responsive design planning + asset prep
**Day 5**: Documentation review + phase approval

## Unresolved Questions

- Keep gradient theme or adopt flat colors?
- Static content in configs or separate CMS tables?
- About tabs: client-side state or URL params?
- Contact form: email service (Resend, SendGrid) or log only?
- Admin UI: manage services/skills or seed-only?
