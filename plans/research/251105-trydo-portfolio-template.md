# Research Report: Trydo Portfolio Template

**Research Date:** 2025-11-05
**Researcher:** Claude Code Agent
**Target:** Trydo portfolio design patterns, animations, component architecture

---

## Executive Summary

Trydo portfolio template showcases modern React portfolio design with focus on performance, animations, component reusability. Analysis reveals clean design system with minimalist aesthetic, bold typography, strategic color accents. Template emphasizes smooth animations, card-based layouts, responsive grid systems.

Key recommendations:
- Use GSAP (already in stack) for scroll-based animations
- Leverage shadcn/ui component variants for consistency
- Implement Intersection Observer for performance-optimized scroll triggers
- Build composable card components with hover states
- Adopt mobile-first responsive grid approach

---

## Design System Analysis

### Color Scheme

**Primary Colors:**
- **Accent:** Hot pink/magenta (#FF0066 or similar) - used sparingly for CTAs, headings
- **Text:** Dark charcoal (#1A1A1A) for primary content
- **Background:** Clean white (#FFFFFF) with subtle gray (#F5F5F5) for sections
- **Secondary:** Light gray (#E5E5E5) for borders, dividers

**Pattern:** High contrast, minimal palette emphasizing readability and professional appearance.

### Typography

**Hierarchy:**
- Hero headings: Bold, large (48px-72px), mix of weights
- Section titles: Bold (32px-48px), centered alignment
- Body: Regular weight (16px-18px), generous line height
- Accent text: Hot pink color for name/brand elements

**Font Stack:** Modern sans-serif (likely system fonts or Inter/Poppins family)

**Key Pattern:** Bold contrast between light/regular and bold weights for visual hierarchy.

### Layout Patterns

**Grid Systems:**
- Services: 3-column grid (desktop), 1-column (mobile)
- Projects: 3-column masonry-style grid
- Blog: 3-column card grid
- Contact: 2-column split (form + image)

**Spacing:**
- Section padding: Large (80px-120px vertical)
- Card spacing: Consistent gaps (24px-32px)
- Content width: Constrained max-width (~1200px)

**Breakpoints (Tailwind default):**
- Mobile: < 640px (1 column)
- Tablet: 640px-1024px (2 columns)
- Desktop: > 1024px (3 columns)

### Card Design

**Service Cards:**
- Icon: Outline style, pink accent color
- Minimal border or subtle shadow
- Hover: Scale transform, shadow increase
- Padding: Generous internal spacing

**Project Cards:**
- Full-bleed images with overlay
- Dark gradient overlay for text readability
- Hover: Image scale/zoom effect
- CTA: Subtle "View Project" link

**Blog Cards:**
- Featured image top
- Category tag overlay
- Clean white background
- Hover: Subtle lift effect

### Button Styles

**Primary CTA:**
- Pink background (#FF0066)
- White text, bold weight
- Rounded corners (4px-8px)
- Hover: Darker shade or scale

**Secondary:**
- Outlined version with pink border
- Transparent background
- Hover: Pink background fill

---

## Animation Patterns

### Recommended Animation Library: GSAP

**Rationale:**
- Already in project dependencies (gsap: ^3.13.0)
- Superior performance vs Framer Motion for scroll animations
- Free since Webflow acquisition (2024)
- Excellent Next.js 15 compatibility

### Scroll Animations

**Implementation Strategy:**

```typescript
// Centralized GSAP config
'use client'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Component usage
useGSAP(() => {
  gsap.from('.animate-in', {
    scrollTrigger: {
      trigger: '.animate-in',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2
  })

  return () => ScrollTrigger.getAll().forEach(t => t.kill())
}, [])
```

**Performance Optimizations:**
- Use `limitCallbacks: true` in ScrollTrigger config
- Call `ScrollTrigger.refresh()` after init
- Cleanup triggers on unmount
- Lazy load animations for off-screen elements

### Entry Animations

**Pattern Examples:**

1. **Fade Up:** Cards/sections fade in while moving up (y: 50 → 0)
2. **Stagger:** Sequential animation with 0.1s-0.2s delay
3. **Scale:** Service icons scale from 0.8 → 1.0
4. **Slide In:** Sections slide from left/right based on layout

**Performance Note:** Use Intersection Observer for initial visibility detection, GSAP for actual animation.

### Hover Effects

**Card Hover:**
```css
/* Tailwind classes */
.project-card {
  @apply transition-all duration-300 hover:scale-105 hover:shadow-xl;
}

/* Or GSAP for complex interactions */
onMouseEnter: () => gsap.to(ref, { scale: 1.05, duration: 0.3 })
```

**Button Hover:**
- Scale: 1.0 → 1.05
- Shadow: Increase elevation
- Background: Darken by 10%
- Duration: 200ms-300ms

**Image Hover:**
- Scale: 1.0 → 1.1 (with overflow: hidden on parent)
- Overlay: Fade in dark overlay
- Text: Slide up reveal

### Transition Patterns

**Page Transitions:** Not critical for initial MVP (Next.js 15 View Transitions experimental)

**Section Transitions:**
- Fade between states: 400ms ease-out
- Height animations: Use max-height with transition
- Avoid layout shift: Reserve space during animations

---

## Component Architecture

### Reusability Matrix

| Component | Variants | Composition | Priority |
|-----------|----------|-------------|----------|
| Card | Service, Project, Blog | High | Critical |
| Button | Primary, Secondary, Ghost | Medium | Critical |
| Section | Hero, Content, CTA | High | High |
| Grid | 1-col, 2-col, 3-col | High | High |
| Icon | Outline, Filled | Low | Medium |
| Badge | Tag, Category | Low | Medium |
| Form | Contact, Subscribe | Medium | Medium |

### Component Pattern: Composable Cards

**Base Card Component:**

```typescript
// components/ui/portfolio-card.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'transition-all duration-300',
  {
    variants: {
      variant: {
        service: 'border border-gray-200 hover:shadow-lg hover:scale-105',
        project: 'overflow-hidden group hover:shadow-2xl',
        blog: 'bg-white hover:translate-y-[-4px] hover:shadow-xl'
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
      }
    },
    defaultVariants: {
      variant: 'service',
      size: 'md'
    }
  }
)

interface PortfolioCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  icon?: React.ReactNode
  title: string
  description: string
  image?: string
}

export function PortfolioCard({
  variant,
  size,
  icon,
  title,
  description,
  image,
  className,
  ...props
}: PortfolioCardProps) {
  return (
    <Card className={cardVariants({ variant, size, className })} {...props}>
      {image && (
        <div className="overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
      <CardHeader>
        {icon && <div className="mb-4 text-pink-600">{icon}</div>}
        <h3 className="text-xl font-bold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}
```

### Integration with shadcn/ui

**Strategy:** Extend existing shadcn/ui components rather than rebuild.

**Base Components to Use:**
- `card.tsx` - Foundation for all card variants
- `button.tsx` - CTA and navigation
- `badge.tsx` - Tags and categories
- `dialog.tsx` - Project modals
- `sheet.tsx` - Mobile navigation

**Custom Components to Build:**
- `portfolio-card.tsx` - Variant wrapper
- `service-card.tsx` - Service-specific composition
- `project-card.tsx` - Project-specific composition
- `hero-section.tsx` - Hero layout
- `animated-section.tsx` - GSAP wrapper

### Props and Variants Pattern

**Variant Strategy (CVA):**

```typescript
// Centralized variants
const buttonVariants = cva(
  'font-semibold rounded-md transition-all',
  {
    variants: {
      intent: {
        primary: 'bg-pink-600 text-white hover:bg-pink-700',
        secondary: 'border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white'
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
      }
    },
    compoundVariants: [
      {
        intent: 'primary',
        size: 'lg',
        class: 'shadow-lg hover:shadow-xl'
      }
    ]
  }
)
```

---

## Technical Recommendations

### Animation Approach

**Primary: GSAP + ScrollTrigger**

**Pros:**
- Already in dependencies
- Best performance for scroll-driven animations
- Robust API with precise control
- Free commercial license (2024+)
- Excellent Next.js integration via useGSAP hook

**Implementation:**
1. Create `/lib/gsap.ts` config file
2. Register ScrollTrigger globally
3. Use `useGSAP()` hook in components
4. Implement cleanup functions

**Secondary: CSS Transitions**

For simple hover states, use Tailwind transitions:
- `transition-all duration-300`
- `hover:scale-105`
- Hardware-accelerated (transform, opacity)

### Image Optimization

**Strategy:**
- Use Next.js Image component
- Lazy load below-fold images
- Provide blur placeholders
- Optimize images at build time

```typescript
import Image from 'next/image'

<Image
  src="/projects/project-1.jpg"
  alt="Project Name"
  width={600}
  height={400}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Performance Considerations

**Animation Performance:**
- Limit concurrent ScrollTriggers (< 20)
- Use will-change sparingly
- Prefer transform/opacity over layout properties
- Debounce resize listeners

**Component Performance:**
- Memoize heavy card components
- Virtualize long grids (react-window if > 50 items)
- Code-split animation components
- Lazy load GSAP on scroll

**Metrics to Monitor:**
- Time to Interactive (TTI) < 3s
- First Contentful Paint (FCP) < 1.5s
- Cumulative Layout Shift (CLS) < 0.1
- Animation frame rate: 60fps

### Responsive Strategy

**Mobile-First Tailwind Approach:**

```typescript
<div className="
  grid grid-cols-1 gap-6
  md:grid-cols-2 md:gap-8
  lg:grid-cols-3 lg:gap-10
">
  {/* Cards */}
</div>
```

**Breakpoint Usage:**
- `sm:` (640px) - Small tablets
- `md:` (768px) - Tablets, 2-column layouts
- `lg:` (1024px) - Desktop, 3-column layouts
- `xl:` (1280px) - Large desktop, max-width containers

---

## Implementation Notes

### Phase 1: Foundation (Week 1)

1. Setup GSAP configuration
2. Create base card component with variants
3. Implement grid system
4. Setup color tokens in Tailwind config

### Phase 2: Components (Week 2)

1. Build service cards with icons
2. Build project cards with image hover
3. Build blog cards
4. Implement button variants

### Phase 3: Animations (Week 3)

1. Add scroll-triggered fade-in animations
2. Implement card hover effects
3. Add stagger animations for grids
4. Optimize and test performance

### Phase 4: Polish (Week 4)

1. Fine-tune animation timings
2. Add loading states
3. Implement skeleton screens
4. Cross-browser testing

### File Structure

```
apps/web/src/
├── components/
│   ├── ui/                    # shadcn/ui base
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   └── badge.tsx
│   ├── portfolio/             # Custom components
│   │   ├── portfolio-card.tsx
│   │   ├── service-card.tsx
│   │   ├── project-card.tsx
│   │   ├── hero-section.tsx
│   │   └── animated-section.tsx
│   └── sections/              # Page sections
│       ├── about-section.tsx
│       ├── services-section.tsx
│       ├── projects-section.tsx
│       └── contact-section.tsx
├── lib/
│   ├── gsap.ts               # GSAP config
│   └── animations.ts         # Reusable animations
└── app/
    └── page.tsx              # Home page composition
```

### Configuration Updates

**Tailwind Config:**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF0066',
          dark: '#CC0052',
          light: '#FF3385'
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out'
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(50px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      }
    }
  }
}
```

---

## Resources & References

### Official Documentation
- [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Tailwind CSS Grid](https://tailwindcss.com/docs/grid-template-columns)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

### Key Articles (2024-2025)
- "Optimizing GSAP Animations in Next.js 15" - Thomas Augot (Medium, Sept 2024)
- "Guide to using GSAP ScrollTrigger in Next.js" - Jayanti (Medium, 2024)
- "The Anatomy of shadcn/ui Components" - Vercel Academy (2024)
- "Card Hover Effects in Tailwind CSS" - TailwindTap (2024)

### Code Examples
- [modern-portfolio](https://github.com/sanidhyy/modern-portfolio) - Next.js + Framer Motion
- [animated-portfolio-framer-motion](https://github.com/ikramdeveloper/animated-portfolio-framer-motion)
- [GSAP ScrollTrigger Examples](https://gsapify.com/gsap-scrolltrigger) - 20+ examples

### Component Libraries
- [shadcn/ui](https://ui.shadcn.com/) - Base component system
- [Hover.dev Cards](https://www.hover.dev/components/cards) - Animated card examples
- [TailwindFlex](https://tailwindflex.com/) - Tailwind component examples

---

## Unresolved Questions

1. **Animation Complexity:** Need to validate GSAP bundle size impact on initial load. Consider code-splitting if > 50kb.

2. **Image Format:** Confirm whether to use WebP, AVIF, or both for project images. Need to test browser support matrix.

3. **Dark Mode:** Not observed in screenshot. Confirm if dark mode is required for this implementation.

4. **Accessibility:** Need to verify animation preferences (prefers-reduced-motion) and screen reader compatibility for animated elements.

5. **Project Modal:** Screenshot shows project cards but unclear if click opens modal or navigates to detail page. Need clarification.

6. **Contact Form:** Backend endpoint not specified. Confirm if using tRPC, API route, or third-party service (EmailJS, etc.).

---

**Research completed:** 2025-11-05
**Total sources consulted:** 15+ web resources, 1 screenshot analysis
**Recommended next steps:** Review findings → Create implementation plan → Begin Phase 1
