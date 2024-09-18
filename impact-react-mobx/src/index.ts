import { configureComponent, useStore } from "@impact-react/component";
import { observable, runInAction, configure } from "mobx";
import { observer } from "mobx-react-lite";

export { useStore };

export type { Cleanup } from "@impact-react/component";

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
