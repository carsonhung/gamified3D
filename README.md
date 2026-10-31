# gamified3D

A framework for building 2.5D game-style interfaces on the web with three.js. It is the
companion to [gamifiedUI](https://github.com/carsonhung/gamifiedUI): gamifiedUI provides the
CSS components (panels, buttons, bars, icons), and gamified3D provides the 2.5D stage they live
in, such as isometric boards, tilted menus, world-anchored labels and pickable objects.

The focus is UI and UX, not game worlds. Every module answers a question you hit when building
a 2.5D interface: how the camera is set up, how a pointer or a keyboard picks an object, how a
DOM panel follows a 3D point, how things move without breaking reduced motion, and how a screen
reader understands the scene.

## Planned modules

- **Stage**: renderer, resize, pixel ratio and render-on-demand, with isometric, dimetric and
  tilted-top-down camera presets.
- **Grid**: tile coordinates, snapping and world-to-tile conversion for boards and maps.
- **Interaction**: hover, select and drag through raycasting, with the same actions on touch,
  keyboard and gamepad.
- **Anchors**: gamifiedUI DOM elements (labels, tooltips, health bars) pinned to 3D positions.
- **Motion**: stepped and smooth tweens that read gamifiedUI's motion tokens and stop under
  reduced motion.
- **Camera controls**: pan, zoom and 90° snapped rotation with limits.
- **Accessibility**: announcements, scene descriptions and focus management beyond what the
  interaction module's hidden buttons already give.

## Status

| Package | State |
|---|---|
| [`gamified3d-stage`](packages/gamified3d-stage) | 0.1.0, built, not yet on npm |
| [`gamified3d-interaction`](packages/gamified3d-interaction) | 0.1.0, built, not yet on npm |

The other modules are planned.

## Development

```powershell
npm install
npm run demo
npm test
```

`npm run demo` serves the package sources directly. `npm test` checks that each committed
`dist/` matches a fresh build, runs the unit tests and type-checks the demo. Run
`npm run build:packages` after changing a package and commit the new `dist/` with it.

## License

[Apache License 2.0](LICENSE). See [NOTICE](NOTICE).
