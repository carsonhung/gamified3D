const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
export function isTypingTarget(target) {
    if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement))
        return false;
    return target.isContentEditable || TYPING_TAGS.has(target.tagName);
}
/** Maps physical keys to game actions. Keys bound to nothing it handles are left alone. */
export function createActionInput(options) {
    const target = options.target ?? window;
    const hold = new Set(options.hold);
    const press = new Set(options.press);
    let bindings = options.bindings;
    let held = [];
    function actionFor(code) {
        for (const action of Object.keys(bindings)) {
            if (bindings[action].includes(code))
                return action;
        }
        return null;
    }
    function onKeyDown(event) {
        const key = event;
        if (options.isEnabled?.() === false || isTypingTarget(key.target))
            return;
        const action = actionFor(key.code);
        if (!action || (!hold.has(action) && !press.has(action)))
            return;
        key.preventDefault();
        if (press.has(action)) {
            if (!key.repeat)
                options.onPress?.(action);
            return;
        }
        options.onHoldStart?.(action);
        held = [...held.filter((a) => a !== action), action];
    }
    function onKeyUp(event) {
        const action = actionFor(event.code);
        if (action && hold.has(action))
            held = held.filter((a) => a !== action);
    }
    // A key released while the window is unfocused never sends keyup.
    function onBlur() {
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
