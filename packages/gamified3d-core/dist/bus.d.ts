type Handler<T> = (payload: T) => void;
/** Payloads of `undefined` are emitted with no argument: `bus.emit('ready')`. */
export type EmitArgs<T> = T extends undefined ? [] : [T];
/**
 * Typed pub/sub between the UI layer and the game layer. Create one per game instance so two
 * canvases on a page never hear each other.
 */
export declare class EventBus<Events extends object> {
    private readonly handlers;
    on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void;
    emit<K extends keyof Events>(event: K, ...payload: EmitArgs<Events[K]>): void;
    clear(): void;
}
export {};
