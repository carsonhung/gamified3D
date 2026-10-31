# Changelog

## 0.1.0

- `createInteraction` makes registered three.js objects hoverable and selectable by mouse, pen
  and touch, with tap-versus-drag detection and pointer cursors.
- Every target gets a visually hidden `<button>`, so Tab, Enter, Space and screen readers work
  without extra code. Arrow keys move focus to the nearest target in that screen direction, and
  Escape clears the selection.
- `pickInDirection` and `toDirection` are exported for custom spatial navigation.
