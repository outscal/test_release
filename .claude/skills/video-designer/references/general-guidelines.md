# General Guidelines

## Coordinate System

```
COORDINATE SYSTEM
Origin: Top-left corner (0, 0)
X-axis: Increases rightward →
Y-axis: Increases downward ↓

FOR SHAPES/TEXT/ICONS:
  Position: Always refers to element's CENTER point

FOR PATHS:
  All coordinates are ABSOLUTE screen positions
  No position/size fields needed (implied by path coordinates)

ROTATION
0° = pointing up
Positive = clockwise
Negative = counter-clockwise

EXAMPLE (1920×1080 viewport)
Screen center:        x = 960,  y = 540
Top-center:           x = 960,  y = 100
Bottom-left quadrant: x = 480,  y = 810
Right edge center:    x = 1820, y = 540
```

## Output Schema

Your output must be a valid JSON object matching this schema:
```json
{
  "scene": 0,
  "startTime": 0,
  "endTime": 7664,

  "video_metadata": {
    "viewport_size": "1920x1080",
    "backgroundColor": "#HEXCOLOR",
    "layout": {
      "strategy": "three-column|centered|freeform"
    }
  },

  "elements": [
    {
      "id": "unique_element_id",
      "type": "shape|text|character|icon",
      "enterOn": 0,
      "exitOn": 7664,
      "content": "CRITICAL: Complete visual specification (see content_field_requirements)",
      "x": 960,
      "y": 540,
      "width": 200,
      "height": 200,
      "rotation": 0,
      "scale": 1,
      "opacity": 1,
      "fill": "#HEXCOLOR",
      "stroke": "#HEXCOLOR",
      "strokeWidth": 2,
      "fontSize": 48,
      "fontWeight": "700",
      "textAlign": "center",
      "lineHeight": 1.2,
      "zIndex": 1,
      "animation": {
        "entrance": {
          "type": "pop-in|fade-in|slide-in-left|slide-in-right|draw-on|cut" etc,
          "duration": 300
        },
        "exit": {
          "type": "fade-out|pop-out|slide-out-left|slide-out-right",
          "duration": 200
        },
        "actions": [
          {
            "on": 2000,
            "duration": 500,
            "targetProperty": "opacity",
            "value": 1,
            "easing": "ease-in-out"
          }
        ]
      }
    }
  ]
}
```

**Required fields per element:** `id`, `type`, `enterOn`, `exitOn`, `content`, `zIndex`
**Optional fields:** `animation` (but recommended for visual engagement)

## Multiple Instances Pattern

When you need multiple similar elements with only a few varying properties, use the `instances` pattern to avoid duplication and reduce token count.

### Syntax

All base properties go at the root level. The `instances` array specifies overrides for each copy.

```json
{
  "id": "arrow",
  "type": "shape",
  "content": "Right-pointing arrow",
  "enterOn": 1000,
  "exitOn": 5000,
  "x": 100,
  "y": 200,
  "width": 50,
  "height": 50,
  "fill": "#3B82F6",
  "opacity": 1,
  "instances": [
    { "useDefaults": true },
    { "x": 200 },
    { "x": 300, "fill": "#FF5722" },
    { "y": 400 }
  ]
}
```

**This creates 4 elements:**
- `arrow_0`: x=100, y=200, fill=#3B82F6 (uses all base values)
- `arrow_1`: x=200, y=200, fill=#3B82F6 (overrides only x)
- `arrow_2`: x=300, y=200, fill=#FF5722 (overrides x and fill)
- `arrow_3`: x=100, y=400, fill=#3B82F6 (overrides only y)

### Rules

1. **First instance is always `{ "useDefaults": true }`** - Represents an element with no overrides (uses all base values)
2. **Shallow merge only** - Instance properties directly override base properties (no deep merging)
3. **Field ordering** - `instances` must be the **last field** in the object
4. **IDs generated automatically** - Pattern: `${baseId}_${index}` (e.g., `arrow_0`, `arrow_1`)
5. **Works on any level** - Can be used on elements, `path_params`, or any nested object
6. **Array length = instance count** - The array length determines how many copies are created

### When to Use

✅ **Use instances when:**
- You need **2 or more** similar elements (this is the minimum requirement)
- Multiple similar elements with only a few varying properties
- Properties follow a pattern (grid positions, varying sizes, different colors)
- Reduces verbosity and maintains consistency

❌ **Don't use instances when:**
- Elements are significantly different from each other
- Overrides are more complex than the base definition

### Example: Grid of dots (3×3)

```json
{
  "id": "dot",
  "type": "shape",
  "content": "Small circular dot",
  "enterOn": 1000,
  "exitOn": 5000,
  "x": 660,
  "y": 290,
  "width": 30,
  "height": 30,
  "fill": "#3B82F6",
  "opacity": 1,
  "instances": [
    { "useDefaults": true },
    { "x": 960, "y": 290 },
    { "x": 1260, "y": 290 },
    { "x": 660, "y": 540 },
    { "x": 960, "y": 540 },
    { "x": 1260, "y": 540 },
    { "x": 660, "y": 790 },
    { "x": 960, "y": 790 },
    { "x": 1260, "y": 790 }
  ]
}
```

Creates a 3×3 grid of dots with 300px horizontal and 250px vertical spacing:

```
        x=660    x=960    x=1260
       ┌────────┬────────┬────────┐
y=290  │ dot_0  │ dot_1  │ dot_2  │
       ├────────┼────────┼────────┤
y=540  │ dot_3  │ dot_4  │ dot_5  │
       ├────────┼────────┼────────┤
y=790  │ dot_6  │ dot_7  │ dot_8  │
       └────────┴────────┴────────┘
```

- **Row 1**: y=290, x varies (660, 960, 1260)
- **Row 2**: y=540, x varies (660, 960, 1260)
- **Row 3**: y=790, x varies (660, 960, 1260)
- Each instance explicitly specifies both x and y coordinates for clarity

**Row/Column-Specific Properties:** If individual rows need different properties (e.g., different colors per row) or individual columns need different properties (e.g., different sizes per column), specify those properties directly in each instance override alongside the coordinates.

### Example: Path parameters with variations

```json
{
  "id": "arc_element",
  "type": "path",
  "enterOn": 1000,
  "exitOn": 5000,
  "x": 400,
  "y": 300,
  "stroke": "#FFFFFF",
  "strokeWidth": 3,
  "path_params": {
    "type": "arc",
    "start_x": 100,
    "start_y": 300,
    "end_x": 400,
    "end_y": 300,
    "radius": 2,
    "sweep": 1,
    "instances": [
      { "useDefaults": true },
      { "radius": 4 },
      { "start_x": 200, "end_x": 500 },
      { "sweep": 0 }
    ]
  }
}
```

Creates 4 arc paths with different radii, positions, and directions while sharing the base coordinates.

### Benefits

- **Logical organization** - Related elements stay together (e.g., all parts of a smartphone)
- **Simplified management** - Transform entire groups at once (move, rotate, scale)
- **Shared timing** - Parent `enterOn`/`exitOn` applies to all children unless overridden
- **Reduced repetition** - Common properties defined at parent level

### When to Use Groups

✅ **Use groups when:**
- Multiple elements logically belong together (parts of an icon, device, or object)
- Elements share common timing or transformations
- Scene has many elements that need organization
- Elements form a composite object (phone = body + screen + buttons)

❌ **Don't use groups when:**
- Single standalone element
- Elements are unrelated or independent
- No shared timing or transformation needed

### Group Properties

Groups support these properties:
- **Timing:** `enterOn`, `exitOn` (inherited by children unless overridden)
- **Transform:** `x`, `y`, `rotation`, `scale` (applied to entire group)
- **Animation:** `entrance`, `exit` (for the group as a whole)

Individual children can override timing and have their own animations.

### CRITICAL: Timing Values Must Be Absolute

**All timing values (`enterOn`, `exitOn`, `action.on`) must use absolute video timestamps, NOT relative scene timestamps.**

Given:
- `scene.startTime = 18192` (absolute video time)
- Audio transcript shows word "dust" at `1777ms` (relative to scene start)

Your timing should be:
```json
"enterOn": 19969,    // 18192 + 1777 = absolute video time
"exitOn": 24589      // matches scene.endTime (absolute)
```

**Formula:** `absolute_time = scene.startTime + audio_relative_time`

## Content Field Requirements

The `content` field is the most critical part. It must answer ALL of these:

| Aspect | What to Specify | Example |
|--------|-----------------|---------|
| **Shape/Form** | Exact geometry, proportions | "Asymmetrical rounded blob—right lobe shorter, left lobe extends 2x downward" |
| **Visual Details** | Colors, textures, features | "Deep orange center (#E65100) fading to bright orange (#FF9800) edges, 3 subtle lighter spots" |
| **Face/Expression** | If character: eyes, mouth, emotion | "Wide white eyes with violet pupils, V-shaped pink eyebrows angled inward expressing anger" |
| **Position Context** | Where in frame, relative to what | "Centered in belly area of silhouette, taking 75% of belly's width" |
| **Initial State** | Starting appearance | "Begins as small concentrated core at liver's center" |
| **Transformations** | What changes and how | "On inhale: body compresses, eyes shrink, mouth tightens to small 'o'; on exhale: expands, eyes widen, mouth stretches to tall oval" |
| **Interaction** | How it relates to other elements | "Scales at same rate as silhouette to maintain relative position inside belly" |

**Precision Test**: Could someone draw this without seeing the original? If uncertain, add more detail.

## Design Process

### Phase 1: Extract Design System from Example

Before designing anything, analyze the example to establish your style guide:

**1.1 Global Properties**
- Background color
- Layout strategy

**1.2 Typography**
Document font styles and calculate proportional sizes (fontSize ÷ viewport_height).

**1.3 Animation Library**
Document each animation type with duration:
```
pop-in: Xms
fade-in: Xms
scale-grow: Xms
color-transition: Xms
```

**1.4 Visual Personality**
| Attribute | Example's Approach |
|-----------|-------------------|
| Mood | (playful/serious/technical) |
| Shapes | (rounded/sharp, thick/thin strokes) |
| Characters | (Kawaii faces, googly eyes, expressive) |
| Motion | (organic wobbles, breathing animations) |
| Metaphors | (how abstract concepts become visual) |

### Phase 2: Design the New Scene

**2.1 Parse Narrative**
Reconstruct sentences from transcript. Identify:
- Key moments needing visual emphasis
- Natural timing beats for element entrances

**2.2 Identify Elements**
From scene_direction, list:
- Primary elements (must have)
- Supporting elements (enhance clarity)
- Labels/text (identify concepts)

**2.3 Design Each Element**
For every element:
1. Write complete `content` description (see content_field_requirements)
2. Calculate exact position and size
3. Assign zIndex for layer order
4. Set timing synced to transcript
5. Define entrance/exit animations
6. Specify any mid-scene actions

**2.4 Sync to Transcript**
Audio timestamps are relative to scene start. Convert to absolute video time:
```
Audio: "ball" at 4708ms (relative)
Scene: startTime = 7000ms (absolute)
Element enterOn: 7000 + 4600 = 11600ms (absolute, with anticipation)

Audio: "bat" at 5908ms (relative)
Element enterOn: 7000 + 5800 = 12800ms (absolute, with anticipation)
```
**Always add scene.startTime to audio timestamps.**

**2.5 Verify Layout**
Check for overlaps by calculating edges:
```
Element A: center(400, 540), size(200, 300)
  → x: [300, 500], y: [390, 690]
Element B: center(700, 540), size(200, 300)  
  → x: [600, 800], y: [390, 690]
✓ No overlap (A ends at x=500, B starts at x=600)
```