export type Direction = 'up' | 'down' | 'left' | 'right';

/** Screen position in CSS pixels, y growing downwards. */
export interface ScreenPoint {
  x: number;
  y: number;
}

export interface SpatialCandidate<T> {
  point: ScreenPoint;
  item: T;
}

const DIRECTION_VECTORS: Readonly<Record<Direction, ScreenPoint>> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

// A 60° half-cone, so arrow keys still reach isometric neighbours that sit about 30° off axis.
const CONE_SLOPE = Math.tan(Math.PI / 3);
// Sideways drift costs more than distance, so the most "in line" candidate wins ties.
const PERPENDICULAR_WEIGHT = 2;
const MIN_ALONG_PX = 1;

export function toDirection(key: string): Direction | null {
  switch (key) {
    case 'ArrowUp':
      return 'up';
    case 'ArrowDown':
      return 'down';
    case 'ArrowLeft':
      return 'left';
    case 'ArrowRight':
      return 'right';
    default:
      return null;
  }
}

/** Nearest candidate in the given screen direction, or null if none lies inside the cone. */
export function pickInDirection<T>(
  from: ScreenPoint,
  candidates: readonly SpatialCandidate<T>[],
  direction: Direction,
): T | null {
  const axis = DIRECTION_VECTORS[direction];
  let best: T | null = null;
  let bestScore = Infinity;
  for (const { point, item } of candidates) {
    const dx = point.x - from.x;
    const dy = point.y - from.y;
    const along = dx * axis.x + dy * axis.y;
    if (along < MIN_ALONG_PX) continue;
    const perpendicular = Math.abs(dx * axis.y - dy * axis.x);
    if (perpendicular > along * CONE_SLOPE) continue;
    const score = along + perpendicular * PERPENDICULAR_WEIGHT;
    if (score < bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}
