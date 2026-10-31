import { type Facing, type Point } from './grid.js';
export type RouteStep<TUse> = {
    kind: 'step';
    facing: Facing;
} | {
    kind: 'use';
    use: TUse;
};
/** A queued walk (from tap-to-move) plus what to do on arrival. The host performs each step. */
export interface GridRoute<TUse> {
    readonly isActive: boolean;
    set(path: readonly Point[], use?: TUse | null): void;
    clear(): void;
    /** The next thing to do from `position`, or null when the route is finished. */
    next(position: Point): RouteStep<TUse> | null;
}
export declare function createGridRoute<TUse>(): GridRoute<TUse>;
