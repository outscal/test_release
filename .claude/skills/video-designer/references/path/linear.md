# Linear Path

Straight line from point A to point B.

## Use Cases
- Laser beams
- Direct arrows
- Straight connections

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_x` | number | Yes | Starting X coordinate (absolute screen position) |
| `start_y` | number | Yes | Starting Y coordinate (absolute screen position) |
| `end_x` | number | Yes | Ending X coordinate (absolute screen position) |
| `end_y` | number | Yes | Ending Y coordinate (absolute screen position) |

## path_params

```json
"path_params": {
  "type": "linear",
  "start_x": 100,
  "start_y": 100,
  "end_x": 700,
  "end_y": 400
}
```
