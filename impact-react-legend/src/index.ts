import {
  onDidMount,
  onWillUnmount,
  createProvider,
  configureComponent,
} from "@impact-react/component";
import { observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

export { onDidMount, onWillUnmount, createProvider };

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
