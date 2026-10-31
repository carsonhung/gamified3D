# gamified3d-stage

An orthographic three.js stage for 2.5D game interfaces. It creates the renderer, scene and
camera, fills a container, follows its size, and renders only when something asks it to.

```bash
npm i gamified3d-stage three
```

```ts
import { createStage } from 'gamified3d-stage';

const stage = createStage({
  container: document.querySelector('#stage')!,
  preset: 'isometric',
  viewSize: 10,
  background: null,
});

stage.scene.add(myBoard);
stage.requestRender();
```

The container must have a size (for example a fixed height or a grid cell). The canvas fills it.

## Camera presets

| Preset | View |
|---|---|
| `isometric` | True isometric. A ground tile is √3 times as wide as it is tall. |
| `dimetric` | Pixel-art 2:1. A ground tile is twice as wide as it is tall. |
| `tilted` | Looks down at 60° from the front, like a tilted board game. |

Pass `{ elevation, azimuth }` in radians for any other angle. Change it later with
`stage.setPreset()`.

## Options

`viewSize` is how many world units fit from the bottom to the top of the canvas. `target` is
the point the camera looks at. `pixelScale` (a whole number) renders at a fraction of the
resolution and upscales with hard edges, so the scene matches gamifiedUI's pixel art; when it is
1, `maxPixelRatio` caps the device pixel ratio. `background: null` leaves the canvas transparent.

## Rendering on demand

The stage does not run a loop. Call `requestRender()` after changing the scene; calls in the same
frame are merged. To animate, register a handler with `onBeforeRender` and call `requestRender()`
from it until the animation ends.

`dispose()` stops rendering and removes the canvas. Geometries, materials and textures you added
to the scene are yours to dispose.

## License

[Apache License 2.0](LICENSE). See [NOTICE](NOTICE).
