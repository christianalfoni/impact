import { configureStore } from "@impact-react/store";
import { signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";

export type { Cleanup } from "@impact-react/store";

export const __observer = (comp) => (props) => {
  useSignals();

  return comp(props);
};

export const createStore = configureStore((propValue) => {
  const value = signal(propValue);

  return {
    get() {
      return value.value;
    },
    set(newPropValue) {
      value.value = newPropValue;
    },
  };
});
