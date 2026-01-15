# Animation Patterns

## Hero Section Reveal

```javascript
const tl = gsap.timeline();
tl.from(".hero-title", { y: 100, opacity: 0, duration: 1 })
  .from(".hero-subtitle", { y: 50, opacity: 0 }, "-=0.5")
  .from(".hero-cta", { scale: 0.8, opacity: 0 }, "-=0.3");
```

## Staggered Cards on Scroll

```javascript
gsap.from(".card", {
  y: 60,
  opacity: 0,
  stagger: 0.15,
  duration: 0.8,
  ease: "power3.out",
  scrollTrigger: { trigger: ".cards-container", start: "top 75%" },
});
```

## Text Split Animation

```javascript
const split = SplitText.create(".title", { type: "chars, words" });
gsap.from(split.chars, { y: 100, opacity: 0, stagger: 0.02, ease: "back.out" });
```

## Magnetic Button

```javascript
const btn = document.querySelector(".magnetic-btn");
btn.addEventListener("mousemove", (e) => {
  const rect = btn.getBoundingClientRect();
  gsap.to(btn, {
    x: (e.clientX - rect.left - rect.width / 2) * 0.3,
    y: (e.clientY - rect.top - rect.height / 2) * 0.3,
    duration: 0.3,
  });
});
btn.addEventListener("mouseleave", () => {
  gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
});
```

## Parallax Layers

```javascript
gsap.to(".layer-1", { y: -200, scrollTrigger: { scrub: true } });
gsap.to(".layer-2", { y: -100, scrollTrigger: { scrub: true } });
```

## Reveal on Scroll (Batch)

```javascript
ScrollTrigger.batch(".reveal", {
  onEnter: (el) => gsap.from(el, { y: 60, opacity: 0, stagger: 0.1 }),
  once: true,
});
```

## Page Transition

```javascript
function pageOut() {
  return gsap
    .timeline()
    .to(".page-content", { opacity: 0, y: -50, duration: 0.4 })
    .to(".page-overlay", {
      scaleY: 1,
      transformOrigin: "bottom",
      duration: 0.5,
    });
}
```

## Loading Dots

```javascript
const loader = gsap.timeline({ repeat: -1 });
loader
  .to(".dot", { y: -20, stagger: 0.1, duration: 0.3, ease: "power2.out" })
  .to(".dot", { y: 0, stagger: 0.1, duration: 0.3, ease: "bounce.out" });
```

## Infinite Marquee

```javascript
gsap.to(".marquee-inner", {
  xPercent: -50,
  repeat: -1,
  duration: 20,
  ease: "none",
});
```

## SVG Path Drawing

```javascript
gsap.from(".svg-path", { drawSVG: "0%", duration: 2, ease: "power2.inOut" });
```
