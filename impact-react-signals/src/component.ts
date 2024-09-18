import { configureComponent, useStore } from "@impact-react/component";
import { signal } from "./signal";
import { observer } from "./observers";

export type { Cleanup } from "@impact-react/component";

export { useStore };

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
}, observer);
