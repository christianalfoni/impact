import { configureStore } from "@impact-react/store";
import { signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { memo } from "react";

export type { Cleanup } from "@impact-react/store";

export const __observer = (comp) => {
  const component = memo((props) => {
    useSignals();

    return comp(props);
  });

  component.displayName = comp.name;

  return component;
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
