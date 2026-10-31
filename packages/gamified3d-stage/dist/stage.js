import { OrthographicCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { fitOrthographicCamera, placeCamera, resolveCameraPreset, } from './camera.js';
const DEFAULT_VIEW_SIZE = 10;
const DEFAULT_MAX_PIXEL_RATIO = 2;
function assertPixelScale(pixelScale) {
    if (!Number.isInteger(pixelScale) || pixelScale < 1) {
        throw new Error(`[gamified3d-stage] pixelScale must be a whole number >= 1, got ${pixelScale}`);
    }
}
function assertViewSize(viewSize) {
    if (!(viewSize > 0))
        throw new Error(`[gamified3d-stage] viewSize must be > 0, got ${viewSize}`);
}
export function createStage(options) {
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
    if (options.background !== null)
        renderer.setClearColor(options.background ?? 0x000000);
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    // The interaction mirror is positioned against the container, so it must be a containing block.
    if (getComputedStyle(container).position === 'static')
        container.style.position = 'relative';
    container.append(canvas);
    const scene = new Scene();
    const camera = new OrthographicCamera();
    const beforeRender = new Set();
    let width = 0;
    let height = 0;
    let frameId = 0;
    let isDisposed = false;
    function applyPixelRatio() {
        canvas.style.imageRendering = pixelScale > 1 ? 'pixelated' : '';
        renderer.setPixelRatio(pixelScale > 1 ? 1 / pixelScale : Math.min(window.devicePixelRatio, maxPixelRatio));
    }
    function applySize() {
        if (width === 0 || height === 0)
            return;
        renderer.setSize(width, height, false);
        fitOrthographicCamera(camera, viewSize, width / height);
    }
    function render() {
        frameId = 0;
        for (const handler of beforeRender)
            handler();
        renderer.render(scene, camera);
    }
    function requestRender() {
        if (frameId !== 0 || isDisposed)
            return;
        frameId = requestAnimationFrame(render);
    }
    const resizeObserver = new ResizeObserver(([entry]) => {
        if (!entry)
            return;
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
            if (frameId !== 0)
                cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            beforeRender.clear();
            renderer.dispose();
            canvas.remove();
        },
    };
}
