import { type Camera, type Object3D } from 'three';
export interface TargetOptions {
    /** Accessible name, also used as the hidden button's text. */
    label: string;
    /** Disabled targets still hover (to explain why) but never select. */
    isDisabled?: boolean;
}
export interface InteractionTarget {
    readonly object: Object3D;
    readonly label: string;
    readonly isDisabled: boolean;
}
export type InteractionEvent = 'hover' | 'focus' | 'select';
export type InteractionHandler = (target: InteractionTarget | null) => void;
export interface InteractionOptions {
    camera: Camera;
    canvas: HTMLCanvasElement;
    /** Accessible name for the group of targets, e.g. "Game board". */
    label: string;
}
export interface Interaction {
    readonly hovered: InteractionTarget | null;
    readonly focused: InteractionTarget | null;
    readonly selected: InteractionTarget | null;
    /** Registers an object (and its children) as pickable. Tab order follows registration order. */
    addTarget(object: Object3D, options: TargetOptions): InteractionTarget;
    updateTarget(target: InteractionTarget, options: Partial<TargetOptions>): void;
    removeTarget(target: InteractionTarget): void;
    /** Sets the selection without user input; fires "select". */
    select(target: InteractionTarget | null): void;
    /** Moves keyboard focus to a target's hidden button. */
    focus(target: InteractionTarget): void;
    on(event: InteractionEvent, handler: InteractionHandler): () => void;
    dispose(): void;
}
export declare function createInteraction(options: InteractionOptions): Interaction;
