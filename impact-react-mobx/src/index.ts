import {
  onWillUnmount,
  onDidMount,
  configureComponent,
  createProvider,
  SSR,
} from "@impact-react/component";
import { observable, runInAction, autorun } from "mobx";

export { SSR, onWillUnmount, onDidMount, createProvider };

export const createComponent = configureComponent((propValue) => {
  const value = observable.box(propValue);

  return {
    get() {
      return value.get();
    },
    set(newPropValue) {
      runInAction(() => {
        value.set(newPropValue);
      });
    },
  };
}, autorun);
