import '@fontsource/press-start-2p';
import './style.css';
import {
  BoxGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  OctahedronGeometry,
  type BufferGeometry,
  type Object3D,
} from 'three';
import { createStage, type CameraPresetName } from 'gamified3d-stage';
import { createInteraction, type InteractionTarget } from 'gamified3d-interaction';

const BOARD_SIZE = 7;
const TILE_GAP = 0.06;
const TILE_HEIGHT = 0.25;
const VIEW_SIZE = 8;
const PIXEL_SCALE = 3;
const SELECTED_LIFT = 0.25;
const HOVER_GLOW = 0.3;
const CURSOR_THICKNESS = 0.08;
const BOB_STEPS = 4;
const BOB_PERIOD_MS = 1200;
const BOB_HEIGHT = 0.12;

function readToken(name: string, fallback: string): Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(value || fallback);
}

const palette = {
  tileA: readToken('--color-gx-surface', '#24244a'),
  tileB: readToken('--color-gx-track', '#3a3a5c'),
  accent: readToken('--color-gx-accent', '#f5c542'),
  bronze: readToken('--color-gx-bronze', '#c47a3f'),
  gold: readToken('--color-gx-gold', '#f5c542'),
  diamond: readToken('--color-gx-diamond', '#7dd3fc'),
  silver: readToken('--color-gx-silver', '#c0c7d1'),
  danger: readToken('--color-gx-danger', '#c62828'),
  hp: readToken('--color-gx-hp', '#e5484d'),
  common: readToken('--color-gx-common', '#9ca3af'),
};

function requireElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`[demo] missing ${selector}`);
  return element;
}

function isReducedMotion(): boolean {
  return (
    document.documentElement.dataset.gxMotion === 'reduce' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function part(geometry: BufferGeometry, color: Color, y: number): Mesh {
  const mesh = new Mesh(geometry, new MeshStandardMaterial({ color, flatShading: true, roughness: 0.9 }));
  mesh.position.y = y;
  return mesh;
}

function tileToWorld(column: number, row: number): { x: number; z: number } {
  const offset = (BOARD_SIZE - 1) / 2;
  return { x: column - offset, z: row - offset };
}

const stage = createStage({
  container: requireElement('#stage'),
  preset: 'isometric',
  viewSize: VIEW_SIZE,
  background: null,
});

stage.scene.add(new HemisphereLight(0xffffff, 0x404060, 1.6));
const sun = new DirectionalLight(0xffffff, 2.2);
sun.position.set(4, 10, 6);
stage.scene.add(sun);

const tileGeometry = new BoxGeometry(1 - TILE_GAP, TILE_HEIGHT, 1 - TILE_GAP);
for (let column = 0; column < BOARD_SIZE; column++) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    const tile = part(tileGeometry, (column + row) % 2 === 0 ? palette.tileA : palette.tileB, -TILE_HEIGHT / 2);
    const { x, z } = tileToWorld(column, row);
    tile.position.x = x;
    tile.position.z = z;
    stage.scene.add(tile);
  }
}

interface Piece {
  name: string;
  description: string;
  column: number;
  row: number;
  isLocked?: boolean;
  build: () => Object3D[];
}

const PIECES: Piece[] = [
  {
    name: 'Treasure chest',
    description: 'Holds 120 gold and a rusty key.',
    column: 1,
    row: 4,
    build: () => [part(new BoxGeometry(0.7, 0.4, 0.5), palette.bronze, 0.2), part(new BoxGeometry(0.74, 0.16, 0.54), palette.gold, 0.48)],
  },
  {
    name: 'Mana crystal',
    description: 'Restores 30 MP when touched.',
    column: 4,
    row: 1,
    build: () => [part(new OctahedronGeometry(0.32), palette.diamond, 0.55)],
  },
  {
    name: 'Watch tower',
    description: 'Reveals the map within 3 tiles.',
    column: 5,
    row: 5,
    build: () => [part(new CylinderGeometry(0.28, 0.32, 1.1, 6), palette.silver, 0.55), part(new ConeGeometry(0.4, 0.5, 6), palette.danger, 1.35)],
  },
  {
    name: 'Health potion',
    description: 'Heals 50 HP. One use.',
    column: 2,
    row: 2,
    build: () => [part(new IcosahedronGeometry(0.26, 0), palette.hp, 0.3), part(new CylinderGeometry(0.07, 0.07, 0.18, 6), palette.silver, 0.62)],
  },
  {
    name: 'Gate (locked)',
    description: 'Needs the rusty key.',
    column: 3,
    row: 6,
    isLocked: true,
    build: () => {
      const post = new BoxGeometry(0.14, 0.9, 0.14);
      const left = part(post, palette.common, 0.45);
      const right = part(post, palette.common, 0.45);
      left.position.x = -0.32;
      right.position.x = 0.32;
      return [left, right, part(new BoxGeometry(0.78, 0.12, 0.12), palette.common, 0.8)];
    },
  },
];

const interaction = createInteraction({ camera: stage.camera, canvas: stage.canvas, label: 'Game board' });
const pieceByObject = new Map<Object3D, Piece>();
let crystal: Group | null = null;

for (const piece of PIECES) {
  const group = new Group();
  group.add(...piece.build());
  const { x, z } = tileToWorld(piece.column, piece.row);
  group.position.set(x, 0, z);
  stage.scene.add(group);
  pieceByObject.set(group, piece);
  interaction.addTarget(group, { label: piece.name, isDisabled: piece.isLocked });
  if (piece.name === 'Mana crystal') crystal = group;
}

// Focus cursor: a tile-sized frame, the in-scene equivalent of a focus ring.
const cursor = new Group();
const cursorMaterial = new MeshStandardMaterial({ color: palette.accent, emissive: palette.accent, emissiveIntensity: 0.6 });
const edge = new BoxGeometry(1, CURSOR_THICKNESS, CURSOR_THICKNESS);
for (const [x, z, isRotated] of [[0, -0.5, false], [0, 0.5, false], [-0.5, 0, true], [0.5, 0, true]] as const) {
  const bar = new Mesh(edge, cursorMaterial);
  bar.position.set(x, CURSOR_THICKNESS / 2, z);
  if (isRotated) bar.rotation.y = Math.PI / 2;
  cursor.add(bar);
}
cursor.visible = false;
stage.scene.add(cursor);

function setGlow(object: Object3D, intensity: number): void {
  object.traverse((node) => {
    if (node instanceof Mesh && node.material instanceof MeshStandardMaterial) {
      node.material.emissive.copy(node.material.color);
      node.material.emissiveIntensity = intensity;
    }
  });
}

const hoveredName = requireElement('#hovered-name');
const selectedName = requireElement('#selected-name');
const selectedDescription = requireElement('#selected-description');
let lastHovered: InteractionTarget | null = null;
let lastSelected: InteractionTarget | null = null;

interaction.on('hover', (target) => {
  if (lastHovered) setGlow(lastHovered.object, 0);
  if (target) setGlow(target.object, HOVER_GLOW);
  lastHovered = target;
  hoveredName.textContent = target ? target.label : 'nothing';
  stage.requestRender();
});

interaction.on('focus', (target) => {
  cursor.visible = target !== null;
  if (target) cursor.position.set(target.object.position.x, 0, target.object.position.z);
  stage.requestRender();
});

interaction.on('select', (target) => {
  if (lastSelected) lastSelected.object.position.y = 0;
  if (target) target.object.position.y = SELECTED_LIFT;
  lastSelected = target;
  const piece = target ? pieceByObject.get(target.object) : undefined;
  selectedName.textContent = piece ? piece.name : 'Nothing selected';
  selectedDescription.textContent = piece ? piece.description : 'Click, tap or press Enter on an object.';
  stage.requestRender();
});

// Stepped idle bob, so the stage loop is exercised; it rests when motion is reduced.
stage.onBeforeRender(() => {
  if (!crystal) return;
  const base = lastSelected?.object === crystal ? SELECTED_LIFT : 0;
  if (isReducedMotion()) {
    crystal.position.y = base;
    return;
  }
  const step = Math.floor(((performance.now() % BOB_PERIOD_MS) / BOB_PERIOD_MS) * BOB_STEPS);
  crystal.position.y = base + (step % 2) * BOB_HEIGHT;
  stage.requestRender();
});

const presetButtons = document.querySelectorAll<HTMLButtonElement>('[data-preset]');
for (const button of presetButtons) {
  button.addEventListener('click', () => {
    stage.setPreset(button.dataset.preset as CameraPresetName);
    for (const other of presetButtons) other.setAttribute('aria-pressed', String(other === button));
  });
}

const pixelToggle = requireElement<HTMLButtonElement>('#pixel-toggle');
pixelToggle.addEventListener('click', () => {
  const isOn = pixelToggle.getAttribute('aria-pressed') !== 'true';
  pixelToggle.setAttribute('aria-pressed', String(isOn));
  stage.setPixelScale(isOn ? PIXEL_SCALE : 1);
});

const motionToggle = requireElement<HTMLButtonElement>('#motion-toggle');
motionToggle.addEventListener('click', () => {
  const isOn = motionToggle.getAttribute('aria-pressed') !== 'true';
  motionToggle.setAttribute('aria-pressed', String(isOn));
  if (isOn) document.documentElement.dataset.gxMotion = 'reduce';
  else delete document.documentElement.dataset.gxMotion;
  stage.requestRender();
});
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => stage.requestRender());

stage.requestRender();
