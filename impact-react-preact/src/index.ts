import { configureStore } from "@impact-react/store";
import { signal, effect, Signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { memo } from "react";

export type { Cleanup } from "@impact-react/store";

export const __observer = (comp: any) => {
  const component = memo(function ObserverComponent(props) {
    useSignals();

    return comp(props);
  });

  component.displayName = comp.name;

  return component;
};

export const createStore = configureStore(
  (propValue) => {
    const value = signal(propValue);

    return {
      get() {
        return value.value;
      },
      set(newPropValue) {
        value.value = newPropValue;
      },
    };
  },
  (storeValue, updateDebugger) =>
    effect(() => {
      const state: any = {};

      function traverse(value: any, target: any) {
        for (const key in value) {
          const nestedValue = value[key];
          if (nestedValue instanceof Signal) {
            target[key] = nestedValue.value;
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
