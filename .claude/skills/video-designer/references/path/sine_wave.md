# Sine Wave Path

Smooth oscillating wave pattern.

## Use Cases
- Snake movement
- Water waves
- Oscillations

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_x` | number | Yes | Starting X coordinate (absolute screen position) |
| `start_y` | number | Yes | Starting Y coordinate (absolute screen position) |
| `wavelength` | number | Yes | Distance for one complete wave cycle |
| `amplitude` | number | Yes | Height of wave peaks from center line |
| `cycles` | number | Yes | Number of complete wave cycles |

## path_params

```json
"path_params": {
  "type": "sine_wave",
  "start_x": 280,
  "start_y": 840,
  "wavelength": 100,
  "amplitude": 12,
  "cycles": 6
}
```
