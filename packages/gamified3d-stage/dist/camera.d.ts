import { OrthographicCamera, Vector3 } from 'three';
export type CameraPresetName = 'isometric' | 'dimetric' | 'tilted';
export interface CameraPreset {
    /** Angle above the ground plane, in radians. */
    elevation: number;
    /** Rotation around the vertical axis, in radians. 0 looks from +Z towards the target. */
    azimuth: number;
}
export declare const CAMERA_PRESETS: Readonly<Record<CameraPresetName, Readonly<CameraPreset>>>;
export declare const CAMERA_DISTANCE = 100;
export declare function resolveCameraPreset(preset: CameraPresetName | CameraPreset): CameraPreset;
export declare function placeCamera(camera: OrthographicCamera, preset: CameraPreset, target: Vector3): void;
/** Sizes the frustum so `viewSize` world units fill the canvas height at the given aspect. */
export declare function fitOrthographicCamera(camera: OrthographicCamera, viewSize: number, aspect: number): void;
