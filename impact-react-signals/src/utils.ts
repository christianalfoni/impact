// We need to know if we are resolving a store with an active ObserverContext
// for a component. If so we do not want to track signal access in the store

import { getResolvingReactiveContextContainer } from "@impact-react/component";
import { ObserverContext } from "./ObserverContext";

// itself
export function isResolvingStoreFromComponent(
  observerContext: ObserverContext,
) {
  return (
    observerContext.type === "component" &&
    getResolvingReactiveContextContainer()
  );
}
