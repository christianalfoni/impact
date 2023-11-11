import { componentConsumptionHooks } from "impact-context";
import { ObserverContext, observer } from "impact-signal";

export * from "impact-context";
export * from "impact-signal";

componentConsumptionHooks.onConsume = observer;
componentConsumptionHooks.onConsumed = () => {
  ObserverContext.current?.[Symbol.dispose]();
};
