import { ObserverContext, SignalNotifier } from "./ObserverContext";

// This object is used by the "impact-react-debugger" to access internals
export const debugHooks: {
  onGetValue?: (context: ObserverContext, signal: SignalNotifier) => void;
  onSetValue?: (
    signal: SignalNotifier,
    value: unknown,
    derived?: boolean,
  ) => void;
  onEffectRun?: (effect: () => void) => void;
} = {};
