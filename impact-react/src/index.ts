import { componentConsumptionHooks } from "./store";
import { ObserverContext, observer } from "./signal";

export type { Signal, ObserverContextType, ObservablePromise } from "./signal";
export {
  signal,
  derived,
  effect,
  use,
  ObserverContext,
  SignalTracker,
  signalDebugHooks,
} from "./signal";

export type { Store } from "./store";
export { useStore, createStoreProvider, cleanup } from "./store";

componentConsumptionHooks.onConsume = observer;
componentConsumptionHooks.onConsumed = () => {
  ObserverContext.current?.[Symbol.dispose]();
};
