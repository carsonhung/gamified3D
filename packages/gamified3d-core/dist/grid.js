// Order matters: breadth-first search expands neighbours in this order, which decides ties.
export const DIRECTIONS = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
];
export const FACING_STEP = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
};
export function cellIndex(width, x, y) {
    return y * width + x;
}
export function isInBounds(size, x, y) {
    return x >= 0 && y >= 0 && x < size.width && y < size.height;
}
/** Horizontal movement wins, so diagonal input faces sideways like most grid RPGs. */
export function facingFromDelta(dx, dy) {
    if (dx > 0)
        return 'right';
    if (dx < 0)
        return 'left';
    return dy < 0 ? 'up' : 'down';
}
/** Shortest 4-neighbour path from `start` to `goal`, excluding `start`; [] when already there, null when unreachable. */
export function findGridPath(size, start, goal, isWalkable) {
    if (!isInBounds(size, goal.x, goal.y))
        return null;
    const { width } = size;
    const startIndex = cellIndex(width, start.x, start.y);
    const goalIndex = cellIndex(width, goal.x, goal.y);
    if (startIndex === goalIndex)
        return [];
    const previous = new Int32Array(width * size.height).fill(-1);
    previous[startIndex] = startIndex;
    const queue = [startIndex];
    for (let head = 0; head < queue.length; head++) {
        const cell = queue[head];
        if (cell === goalIndex)
            break;
        const cx = cell % width;
        const cy = Math.floor(cell / width);
        for (const d of DIRECTIONS) {
            const nx = cx + d.x;
            const ny = cy + d.y;
            if (!isInBounds(size, nx, ny))
                continue;
            const next = cellIndex(width, nx, ny);
            if (previous[next] !== -1 || !isWalkable(nx, ny))
                continue;
            previous[next] = cell;
            queue.push(next);
        }
    }
    if (previous[goalIndex] === -1)
        return null;
    const path = [];
    for (let cell = goalIndex; cell !== startIndex; cell = previous[cell]) {
        path.push({ x: cell % width, y: Math.floor(cell / width) });
    }
    return path.reverse();
}
/**
 * Shortest path to any free cell beside `target` (for using something solid, like an NPC or a
 * chest). [] when already beside it, null when no side is reachable.
 */
export function findPathBeside(size, start, target, isWalkable) {
    let best = null;
    for (const d of DIRECTIONS) {
        const side = { x: target.x + d.x, y: target.y + d.y };
        if (side.x === start.x && side.y === start.y)
            return [];
        if (!isInBounds(size, side.x, side.y) || !isWalkable(side.x, side.y))
            continue;
        const path = findGridPath(size, start, side, isWalkable);
        if (path && (!best || path.length < best.length))
            best = path;
    }
    return best;
}
