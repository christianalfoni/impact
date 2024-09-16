import {
  onDidMount,
  onWillUnmount,
  createProvider,
  configureComponent,
} from "@impact-react/component";
import { observable, observe } from "@legendapp/state";

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
}, observe);
