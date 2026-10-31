import assert from 'node:assert/strict';
import test from 'node:test';
import { createGridRoute, facingFromDelta, findGridPath, findPathBeside } from '../dist/index.js';

// '#' is a wall, '.' is floor.
function grid(rows) {
  const size = { width: rows[0].length, height: rows.length };
  const isWalkable = (x, y) => rows[y][x] !== '#';
  return { size, isWalkable };
}

test('findGridPath walks around walls and excludes the start', () => {
  const { size, isWalkable } = grid(['...', '##.', '...']);
  assert.deepEqual(findGridPath(size, { x: 0, y: 0 }, { x: 0, y: 2 }, isWalkable), [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 0, y: 2 },
  ]);
});

test('findGridPath returns [] at the goal and null when unreachable or out of bounds', () => {
  const { size, isWalkable } = grid(['.#.', '.#.']);
  assert.deepEqual(findGridPath(size, { x: 0, y: 0 }, { x: 0, y: 0 }, isWalkable), []);
  assert.equal(findGridPath(size, { x: 0, y: 0 }, { x: 2, y: 0 }, isWalkable), null);
  assert.equal(findGridPath(size, { x: 0, y: 0 }, { x: 5, y: 0 }, isWalkable), null);
});

test('findGridPath breaks ties up, right, down, left', () => {
  const { size, isWalkable } = grid(['...', '...']);
  assert.deepEqual(findGridPath(size, { x: 0, y: 1 }, { x: 1, y: 0 }, isWalkable), [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ]);
});

test('findPathBeside picks the nearest free side of a solid target', () => {
  const { size, isWalkable } = grid(['.....', '..#..', '.....']);
  const path = findPathBeside(size, { x: 0, y: 1 }, { x: 2, y: 1 }, (x, y) => isWalkable(x, y) && !(x === 2 && y === 1));
  assert.deepEqual(path, [{ x: 1, y: 1 }]);
  assert.deepEqual(findPathBeside(size, { x: 1, y: 1 }, { x: 2, y: 1 }, isWalkable), []);
});

test('facingFromDelta prefers horizontal movement', () => {
  assert.equal(facingFromDelta(1, -1), 'right');
  assert.equal(facingFromDelta(0, -1), 'up');
  assert.equal(facingFromDelta(0, 0), 'down');
});

test('a route yields steps, then the pending use, then null', () => {
  const route = createGridRoute();
  route.set([{ x: 1, y: 0 }, { x: 1, y: 1 }], 'open-chest');
  assert.equal(route.isActive, true);
  assert.deepEqual(route.next({ x: 0, y: 0 }), { kind: 'step', facing: 'right' });
  assert.deepEqual(route.next({ x: 1, y: 0 }), { kind: 'step', facing: 'down' });
  assert.deepEqual(route.next({ x: 1, y: 1 }), { kind: 'use', use: 'open-chest' });
  assert.equal(route.next({ x: 1, y: 1 }), null);
  assert.equal(route.isActive, false);
});
