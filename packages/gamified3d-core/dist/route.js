import { facingFromDelta } from './grid.js';
export function createGridRoute() {
    let path = [];
    let pending = null;
    return {
        get isActive() {
            return path.length > 0 || pending !== null;
        },
        set(nextPath, use = null) {
            path = [...nextPath];
            pending = use;
        },
        clear() {
            path = [];
            pending = null;
        },
        next(position) {
            const cell = path.shift();
            if (cell)
                return { kind: 'step', facing: facingFromDelta(cell.x - position.x, cell.y - position.y) };
            if (pending === null)
                return null;
            const use = pending;
            pending = null;
            return { kind: 'use', use };
        },
    };
}
