import { facingFromDelta, type Facing, type Point } from './grid.js';

export type RouteStep<TUse> = { kind: 'step'; facing: Facing } | { kind: 'use'; use: TUse };

/** A queued walk (from tap-to-move) plus what to do on arrival. The host performs each step. */
export interface GridRoute<TUse> {
  readonly isActive: boolean;
  set(path: readonly Point[], use?: TUse | null): void;
  clear(): void;
  /** The next thing to do from `position`, or null when the route is finished. */
  next(position: Point): RouteStep<TUse> | null;
}

export function createGridRoute<TUse>(): GridRoute<TUse> {
  let path: Point[] = [];
  let pending: TUse | null = null;

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
      if (cell) return { kind: 'step', facing: facingFromDelta(cell.x - position.x, cell.y - position.y) };
      if (pending === null) return null;
      const use = pending;
      pending = null;
      return { kind: 'use', use };
    },
  };
}
