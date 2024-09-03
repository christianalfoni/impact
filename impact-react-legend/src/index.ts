import {
  cleanup,
  context,
  configureReactiveContext,
} from "@impact-react/reactive-context";
import { observable } from "@legendapp/state";

export { cleanup, context };

export const createReactiveContext = configureReactiveContext((propValue) => {
  const value = observable(propValue);

  return {
    get() {
      return value.get();
    },
    set(newPropValue) {
      value.set(newPropValue);
    },
  };
});
