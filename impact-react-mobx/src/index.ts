import { configureStore } from "@impact-react/store";
import { observable, runInAction } from "mobx";
import { observer } from "mobx-react-lite";

export const __observer = observer;

export const createStore = configureStore((propValue) => {
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
});
