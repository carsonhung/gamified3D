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
export declare const DIRECTIONS: readonly Readonly<Point>[];
export declare const FACING_STEP: Readonly<Record<Facing, Readonly<Point>>>;
export declare function cellIndex(width: number, x: number, y: number): number;
export declare function isInBounds(size: GridSize, x: number, y: number): boolean;
/** Horizontal movement wins, so diagonal input faces sideways like most grid RPGs. */
export declare function facingFromDelta(dx: number, dy: number): Facing;
/** Shortest 4-neighbour path from `start` to `goal`, excluding `start`; [] when already there, null when unreachable. */
export declare function findGridPath(size: GridSize, start: Point, goal: Point, isWalkable: CellTest): Point[] | null;
/**
 * Shortest path to any free cell beside `target` (for using something solid, like an NPC or a
 * chest). [] when already beside it, null when no side is reachable.
 */
export declare function findPathBeside(size: GridSize, start: Point, target: Point, isWalkable: CellTest): Point[] | null;
