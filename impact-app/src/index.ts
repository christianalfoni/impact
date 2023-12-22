import { componentConsumptionHooks } from "./context";
import { ObserverContext, observer } from "./signal";

export * from "./signal";
export * from "./context";
export * from "./store";

componentConsumptionHooks.onConsume = observer;
componentConsumptionHooks.onConsumed = () => {
  ObserverContext.current?.[Symbol.dispose]();
};
