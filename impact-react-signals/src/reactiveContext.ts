import { configureReactiveContext } from "@impact-react/reactive-context";
import { signal } from "./signal";

export const createReactiveContext = configureReactiveContext((propValue) => {
  const [value, setValue] = signal(propValue);

  return {
    get() {
      return value();
    },
    set(newPropValue) {
      setValue(newPropValue);
    },
  };
});
