import {
  cleanup,
  context,
  configureReactiveContext,
} from "@impact-react/reactive-context";
import { observable, runInAction } from "mobx";

export { cleanup, context };

export const createReactiveContext = configureReactiveContext((propValue) => {
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
