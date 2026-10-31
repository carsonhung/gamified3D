# Changelog

## 0.1.0

- `EventBus` is a typed pub/sub for the UI layer and the game layer. Ported from StoryTelling
  `frontend/src/game/bus.ts`.
- Grid helpers `cellIndex`, `isInBounds`, `DIRECTIONS`, `FACING_STEP`, `facingFromDelta`,
  `findGridPath` (4-neighbour breadth-first search) and `findPathBeside`. Ported from
  StoryTelling `shared/sceneValidation.ts` `findPath` and `WorldScene.walkNextTo`.
- `createActionInput` maps rebindable keys to hold actions (movement, newest wins) and press
  actions (interact), and ignores keys typed into form fields. Ported from StoryTelling
  `WorldScene` keyboard handling and `game/camera.ts` `isTypingTarget`.
- `createGridRoute` queues a tap-to-move path and the action to run on arrival.
- `GridProjection` describes what game logic needs from any way of drawing the grid. Ported from
  StoryTelling `game/views/mapView.ts`.
