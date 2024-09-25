type Observations = Record<string, unknown>;

type ObservationsListener = () => void;

export class Debugger {
  private observationListeners = new Set<ObservationsListener>();
  onObservations(cb: ObservationsListener) {
    this.observationListeners.add(cb);

    return () => {
      this.observationListeners.delete(cb);
    };
  }
  reportObservations(storeValueRef: unknown, observations: Observations) {
    this.observationListeners.forEach((cb) => cb(observations));
  }
  addStoreValueRef() {}
}

export class ObservationTracker<T> {
  tracking = false;
  observations: Observations = {};
  proxy = this.createProxy(this.storeValue);
  constructor(public storeValue: T) {}

  start() {
    this.tracking = true;
    this.observations = {};
  }

  stop() {
    this.tracking = false;
    return this.observations;
  }

  private createProxy(obj: unknown, path = "") {
    const handler = {
      get: (target, prop, receiver) => {
        // Convert the property key to a string, handling symbols
        const propKey = String(prop);
        const currentPath = path ? `${path}.${propKey}` : propKey;

        // Retrieve the property value
        const value = Reflect.get(target, prop, receiver);

        if (this.tracking) {
          // Record the path if it's a leaf node (non-object or null)
          if (typeof value !== "object" || value === null) {
            this.observations[currentPath] = value;
          }
        }

        if (typeof value === "object" && value !== null) {
          // Return a new proxy for nested objects or arrays
          return this.createProxy(value, currentPath);
        }

        return value;
      },
    };

    return new Proxy(obj, handler);
  }
}
