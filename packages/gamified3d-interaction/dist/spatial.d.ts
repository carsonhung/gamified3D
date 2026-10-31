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
export declare function toDirection(key: string): Direction | null;
/** Nearest candidate in the given screen direction, or null if none lies inside the cone. */
export declare function pickInDirection<T>(from: ScreenPoint, candidates: readonly SpatialCandidate<T>[], direction: Direction): T | null;
