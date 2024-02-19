import { componentConsumptionHooks } from "./context";
import { ObserverContext, observer } from "./signal";

export type { Signal, ObserverContextType } from "./signal";
export {
  signal,
  derived,
  effect,
  use,
  ObserverContext,
  SignalTracker,
  signalDebugHooks,
} from "./signal";
export { cleanup } from "./context";
export { store } from "./store";

componentConsumptionHooks.onConsume = observer;
componentConsumptionHooks.onConsumed = () => {
  ObserverContext.current?.[Symbol.dispose]();
};
