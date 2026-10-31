import { OrthographicCamera, Scene, Vector3, WebGLRenderer, type ColorRepresentation } from 'three';
import {
  fitOrthographicCamera,
  placeCamera,
  resolveCameraPreset,
  type CameraPreset,
  type CameraPresetName,
} from './camera.js';

const DEFAULT_VIEW_SIZE = 10;
const DEFAULT_MAX_PIXEL_RATIO = 2;

export interface StageOptions {
  /** Element the canvas fills. It must have a size; the stage follows it with a ResizeObserver. */
  container: HTMLElement;
  preset?: CameraPresetName | CameraPreset;
  /** World units visible from the bottom to the top of the canvas. */
  viewSize?: number;
  /** Point the camera looks at. */
  target?: Vector3;
  /** Renders at 1/pixelScale resolution and upscales without smoothing. Whole numbers only. */
  pixelScale?: number;
  /** Caps devicePixelRatio when pixelScale is 1, to bound GPU cost on dense screens. */
  maxPixelRatio?: number;
  /** Clear colour; null leaves the canvas transparent so the page shows through. */
  background?: ColorRepresentation | null;
}

export interface Stage {
  readonly scene: Scene;
  readonly camera: OrthographicCamera;
  readonly renderer: WebGLRenderer;
  readonly canvas: HTMLCanvasElement;
  /** Schedules one render on the next animation frame. Calls within a frame coalesce. */
  requestRender(): void;
  setPreset(preset: CameraPresetName | CameraPreset): void;
  setTarget(target: Vector3): void;
  setViewSize(viewSize: number): void;
  setPixelScale(pixelScale: number): void;
  /** Runs before each render; call requestRender inside it to keep animating. */
  onBeforeRender(handler: () => void): () => void;
  /** Stops rendering and removes the canvas. Scene contents belong to the caller. */
  dispose(): void;
}

function assertPixelScale(pixelScale: number): void {
  if (!Number.isInteger(pixelScale) || pixelScale < 1) {
    throw new Error(`[gamified3d-stage] pixelScale must be a whole number >= 1, got ${pixelScale}`);
  }
}

function assertViewSize(viewSize: number): void {
  if (!(viewSize > 0)) throw new Error(`[gamified3d-stage] viewSize must be > 0, got ${viewSize}`);
}

export function createStage(options: StageOptions): Stage {
  const { container } = options;
  let preset = resolveCameraPreset(options.preset ?? 'isometric');
  let viewSize = options.viewSize ?? DEFAULT_VIEW_SIZE;
  let pixelScale = options.pixelScale ?? 1;
  const target = (options.target ?? new Vector3()).clone();
  const maxPixelRatio = options.maxPixelRatio ?? DEFAULT_MAX_PIXEL_RATIO;
  assertViewSize(viewSize);
  assertPixelScale(pixelScale);

  // Antialiasing is fixed at context creation; pixel-scaled stages want hard edges anyway.
  const renderer = new WebGLRenderer({ antialias: pixelScale === 1, alpha: options.background === null });
  if (options.background !== null) renderer.setClearColor(options.background ?? 0x000000);
  const canvas = renderer.domElement;
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  // The interaction mirror is positioned against the container, so it must be a containing block.
  if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
  container.append(canvas);

  const scene = new Scene();
  const camera = new OrthographicCamera();
  const beforeRender = new Set<() => void>();
  let width = 0;
  let height = 0;
  let frameId = 0;
  let isDisposed = false;

  function applyPixelRatio(): void {
    canvas.style.imageRendering = pixelScale > 1 ? 'pixelated' : '';
    renderer.setPixelRatio(pixelScale > 1 ? 1 / pixelScale : Math.min(window.devicePixelRatio, maxPixelRatio));
  }

  function applySize(): void {
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    fitOrthographicCamera(camera, viewSize, width / height);
  }

  function render(): void {
    frameId = 0;
    for (const handler of beforeRender) handler();
    renderer.render(scene, camera);
  }

  function requestRender(): void {
    if (frameId !== 0 || isDisposed) return;
    frameId = requestAnimationFrame(render);
  }

  const resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) return;
    width = Math.round(entry.contentRect.width);
    height = Math.round(entry.contentRect.height);
    applySize();
    requestRender();
  });

  applyPixelRatio();
  placeCamera(camera, preset, target);
  resizeObserver.observe(container);

  return {
    scene,
    camera,
    renderer,
    canvas,
    requestRender,
    setPreset(next) {
      preset = resolveCameraPreset(next);
      placeCamera(camera, preset, target);
      requestRender();
    },
    setTarget(next) {
      target.copy(next);
      placeCamera(camera, preset, target);
      requestRender();
    },
    setViewSize(next) {
      assertViewSize(next);
      viewSize = next;
      applySize();
      requestRender();
    },
    setPixelScale(next) {
      assertPixelScale(next);
      pixelScale = next;
      applyPixelRatio();
      applySize();
      requestRender();
    },
    onBeforeRender(handler) {
      beforeRender.add(handler);
      return () => beforeRender.delete(handler);
    },
    dispose() {
      isDisposed = true;
      if (frameId !== 0) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      beforeRender.clear();
      renderer.dispose();
      canvas.remove();
    },
  };
}
