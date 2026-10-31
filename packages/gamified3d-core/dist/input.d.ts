export type KeyBindings<A extends string> = Readonly<Record<A, readonly string[]>>;
export interface ActionInputOptions<A extends string> {
    /** KeyboardEvent.code values per action, e.g. { up: ['ArrowUp', 'KeyW'] }. */
    bindings: KeyBindings<A>;
    /** Actions that repeat while held, newest wins (movement). */
    hold: readonly A[];
    /** Actions that fire once per key press, ignoring auto-repeat (interact, open menu). */
    press: readonly A[];
    onPress?: (action: A) => void;
    /** Called when a hold action starts, e.g. to cancel a tap-to-move route. */
    onHoldStart?: (action: A) => void;
    /** Gates key presses (not releases), e.g. while a dialogue is open. */
    isEnabled?: () => boolean;
    target?: EventTarget;
}
export interface ActionInput<A extends string> {
    /** The most recently pressed hold action still down, or null. */
    readonly held: A | null;
    setBindings(bindings: KeyBindings<A>): void;
    clearHeld(): void;
    dispose(): void;
}
export declare function isTypingTarget(target: EventTarget | null): boolean;
/** Maps physical keys to game actions. Keys bound to nothing it handles are left alone. */
export declare function createActionInput<A extends string>(options: ActionInputOptions<A>): ActionInput<A>;
