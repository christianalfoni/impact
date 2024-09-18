import { configureComponent, useStore } from "@impact-react/component";
import { observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

export { useStore };

export type { Cleanup } from "@impact-react/component";

export const createComponent = configureComponent((propValue) => {
  const value = observable(propValue);

  return {
    get() {
      return value.get();
    },
    set(newPropValue) {
      value.set(newPropValue);
    },
  };
}, observer);
