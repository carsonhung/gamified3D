# gamified3d-interaction

Hover, select and keyboard navigation for three.js objects in a 2.5D interface. It works with
mouse, pen, touch and keyboard, and screen readers announce every target.

```bash
npm i gamified3d-interaction three
```

```ts
import { createStage } from 'gamified3d-stage';
import { createInteraction } from 'gamified3d-interaction';

const stage = createStage({ container: document.querySelector('#stage')! });
const interaction = createInteraction({ camera: stage.camera, canvas: stage.canvas, label: 'Game board' });

const chest = interaction.addTarget(chestMesh, { label: 'Treasure chest' });
interaction.addTarget(gateMesh, { label: 'Gate (locked)', isDisabled: true });

interaction.on('hover', (target) => highlight(target));
interaction.on('focus', (target) => outline(target));
interaction.on('select', (target) => showDetails(target));
```

Each handler receives the target or `null`, and your code draws the state (tint, outline or
lift) and calls `stage.requestRender()`. The library never changes your materials.

## How input maps to events

| Input | Result |
|---|---|
| Mouse or pen moves over a target | `hover` |
| Click or tap a target | `select` |
| Click or tap empty space, or press Escape | `select` with `null` |
| Tab onto the board | `focus` on the first target |
| Arrow keys | `focus` moves to the nearest target in that screen direction |
| Enter or Space | `select` the focused target |

Touch never fires `hover`, so anything you show on hover must also be reachable by selecting. A
press that moves more than a few pixels counts as a drag and does not select.

## Accessibility

Every target gets a visually hidden `<button>` placed after the canvas, inside a group named by
`label`. Tab order follows the order you add targets. Buttons report the selection with
`aria-pressed` and disabled targets with `aria-disabled`. Disabled targets still fire `hover` and
`focus`, so you can explain why they are locked, but they never select.

Draw a clear focus outline in the scene when `focus` fires; it is the only visible cue keyboard
users get.

## License

[Apache License 2.0](LICENSE). See [NOTICE](NOTICE).
