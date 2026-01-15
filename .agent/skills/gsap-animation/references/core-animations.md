# Core Animations

## Tweens

### gsap.to() - Animate TO values

```javascript
gsap.to(".box", {
  x: 200,
  rotation: 360,
  duration: 1,
  ease: "power2.out",
});
```

### gsap.from() - Animate FROM values

```javascript
gsap.from(".box", {
  opacity: 0,
  y: 50,
  duration: 0.8,
  stagger: 0.1,
});
```

### gsap.fromTo() - Define start AND end

```javascript
gsap.fromTo(
  ".box",
  { opacity: 0, scale: 0.5 },
  { opacity: 1, scale: 1, duration: 0.6 }
);
```

## Timelines

### Basic Timeline

```javascript
const tl = gsap.timeline();
tl.to(".box1", { x: 100, duration: 0.5 })
  .to(".box2", { x: 100, duration: 0.5 })
  .to(".box3", { x: 100, duration: 0.5 });
```

### Position Parameter

```javascript
const tl = gsap.timeline();
tl.to(".a", { x: 100 })
  .to(".b", { y: 50 }, "<") // Same time as previous
  .to(".c", { rotation: 360 }, ">") // After previous ends
  .to(".d", { scale: 1.5 }, "+=0.5") // 0.5s after previous
  .to(".e", { opacity: 0 }, "-=0.2"); // 0.2s before previous ends
```

### Timeline Defaults

```javascript
const tl = gsap.timeline({
  defaults: { duration: 0.5, ease: "power2.inOut" },
});
tl.to(".a", { x: 100 })
  .to(".b", { y: 50 })
  .to(".c", { rotation: 360, duration: 1 }); // Override default
```

## Stagger Effects

```javascript
gsap.from(".card", {
  y: 100,
  opacity: 0,
  stagger: {
    each: 0.1, // Time between each
    from: "center", // "start", "end", "center", "edges", "random"
    grid: "auto", // For grid layouts
    ease: "power2.out",
  },
});
```

## Common Eases

| Ease       | Effect                        |
| ---------- | ----------------------------- |
| `power1-4` | Subtle to strong acceleration |
| `back`     | Slight overshoot              |
| `elastic`  | Bouncy, spring-like           |
| `bounce`   | Bouncing effect               |
| `expo`     | Extreme acceleration          |
| `circ`     | Circular motion               |

Add suffix: `.in`, `.out`, `.inOut`
