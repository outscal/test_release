---
name: asset-creator
description: "This skill helps in drawing any visuals. It is a versatile skill and covers every important aspect to draw anything."
---

# Asset Creator Skill

## CRITICAL: Asset Manifest Priority

**If you receive an `asset_manifest`:**
- **DO NOT create new assets** that already exist in the manifest
- Use the pre-generated assets from the provided paths
- Only create NEW assets that are NOT in the manifest
## Core Responsibility

Create SVG assets using fetched icons and/or custom SVG elements.

- **SVG code only** - No React, no JavaScript, slight animations
- **Transparent background** - No background unless explicitly requested

---
## **References that you will need to create perfect assets**
**Understand Requirements** → Determine what icons/shapes/illustrations/graphics are needed

### **Fetch Icons** → To get references from icons before creating any assets
Read [fetching-icons.md](./references/fetching-icons.md)

### **Learn SVG Basics** → Use whenever SVGs need to be created or used
Read [svg-fundamentals.md](./references/svg-fundamentals.md)

### **Position Elements** → Important to position anything in the scene
Read [viewbox-positioning.md](./references/viewbox-positioning.md)

### **Path Creation** → To create any lines, curves, paths, this is important that you use the learnings from this
Read [path-creation.md](./references/path-creation.md)

### **Animations** → Use whenever any object might need animation
Read [animations.md](./references/animations.md) for details about creating animations.

### **Character Creation** → Whenver scene needs characters, use this
Read [primitive-characters.md](./references/character/primitive-characters.md)

---

## Reference Map

### Core References
`./references/fetching-icons.md` — Search & retrieve SVG icons from Bootstrap, Font Awesome, Game Icons via MCP tools
`./references/svg-fundamentals.md` — Core SVG syntax: shapes, paths, transforms, gradients, clipping, styling
`./references/viewbox-positioning.md` — ViewBox sizing, coordinates, icon transform patterns, attachment point calculations
`./references/path-creation.md` — Generate SVG path `d` attributes using Python scripts
`./references/animations.md` — Master animation reference for rotation, path-following, path-drawing
`./references/character/primitive-characters.md` — Cute geometric mascot characters with consistent proportions

### Path Types
`./references/paths/parabolic.md` — Projectile arcs for jumps, throws, ballistic motion
`./references/paths/circular.md` — Circular orbits and spinning motions
`./references/paths/elliptical.md` — Oval/elliptical orbit paths
`./references/paths/sine_wave.md` — Wavy, snake-like undulating movements
`./references/paths/spiral.md` — Tornado, galaxy, swirl patterns
`./references/paths/s_curve.md` — Smooth S-shaped transitions
`./references/paths/linear.md` — Simple straight line A→B paths
`./references/paths/arc.md` — Single arc segment curves
`./references/paths/bezier.md` — Custom cubic bezier curves
`./references/paths/zigzag.md` — Sharp angular back-and-forth patterns
`./references/paths/bounce.md` — Bouncing ball trajectory physics
`./references/paths/spline.md` — Smooth curve through N control points

### Animations
`./references/animations/rotation-animations.md` — All rotation patterns with pivot point calculations
`./references/animations/path-following.md` — Objects following paths via `<animateMotion>` + `<mpath>`
`./references/animations/path-drawing.md` — Path "drawing itself" using stroke-dasharray technique

### Pivot Types
`./references/animations/pivots/end-pivot-examples.md` — Rotation from fixed anchor (clocks, pendulums, doors)
`./references/animations/pivots/center-pivot-examples.md` — Spinning around center (fans, wheels, gears)
`./references/animations/pivots/edge-point-pivot-examples.md` — Rotation from arbitrary perimeter points
`./references/animations/pivots/attached-objects-examples.md` — Parent rotates with attached children (seesaws, Ferris wheels)

### Character
`./references/character/emotions.md` — Facial expressions and clipPath-based eye blink animations

---

## Output Format

Always output a complete, self-contained SVG. Choose viewBox based on use case (see [viewbox-positioning.md](./references/viewbox-positioning.md)):

```svg
<svg viewBox="0 0 [width] [height]" xmlns="http://www.w3.org/2000/svg">
  <!-- SVG elements here -->
</svg>
```