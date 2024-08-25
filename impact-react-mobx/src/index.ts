import { observable } from "mobx";
import {
  cleanup,
  createStore as createImpactStore,
  Store,
  receiver,
  emitter,
} from "impact-react-store";

export { cleanup, receiver, emitter };

export function createStore<
  T extends Record<string, unknown>,
  A extends Record<string, any> | void,
>(store: Store<T, A>) {
  return createImpactStore(
    store,
    (props) => {
      return observable(props);
    },
    (props, signalProps) => {
      for (const key in signalProps) {
        signalProps[key] = props[key];
      }
    },
    (signalProps) => {
      const storeProps: any = {};

      for (const key in signalProps) {
        Object.defineProperty(storeProps, key, {
          get() {
            return signalProps[key];
          },
        });
      }

      return storeProps;
    },
  );
}
