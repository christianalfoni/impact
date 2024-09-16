import {
  onDidMount,
  onWillUnmount,
  createProvider,
  configureComponent,
} from "@impact-react/component";
import { signal, effect } from "@preact/signals-core";

export { onDidMount, onWillUnmount, createProvider };

export const createComponent = configureComponent((propValue) => {
  const value = signal(propValue);

  return {
    get() {
      return value.value;
    },
    set(newPropValue) {
      value.value = newPropValue;
    },
  };
}, effect);
