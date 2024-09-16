import { configureComponent } from "@impact-react/component";
import { signal } from "./signal";
import { effect } from "./effect";

export const createComponent = configureComponent((propValue) => {
  const [value, setValue] = signal(propValue);

  return {
    get() {
      return value();
    },
    set(newPropValue) {
      setValue(newPropValue);
    },
  };
}, effect);
