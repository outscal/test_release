# Bezier Path

Custom cubic bezier curve with two control points.

## Use Cases
- Custom curved arrows
- Flowing connections
- Smooth custom paths

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_x` | number | Yes | Starting X coordinate (absolute screen position) |
| `start_y` | number | Yes | Starting Y coordinate (absolute screen position) |
| `cp1_x` | number | Yes | First control point X (absolute, influences curve near start) |
| `cp1_y` | number | Yes | First control point Y (absolute) |
| `cp2_x` | number | Yes | Second control point X (absolute, influences curve near end) |
| `cp2_y` | number | Yes | Second control point Y (absolute) |
| `end_x` | number | Yes | Ending X coordinate (absolute screen position) |
| `end_y` | number | Yes | Ending Y coordinate (absolute screen position) |

## path_params

```json
"path_params": {
  "type": "bezier",
  "start_x": 100,
  "start_y": 400,
  "cp1_x": 200,
  "cp1_y": 100,
  "cp2_x": 600,
  "cp2_y": 100,
  "end_x": 700,
  "end_y": 400
}
```
