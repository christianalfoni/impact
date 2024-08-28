import { ObserverContext, SignalNotifier } from "./ObserverContext";
import { types } from "impact-react-debugger";

// This object is used by the "impact-react-debugger" to access internals
export const debugHooks: {
  onGetValue?: (context: ObserverContext, signal: SignalNotifier) => void;
  onSetValue?: (
    signal: SignalNotifier,
    value: unknown,
    derived?: boolean,
  ) => void;
  onEffectRun?: (effect: () => void) => void;
  onStoreMounted?: (props: types.StoreMountedPayload["store_mounted"]) => void;
  onStoreUnmounted?: (
    props: types.StoreUnmountedPayload["store_unmounted"],
  ) => void;
} = {};
