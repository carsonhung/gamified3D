import assert from 'node:assert/strict';
import test from 'node:test';
import { OrthographicCamera, Vector3 } from 'three';
import { CAMERA_PRESETS, fitOrthographicCamera, placeCamera, resolveCameraPreset } from '../dist/index.js';

const EPSILON = 1e-9;

function projectedTileRatio(preset) {
  const camera = new OrthographicCamera();
  placeCamera(camera, preset, new Vector3());
  const project = (x, z) => new Vector3(x, 0, z).applyMatrix4(camera.matrixWorldInverse);
  const corners = [project(0, 0), project(1, 0), project(1, 1), project(0, 1)];
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  return (Math.max(...xs) - Math.min(...xs)) / (Math.max(...ys) - Math.min(...ys));
}

test('isometric preset projects a ground tile at sqrt(3):1', () => {
  assert.ok(Math.abs(projectedTileRatio(CAMERA_PRESETS.isometric) - Math.sqrt(3)) < EPSILON);
});

test('dimetric preset projects a ground tile at 2:1', () => {
  assert.ok(Math.abs(projectedTileRatio(CAMERA_PRESETS.dimetric) - 2) < EPSILON);
});

test('camera looks at the target from the preset direction', () => {
  const camera = new OrthographicCamera();
  const target = new Vector3(3, 0, -2);
  placeCamera(camera, CAMERA_PRESETS.tilted, target);
  const forward = camera.getWorldDirection(new Vector3());
  const toTarget = target.clone().sub(camera.position).normalize();
  assert.ok(forward.distanceTo(toTarget) < 1e-6);
});

test('fitOrthographicCamera keeps viewSize vertical and scales width by aspect', () => {
  const camera = new OrthographicCamera();
  fitOrthographicCamera(camera, 10, 2);
  assert.equal(camera.top - camera.bottom, 10);
  assert.equal(camera.right - camera.left, 20);
});

test('unknown preset names throw', () => {
  assert.throws(() => resolveCameraPreset('fisheye'), /\[gamified3d-stage\]/);
});
