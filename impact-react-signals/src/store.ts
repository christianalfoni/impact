import { configureStore } from "@impact-react/store";
import { isSignalGetter, signal } from "./signal";
import { observer } from "./observers";
import { effect } from "./effect";

export const __observer = observer;

export const createStore = configureStore(
  (propValue) => {
    const [value, setValue] = signal(propValue);

    return {
      get() {
        return value();
      },
      set(newPropValue) {
        setValue(newPropValue);
      },
    };
  },
  (storeValue, updateDebugger) =>
    effect(() => {
      const state: any = {};

      function traverse(value: any, target: any) {
        for (const key in value) {
          const nestedValue = value[key];
          if (isSignalGetter(nestedValue)) {
            target[key] = nestedValue();
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
