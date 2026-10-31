# Changelog

## 0.1.0

- `createStage` sets up an orthographic three.js renderer that fills its container, follows
  resizes and renders only when `requestRender` is called.
- Camera presets `isometric` (true isometric), `dimetric` (2:1 pixel-art tiles) and `tilted`
  (60° top-down), or any custom `{ elevation, azimuth }`.
- `pixelScale` renders at a fraction of the resolution and upscales with hard pixel edges.
