import assert from 'node:assert/strict';
import test from 'node:test';
import { pickInDirection, toDirection } from '../dist/index.js';

const origin = { x: 100, y: 100 };
const at = (x, y, item) => ({ point: { x, y }, item });

test('picks the nearest candidate in the pressed direction', () => {
  const candidates = [at(200, 100, 'far'), at(150, 100, 'near'), at(50, 100, 'behind')];
  assert.equal(pickInDirection(origin, candidates, 'right'), 'near');
});

test('reaches isometric neighbours about 30 degrees off axis', () => {
  const dx = 60;
  const dy = Math.tan(Math.PI / 6) * dx;
  assert.equal(pickInDirection(origin, [at(100 + dx, 100 - dy, 'ne')], 'right'), 'ne');
});

test('prefers the candidate most in line over a slightly closer one off to the side', () => {
  const candidates = [at(140, 150, 'diagonal'), at(160, 100, 'straight')];
  assert.equal(pickInDirection(origin, candidates, 'right'), 'straight');
});

test('returns null when nothing lies in that direction', () => {
  assert.equal(pickInDirection(origin, [at(100, 300, 'below')], 'up'), null);
  assert.equal(pickInDirection(origin, [at(110, 300, 'steep')], 'right'), null);
});

test('maps arrow keys and ignores other keys', () => {
  assert.equal(toDirection('ArrowLeft'), 'left');
  assert.equal(toDirection('Enter'), null);
});
