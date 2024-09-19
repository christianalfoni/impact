import { configureStore } from "@impact-react/store";
import { signal } from "./signal";
import { observer } from "./observers";

export const __observer = observer;

export const createStore = configureStore((propValue) => {
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
