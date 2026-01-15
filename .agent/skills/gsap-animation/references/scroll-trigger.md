# ScrollTrigger

## Setup

```javascript
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
```

## Basic Trigger

```javascript
gsap.to(".box", {
  x: 500,
  scrollTrigger: {
    trigger: ".box",
    start: "top 80%", // trigger-start viewport-start
    end: "bottom 20%",
    markers: true, // Debug markers
  },
});
```

## Scrub Animation

```javascript
gsap.to(".box", {
  x: 500,
  rotation: 360,
  scrollTrigger: {
    trigger: ".container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1, // 1s smooth catch-up (true = immediate)
  },
});
```

## Pin Element

```javascript
gsap.to(".panel", {
  x: "100%",
  scrollTrigger: {
    trigger: ".panel",
    pin: true,
    start: "top top",
    end: "+=500",
    scrub: true, // Pin for 500px scroll
  },
});
```

## Timeline with ScrollTrigger

```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".section",
    start: "top center",
    end: "bottom center",
    scrub: 1,
    snap: { snapTo: "labels", duration: { min: 0.2, max: 0.5 } },
  },
});
tl.addLabel("start")
  .from(".title", { y: 50, opacity: 0 })
  .addLabel("content")
  .from(".content", { y: 30, opacity: 0 })
  .addLabel("end");
```

## Horizontal Scroll

```javascript
const sections = gsap.utils.toArray(".panel");
gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: ".container",
    pin: true,
    scrub: 1,
    snap: 1 / (sections.length - 1),
    end: () => "+=" + document.querySelector(".container").offsetWidth,
  },
});
```

## Position Reference

| Value             | Meaning                           |
| ----------------- | --------------------------------- |
| `"top top"`       | Trigger top at viewport top       |
| `"top 80%"`       | Trigger top at 80% down viewport  |
| `"center center"` | Center at center                  |
| `"+=500"`         | 500px after start                 |
| `"bottom bottom"` | Trigger bottom at viewport bottom |
