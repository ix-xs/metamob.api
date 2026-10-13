type Listener<T> = (payload: T) => void;

/**
 * A minimal typed event emitter. A listener that throws never breaks the
 * code that emitted: the error is re-emitted as an `error` event instead.
 *
 * @internal
 */
export class Emitter<Events extends { error: unknown }> {
  readonly #listeners = new Map<keyof Events, Set<Listener<never>>>();

  /** Subscribes to an event. Returns a function that unsubscribes. */
  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    let set = this.#listeners.get(event);
    if (!set) this.#listeners.set(event, (set = new Set()));
    set.add(listener as Listener<never>);
    return () => this.off(event, listener);
  }

  /** Subscribes for a single occurrence. */
  once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    const off = this.on(event, (payload) => {
      off();
      listener(payload);
    });
    return off;
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    this.#listeners.get(event)?.delete(listener as Listener<never>);
  }

  /** Whether anyone listens, so a payload that is costly to build can be skipped. */
  has(event: keyof Events): boolean {
    return (this.#listeners.get(event)?.size ?? 0) > 0;
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.#listeners.get(event);
    if (!set?.size) return;
    for (const listener of [...set]) {
      try {
        (listener as Listener<Events[K]>)(payload);
      } catch (error) {
        // A failing `error` listener has nowhere left to report to.
        if (event !== "error") this.emit("error", error as Events["error"]);
      }
    }
  }
}
