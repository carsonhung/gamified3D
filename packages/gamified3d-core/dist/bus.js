/**
 * Typed pub/sub between the UI layer and the game layer. Create one per game instance so two
 * canvases on a page never hear each other.
 */
export class EventBus {
    handlers = new Map();
    on(event, handler) {
        let set = this.handlers.get(event);
        if (!set) {
            set = new Set();
            this.handlers.set(event, set);
        }
        set.add(handler);
        return () => set.delete(handler);
    }
    emit(event, ...payload) {
        const set = this.handlers.get(event);
        if (!set)
            return;
        // Copy first: a handler may unsubscribe itself or others while we iterate.
        const [value] = payload;
        for (const handler of [...set])
            handler(value);
    }
    clear() {
        this.handlers.clear();
    }
}
