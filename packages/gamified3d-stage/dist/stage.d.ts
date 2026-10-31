import { OrthographicCamera, Scene, Vector3, WebGLRenderer, type ColorRepresentation } from 'three';
import { type CameraPreset, type CameraPresetName } from './camera.js';
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
export declare function createStage(options: StageOptions): Stage;
