type Handler<T> = (payload: T) => void;

/** Payloads of `undefined` are emitted with no argument: `bus.emit('ready')`. */
export type EmitArgs<T> = T extends undefined ? [] : [T];

/**
 * Typed pub/sub between the UI layer and the game layer. Create one per game instance so two
 * canvases on a page never hear each other.
 */
export class EventBus<Events extends object> {
  private readonly handlers = new Map<keyof Events, Set<Handler<never>>>();

  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as Handler<never>);
    return () => set.delete(handler as Handler<never>);
  }

  emit<K extends keyof Events>(event: K, ...payload: EmitArgs<Events[K]>): void {
    const set = this.handlers.get(event);
    if (!set) return;
    // Copy first: a handler may unsubscribe itself or others while we iterate.
    const [value] = payload as [Events[K]?];
    for (const handler of [...set]) (handler as Handler<Events[K] | undefined>)(value);
  }

  clear(): void {
    this.handlers.clear();
  }
}
