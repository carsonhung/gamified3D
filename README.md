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
- **Accessibility**: a DOM mirror of interactive objects, so focus order and screen readers work.

## Status

Early setup. No packages are published yet.

## License

[Apache License 2.0](LICENSE). See [NOTICE](NOTICE).
