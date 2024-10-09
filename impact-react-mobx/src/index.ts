import { configureStore } from "@impact-react/store";
import { autorun, isObservable, observable, runInAction, toJS } from "mobx";
import { observer } from "mobx-react-lite";

export type { Cleanup } from "@impact-react/store";

export const __observer = observer;

export const createStore = configureStore(
  (propValue) => {
    const value = observable.box(propValue);

    return {
      get() {
        return value.get();
      },
      set(newPropValue) {
        runInAction(() => {
          value.set(newPropValue);
        });
      },
    };
  },
  (storeValue, updateDebugger) =>
    autorun(() => {
      const state: any = {};

      function traverse(value: any, target: any, isOnlyTracking = false) {
        const isValueObservable = isObservable(value);

        for (const key in value) {
          const nestedValue = value[key];
          const isTraverseable =
            typeof nestedValue === "object" && nestedValue !== null;

          if (isOnlyTracking && isTraverseable) {
            traverse(nestedValue, target, isValueObservable);
            continue;
          }

          if (isValueObservable) {
            target[key] = toJS(nestedValue);
          } else if (isTraverseable) {
            target[key] = {};
            traverse(nestedValue, target[key], false);
          }
        }
      }

      traverse(storeValue, state);

      updateDebugger(state);
    }),
);
