import type { Point } from './grid.js';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * What a grid game needs from a way of drawing the grid (2D top-down, isometric, 3D diorama),
 * so the game logic never depends on the projection. `TPointer` is whatever the renderer's
 * pointer event looks like.
 */
export interface GridProjection<TPointer> {
  /** World-space area the map covers, for camera bounds. */
  readonly bounds: Rect;
  /** Size of one cell in world units, for fitting the camera. */
  readonly cellSize: { width: number; height: number };
  /** Duration of one grid step in this projection, in ms. */
  readonly stepMs: number;
  /** Where an actor standing on the cell has its feet. */
  actorAnchor(x: number, y: number): Point;
  /** Draw order for an actor on the cell, so nearer actors cover farther ones. */
  actorDepth(x: number, y: number): number;
  pointerToCell(pointer: TPointer): Point;
  destroy(): void;
}
