import { cleanup, componentConsumptionHooks } from "impact-context";
import {
  ObserverContext,
  observer,
  effect as signalEffect,
} from "impact-signal";

export * from "impact-context";
export * from "impact-signal";

componentConsumptionHooks.onConsume = observer;
componentConsumptionHooks.onConsumed = () => {
  ObserverContext.current?.[Symbol.dispose]();
};

export function effect(cb: () => void) {
  return cleanup(signalEffect(cb));
}
