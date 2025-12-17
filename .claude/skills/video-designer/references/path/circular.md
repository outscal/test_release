# Circular Path

Complete circle path around a center point.

## Use Cases
- Orbits
- Spinning paths
- Rotation indicators

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `center_x` | number | Yes | Center X coordinate (absolute screen position) |
| `center_y` | number | Yes | Center Y coordinate (absolute screen position) |
| `radius` | number | Yes | Circle radius in pixels |

## path_params

```json
"path_params": {
  "type": "circular",
  "center_x": 400,
  "center_y": 300,
  "radius": 150
}
```
