import { configureStore } from "impact-react-store";
import { signal } from "./signal";

export const createStore = configureStore((prop) => {
  const [value, setValue] = signal(prop);

  return {
    get() {
      return value;
    },
    set(newProp) {
      setValue(newProp);
    },
  };
});
