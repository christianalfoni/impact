import { configureStore } from "@impact-react/store";
import { observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

export const __observer = observer;

export const createStore = configureStore((propValue) => {
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
