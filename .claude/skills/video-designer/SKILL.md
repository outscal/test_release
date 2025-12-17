---
name: video-designer
description: Expert video designer that generates comprehensive design specifications based on video direction. Creates precise JSON schemas for scenes including elements, animations, timing, and styling following strict design guidelines.
---

# Video Designer

## Overview

This skill provides design guidelines for creating consistent, high-quality video content by following a specific schema. Load the relevant reference files based on what needs to be designed.

Alway follow the references
## Always read general guidelines
**Reference:** [general-guidelines.md](./references/general-guidelines.md)


### Characters
Whenever characters need to be drawn, read this
**Reference:** [characters.md](./references/characters.md)

### Path Creation
read the following file to design a path or anything related to paths, lines or arrows.
**Reference:** [path-guidelines.md](./references/path-guidelines.md)

### 3D Shapes
Whenever 3D shapes (cubes, boxes, etc.) need to be drawn, read this
**Reference:** [3d-shapes.md](./references/3d-shapes.md)

### Text
Use the text elements when you need to display any text on the scene, read these
**Reference:** Read this to understand the fundamentals of the text elements. [text-guidelines.md](./references/text/text-guidelines.md)

---

## Reference Map

### Core References
`./references/general-guidelines.md` — Coordinate system, output schema, instances pattern, grouping, content requirements
`./references/characters.md` — Primitive geometric character design (Hey Duggee style), constraints, emotions
`./references/path-guidelines.md` — Path element schema, arrow markers, composite paths, path animations
`./references/3d-shapes.md` — Design 3D cubes/boxes as single unified elements (not separate faces)
`./references/text/text-guidelines.md` — Text styling, containers, backgrounds, typography best practices

### Path Types
`./references/path/arc.md` — Single curved arc segment for door swings, partial circles
`./references/path/bezier.md` — Custom cubic bezier with two control points for flowing curves
`./references/path/bounce.md` — Bouncing trajectory with decreasing height for ball physics
`./references/path/circular.md` — Complete circle around center point for orbits, spinning
`./references/path/elliptical.md` — Oval-shaped closed path for stretched orbits
`./references/path/linear.md` — Straight line A→B for laser beams, direct arrows
`./references/path/parabolic.md` — Arc that rises then falls for projectiles, jumps
`./references/path/s_curve.md` — Smooth S-shaped transition for winding roads
`./references/path/sine_wave.md` — Smooth oscillating wave for snake movement, water
`./references/path/spiral.md` — Inward/outward spiral for tornado, galaxy, swirls
`./references/path/spline.md` — Smooth curve through multiple points for organic paths
`./references/path/zigzag.md` — Sharp angular back-and-forth for lightning, jagged paths

### Text
`./references/text/text-schema.md` — Text element JSON schema with all available properties
