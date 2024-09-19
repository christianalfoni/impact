import { configureStore } from "@impact-react/store";
import { observable, runInAction } from "mobx";

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
