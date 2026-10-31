// True isometric looks down the cube diagonal: elevation = atan(1 / sqrt(2)) ≈ 35.26°.
const ISOMETRIC_ELEVATION = Math.atan(1 / Math.SQRT2);
// Pixel-art "2:1" dimetric: a ground tile projects twice as wide as tall when sin(elevation) = 0.5.
const DIMETRIC_ELEVATION = Math.asin(0.5);
const TILTED_ELEVATION = Math.PI / 3;
const CORNER_AZIMUTH = Math.PI / 4;
export const CAMERA_PRESETS = {
    isometric: { elevation: ISOMETRIC_ELEVATION, azimuth: CORNER_AZIMUTH },
    dimetric: { elevation: DIMETRIC_ELEVATION, azimuth: CORNER_AZIMUTH },
    tilted: { elevation: TILTED_ELEVATION, azimuth: 0 },
};
// Orthographic, so distance only has to clear the scene; it never changes the apparent size.
export const CAMERA_DISTANCE = 100;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = CAMERA_DISTANCE * 2;
export function resolveCameraPreset(preset) {
    if (typeof preset !== 'string')
        return preset;
    const found = CAMERA_PRESETS[preset];
    if (!found)
        throw new Error(`[gamified3d-stage] unknown camera preset "${String(preset)}"`);
    return found;
}
export function placeCamera(camera, preset, target) {
    const ground = Math.cos(preset.elevation) * CAMERA_DISTANCE;
    camera.position.set(target.x + ground * Math.sin(preset.azimuth), target.y + Math.sin(preset.elevation) * CAMERA_DISTANCE, target.z + ground * Math.cos(preset.azimuth));
    camera.up.set(0, 1, 0);
    camera.lookAt(target);
    camera.near = CAMERA_NEAR;
    camera.far = CAMERA_FAR;
    camera.updateMatrixWorld();
}
/** Sizes the frustum so `viewSize` world units fill the canvas height at the given aspect. */
export function fitOrthographicCamera(camera, viewSize, aspect) {
    const halfHeight = viewSize / 2;
    const halfWidth = halfHeight * aspect;
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
}
