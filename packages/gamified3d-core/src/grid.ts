export interface Point {
  x: number;
  y: number;
}

export interface GridSize {
  width: number;
  height: number;
}

export type Facing = 'up' | 'down' | 'left' | 'right';

/** Tells the pathfinder whether a cell can be stood on. Out-of-bounds cells are never asked. */
export type CellTest = (x: number, y: number) => boolean;

// Order matters: breadth-first search expands neighbours in this order, which decides ties.
export const DIRECTIONS: readonly Readonly<Point>[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

export const FACING_STEP: Readonly<Record<Facing, Readonly<Point>>> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function cellIndex(width: number, x: number, y: number): number {
  return y * width + x;
}

export function isInBounds(size: GridSize, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < size.width && y < size.height;
}

/** Horizontal movement wins, so diagonal input faces sideways like most grid RPGs. */
export function facingFromDelta(dx: number, dy: number): Facing {
  if (dx > 0) return 'right';
  if (dx < 0) return 'left';
  return dy < 0 ? 'up' : 'down';
}

/** Shortest 4-neighbour path from `start` to `goal`, excluding `start`; [] when already there, null when unreachable. */
export function findGridPath(size: GridSize, start: Point, goal: Point, isWalkable: CellTest): Point[] | null {
  if (!isInBounds(size, goal.x, goal.y)) return null;
  const { width } = size;
  const startIndex = cellIndex(width, start.x, start.y);
  const goalIndex = cellIndex(width, goal.x, goal.y);
  if (startIndex === goalIndex) return [];
  const previous = new Int32Array(width * size.height).fill(-1);
  previous[startIndex] = startIndex;
  const queue = [startIndex];
  for (let head = 0; head < queue.length; head++) {
    const cell = queue[head]!;
    if (cell === goalIndex) break;
    const cx = cell % width;
    const cy = Math.floor(cell / width);
    for (const d of DIRECTIONS) {
      const nx = cx + d.x;
      const ny = cy + d.y;
      if (!isInBounds(size, nx, ny)) continue;
      const next = cellIndex(width, nx, ny);
      if (previous[next] !== -1 || !isWalkable(nx, ny)) continue;
      previous[next] = cell;
      queue.push(next);
    }
  }
  if (previous[goalIndex] === -1) return null;
  const path: Point[] = [];
  for (let cell = goalIndex; cell !== startIndex; cell = previous[cell]!) {
    path.push({ x: cell % width, y: Math.floor(cell / width) });
  }
  return path.reverse();
}

/**
 * Shortest path to any free cell beside `target` (for using something solid, like an NPC or a
 * chest). [] when already beside it, null when no side is reachable.
 */
export function findPathBeside(size: GridSize, start: Point, target: Point, isWalkable: CellTest): Point[] | null {
  let best: Point[] | null = null;
  for (const d of DIRECTIONS) {
    const side = { x: target.x + d.x, y: target.y + d.y };
    if (side.x === start.x && side.y === start.y) return [];
    if (!isInBounds(size, side.x, side.y) || !isWalkable(side.x, side.y)) continue;
    const path = findGridPath(size, start, side, isWalkable);
    if (path && (!best || path.length < best.length)) best = path;
  }
  return best;
}
