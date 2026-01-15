---
name: gsap-animation
description: Create high-performance web animations using GSAP (GreenSock Animation Platform). Use when building scroll-triggered animations, page transitions, text reveals, SVG animations, hover effects, timeline sequences, stagger effects, or React component animations. Covers core tweens, ScrollTrigger plugin, useGSAP hook for React, and common animation patterns.
---

# GSAP Animation Skill

Build professional-grade animations for modern web applications.

## Quick Setup

```bash
npm install gsap @gsap/react
```

```typescript
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
```

## Core Concepts

### Tweens

- `gsap.to()` - Animate TO specified values
- `gsap.from()` - Animate FROM specified values
- `gsap.fromTo()` - Define both start and end values

### Timelines

- `gsap.timeline()` - Sequence multiple animations
- Chain with `.to()`, `.from()`, `.fromTo()`
- Use position parameter: `"<"`, `">"`, `"+=0.5"`, `"-=0.2"`

### Common Properties

- `duration`, `delay`, `ease`, `stagger`
- `x`, `y`, `rotation`, `scale`, `opacity`
- `autoAlpha` (combines opacity + visibility)

## References

| Topic              | File                                                      | When to Use               |
| ------------------ | --------------------------------------------------------- | ------------------------- |
| Core Animations    | [core-animations.md](references/core-animations.md)       | Tweens, timelines, easing |
| ScrollTrigger      | [scroll-trigger.md](references/scroll-trigger.md)         | Scroll-based animations   |
| React Integration  | [react-integration.md](references/react-integration.md)   | useGSAP hook, cleanup     |
| Animation Patterns | [animation-patterns.md](references/animation-patterns.md) | Common recipes & effects  |

## Best Practices

1. **Always register plugins** before using them
2. **Use `useGSAP` hook** in React for automatic cleanup
3. **Scope animations** with container refs in React
4. **Use `autoAlpha`** instead of `opacity` alone
5. **Set `will-change`** on animated elements for GPU acceleration
6. **Test with `markers: true`** during ScrollTrigger development
