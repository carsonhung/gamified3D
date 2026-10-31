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

const TYPING_TAGS: ReadonlySet<string> = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function isTypingTarget(target: EventTarget | null): boolean {
  if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) return false;
  return target.isContentEditable || TYPING_TAGS.has(target.tagName);
}

/** Maps physical keys to game actions. Keys bound to nothing it handles are left alone. */
export function createActionInput<A extends string>(options: ActionInputOptions<A>): ActionInput<A> {
  const target = options.target ?? window;
  const hold = new Set<A>(options.hold);
  const press = new Set<A>(options.press);
  let bindings = options.bindings;
  let held: A[] = [];

  function actionFor(code: string): A | null {
    for (const action of Object.keys(bindings) as A[]) {
      if (bindings[action].includes(code)) return action;
    }
    return null;
  }

  function onKeyDown(event: Event): void {
    const key = event as KeyboardEvent;
    if (options.isEnabled?.() === false || isTypingTarget(key.target)) return;
    const action = actionFor(key.code);
    if (!action || (!hold.has(action) && !press.has(action))) return;
    key.preventDefault();
    if (press.has(action)) {
      if (!key.repeat) options.onPress?.(action);
      return;
    }
    options.onHoldStart?.(action);
    held = [...held.filter((a) => a !== action), action];
  }

  function onKeyUp(event: Event): void {
    const action = actionFor((event as KeyboardEvent).code);
    if (action && hold.has(action)) held = held.filter((a) => a !== action);
  }

  // A key released while the window is unfocused never sends keyup.
  function onBlur(): void {
    held = [];
  }

  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('keyup', onKeyUp);
  target.addEventListener('blur', onBlur);

  return {
    get held() {
      return held[held.length - 1] ?? null;
    },
    setBindings(next) {
      bindings = next;
    },
    clearHeld() {
      held = [];
    },
    dispose() {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
      target.removeEventListener('blur', onBlur);
      held = [];
    },
  };
}
