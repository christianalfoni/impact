import {
  onWillUnmount,
  onDidMount,
  configureComponent,
  useStore,
} from "@impact-react/component";
import { observable, runInAction } from "mobx";
import { observer } from "mobx-react-lite";

export { useStore, onWillUnmount, onDidMount };

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
}, observer);
