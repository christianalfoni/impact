import { cleanup, getResolvingStoreContainer } from "impact-react-store";
import { ObserverContext } from "./ObserverContext";
import { debugHooks } from "./debugHooks";

export function effect(cb: () => void) {
  if (getResolvingStoreContainer() === undefined) {
    throw new Error('You can only run "effect" when creating a store');
  }

  let disposer: (() => void) | void;
  const context = new ObserverContext("effect");

  cleanup(() => disposer?.());

  runEffect();

  function runEffect() {
    disposer?.();

    ObserverContext.stack.push(context);

    cb();

    ObserverContext.stack.pop();

    disposer = context.subscribe(runEffect);

    if (debugHooks.onEffectRun) {
      debugHooks.onEffectRun(cb);
    }
  }
}
