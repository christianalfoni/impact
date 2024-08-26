import { createStore as createImpactStore, Store } from "impact-react-store";
import { signal, Signal } from "./signal";

export function createStore<
  T extends Record<string, unknown>,
  A extends Record<string, () => any>,
>(store: Store<T, A>) {
  return createImpactStore(
    store,
    (props) => {
      const signalProps: Record<string, Signal<any>> = {};

      for (const key in props) {
        if (key !== "children") {
          signalProps[key] = signal(props[key]);
        }
      }

      return signalProps;
    },
    (props, signalProps) => {
      for (const key in signalProps) {
        signalProps[key][1](props[key]);
      }
    },
    (signalProps) => {
      const storeProps: any = {};

      for (const key in signalProps) {
        storeProps[key] = signalProps[key][0];
      }

      return storeProps;
    },
  );
}
