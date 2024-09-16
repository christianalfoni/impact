import {
  onWillUnmount,
  onDidMount,
  configureComponent,
  createProvider,
} from "@impact-react/component";
import { observable, runInAction, autorun } from "mobx";

export { onWillUnmount, onDidMount, createProvider };

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
