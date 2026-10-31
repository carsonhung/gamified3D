import assert from 'node:assert/strict';
import test from 'node:test';
import { EventBus, createActionInput } from '../dist/index.js';

const BINDINGS = { up: ['ArrowUp'], right: ['ArrowRight'], interact: ['Space'], inventory: ['KeyI'] };

function key(type, code, { repeat = false } = {}) {
  const event = new Event(type, { cancelable: true });
  Object.defineProperties(event, { code: { value: code }, repeat: { value: repeat } });
  return event;
}

function setup(extra = {}) {
  const target = new EventTarget();
  const pressed = [];
  const input = createActionInput({
    bindings: BINDINGS,
    hold: ['up', 'right'],
    press: ['interact'],
    onPress: (action) => pressed.push(action),
    target,
    ...extra,
  });
  return { target, input, pressed };
}

test('the newest held direction wins and release falls back to the older one', () => {
  const { target, input } = setup();
  target.dispatchEvent(key('keydown', 'ArrowUp'));
  target.dispatchEvent(key('keydown', 'ArrowRight'));
  assert.equal(input.held, 'right');
  target.dispatchEvent(key('keyup', 'ArrowRight'));
  assert.equal(input.held, 'up');
  target.dispatchEvent(new Event('blur'));
  assert.equal(input.held, null);
});

test('press actions ignore auto-repeat and keys it does not handle are left alone', () => {
  const { target, pressed } = setup();
  target.dispatchEvent(key('keydown', 'Space'));
  target.dispatchEvent(key('keydown', 'Space', { repeat: true }));
  assert.deepEqual(pressed, ['interact']);
  const menu = key('keydown', 'KeyI');
  target.dispatchEvent(menu);
  assert.equal(menu.defaultPrevented, false);
});

test('isEnabled gates presses but releases still clear held keys', () => {
  let isEnabled = true;
  const { target, input } = setup({ isEnabled: () => isEnabled });
  target.dispatchEvent(key('keydown', 'ArrowUp'));
  isEnabled = false;
  target.dispatchEvent(key('keydown', 'ArrowRight'));
  assert.equal(input.held, 'up');
  target.dispatchEvent(key('keyup', 'ArrowUp'));
  assert.equal(input.held, null);
});

test('onHoldStart fires for each new hold press', () => {
  const started = [];
  const { target } = setup({ onHoldStart: (action) => started.push(action) });
  target.dispatchEvent(key('keydown', 'ArrowUp'));
  assert.deepEqual(started, ['up']);
});

test('EventBus delivers typed payloads and unsubscribes', () => {
  const bus = new EventBus();
  const seen = [];
  const off = bus.on('moved', (p) => seen.push(p));
  bus.on('ready', (p) => seen.push(p));
  bus.emit('moved', { x: 1 });
  bus.emit('ready');
  off();
  bus.emit('moved', { x: 2 });
  assert.deepEqual(seen, [{ x: 1 }, undefined]);
});
