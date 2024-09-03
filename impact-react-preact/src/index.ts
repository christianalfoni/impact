import {
  cleanup,
  context,
  configureReactiveContext,
} from "@impact-react/reactive-context";
import { signal } from "@preact/signals-core";

export { cleanup, context };

export const createReactiveContext = configureReactiveContext((propValue) => {
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
