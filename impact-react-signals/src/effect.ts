import { ObserverContext } from "./ObserverContext";

export function effect(cb: () => void) {
  let disposer: (() => void) | void;
  const context = new ObserverContext("effect");

  runEffect();

  function runEffect() {
    disposer?.();

    ObserverContext.stack.push(context);

    cb();

    ObserverContext.stack.pop();

    disposer = context.subscribe(runEffect);
  }

  return () => {
    disposer?.();
  };
}
