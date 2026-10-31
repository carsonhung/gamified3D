# gamified3d-core

Building blocks for grid-based 2D and 2.5D games that do not depend on any engine. Use them with
Phaser, three.js, a canvas or plain DOM. No dependencies.

```bash
npm i gamified3d-core
```

## Event bus

```ts
import { EventBus } from 'gamified3d-core';

interface Events {
  ready: undefined;
  moved: { x: number; y: number };
}

const bus = new EventBus<Events>();
const off = bus.on('moved', ({ x, y }) => console.log(x, y));
bus.emit('moved', { x: 2, y: 3 });
bus.emit('ready');
off();
```

Create one bus per game instance, so two games on a page never hear each other.

## Grid and pathfinding

`findGridPath(size, start, goal, isWalkable)` returns the shortest 4-neighbour path, excluding the
start: `[]` when already at the goal and `null` when it cannot be reached. `findPathBeside` walks
to the nearest free cell next to a target, for talking to an NPC or opening a chest.
`facingFromDelta`, `FACING_STEP`, `DIRECTIONS`, `cellIndex` and `isInBounds` cover the rest.

## Action input

```ts
import { createActionInput } from 'gamified3d-core';

const input = createActionInput({
  bindings: { up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'], interact: ['Space', 'Enter'] },
  hold: ['up', 'down'],
  press: ['interact'],
  onPress: (action) => interact(),
  onHoldStart: () => route.clear(),
  isEnabled: () => !isDialogueOpen,
});

// In the game loop:
if (input.held) step(input.held);
```

Hold actions stack, so the newest key still down wins. Press actions fire once per press and
ignore auto-repeat. Keys typed into inputs, text areas, selects and editable elements are
ignored, and keys bound to anything else are left for the page. Releasing the window clears held
keys, because their keyup never arrives.

## Tap-to-move routes

`createGridRoute<TUse>()` holds a path and what to do on arrival. Each game-loop tick, call
`route.next(position)`: it returns `{ kind: 'step', facing }`, then `{ kind: 'use', use }`, then
`null`. Your code performs the step, so movement timing and animation stay yours.

## Projection contract

`GridProjection<TPointer>` is what game logic needs from a renderer: map bounds, cell size, step
duration, where an actor's feet go, draw order and pointer-to-cell. Implement it once per view
(2D top-down, isometric, 3D) and the game logic works with all of them.

## License

[Apache License 2.0](LICENSE). See [NOTICE](NOTICE).
