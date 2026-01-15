# React Integration

## Setup

```typescript
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);
```

## Basic useGSAP Hook

```tsx
function Component() {
  const container = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.from(".box", { opacity: 0, y: 50, stagger: 0.2 });
    },
    { scope: container }
  );
  return (
    <div ref={container}>
      <div className="box">Box</div>
    </div>
  );
}
```

## Timeline with Ref

```tsx
function Component() {
  const container = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline>(null);
  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ paused: true })
        .to(".box", { x: 100, rotation: 360 })
        .to(".circle", { scale: 1.5 });
    },
    { scope: container }
  );
  return (
    <div ref={container}>
      <button onClick={() => tl.current?.play()}>Play</button>
    </div>
  );
}
```

## Event Handlers with contextSafe

```tsx
function Component() {
  const container = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: container });
  const onHover = contextSafe((el: HTMLElement) =>
    gsap.to(el, { scale: 1.1, duration: 0.3 })
  );
  return (
    <div ref={container}>
      <div onMouseEnter={(e) => onHover(e.currentTarget)}>Hover</div>
    </div>
  );
}
```

## Dependencies Array

```tsx
useGSAP(
  () => {
    gsap.to(".box", { x: position * 100 });
  },
  { scope: container, dependencies: [position] }
);
```

## ScrollTrigger in React

```tsx
useGSAP(
  () => {
    gsap.from(".section", {
      y: 100,
      opacity: 0,
      scrollTrigger: { trigger: ".section", start: "top 80%", scrub: 1 },
    });
  },
  { scope: container }
);
```

## Important Rules

- **Always use `scope`** - Limits selectors to container
- **Use `contextSafe`** for event handlers outside useGSAP callback
- **Store timelines in refs** for external control
- **Let useGSAP handle cleanup** - Don't manually kill animations
