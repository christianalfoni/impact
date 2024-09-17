import {
  onDidMount,
  onWillUnmount,
  createProvider,
  configureComponent,
} from "@impact-react/component";
import { signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";

export { onDidMount, onWillUnmount, createProvider };

export const createComponent = configureComponent(
  (propValue) => {
    const value = signal(propValue);

    return {
      get() {
        return value.value;
      },
      set(newPropValue) {
        value.value = newPropValue;
      },
    };
  },
  (comp) => (props) => {
    useSignals();

    return comp(props);
  },
);
