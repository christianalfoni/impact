/**
 * A typed event.
 */
export interface Event<T> {
  /**
   *
   * @param listener The listener function will be called when the event happens.
   * @return a disposable to remove the listener again.
   */
  (listener: (e: T) => void): () => void;
}

export function emitter<T>() {
  const registeredListeners = new Set<(e: T) => void>();

  return {
    on(listener: (e: T) => void) {
      registeredListeners.add(listener);

      return () => {
        registeredListeners.delete(listener);
      };
    },
    emit(event: T) {
      registeredListeners.forEach((listener) => {
        listener(event);
      });
    },
    dispose() {
      registeredListeners.clear();
    },
  };
}
