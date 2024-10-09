import { configureStore } from "@impact-react/store";
import { observable, observe, isObservable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

export type { Cleanup } from "@impact-react/store";

export const __observer = observer;

export const createStore = configureStore(
  (propValue) => {
    const value = observable(propValue);

    return {
      get() {
        return value.get();
      },
      set(newPropValue) {
        value.set(newPropValue);
      },
    };
  },
  (storeValue, updateDebugger) =>
    observe(() => {
      const state: any = {};

      function traverse(value: any, target: any) {
        for (const key in value) {
          const nestedValue = value[key];
          if (isObservable(nestedValue)) {
            target[key] = nestedValue.get();
            continue;
          }

          if (typeof nestedValue === "object" && nestedValue !== null) {
            target[key] = {};
            traverse(nestedValue, target[key]);
          }
        }
      }

      traverse(storeValue, state);

      updateDebugger(state);
    }),
);
