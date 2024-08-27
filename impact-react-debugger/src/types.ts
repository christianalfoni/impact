type SourceLocation = {
  name: string;
  path: string;
};

type ObserverCategory = "component" | "effect" | "derived";

type ObserverInfo = SourceLocation & {
  type: ObserverCategory;
};

export type StoreDebugInfo = { name: string; props: any };

export const DEBUG_SOURCE = "impact-react-debugger";

type ConnectedPayload = {
  connected: true;
};

type SignalUpdatedPayload = {
  signal_updated: {
    value: any;
    ref: any;
    source: SourceLocation;
    target: SourceLocation;
    observers: ObserverInfo[];
  };
};

type DerivedUpdatedPayload = {
  derived_updated: {
    value: any;
    ref: any;
    source: SourceLocation;
    target: SourceLocation;
    observers: ObserverInfo[];
  };
};

type EffectUpdatedPayload = {
  effect_updated: {
    name: string;
    target: SourceLocation;
    ref: any;
  };
};

type StoreMountedPayload = {
  store_mounted: {
    store: any;
    parentStore: any;
    props: Record<string, any>;
    observables: Array<
      | {
          type: "signal";
          name: string;
          initialValue: any;
          ref: any;
        }
      | {
          type: "derived";
          name: string;
          initialValue: any;
          ref: any;
        }
      | {
          type: "effect";
          name: string;
          ref: any;
        }
    >;
  };
};

type StoreUnmountedPayload = {
  store_unmounted: {
    store: any;
    parentStore: any;
  };
};

export type DebugDataPayload =
  | ConnectedPayload
  | StoreMountedPayload
  | StoreUnmountedPayload
  | SignalUpdatedPayload
  | DerivedUpdatedPayload
  | EffectUpdatedPayload;

export type DebugData = {
  source: typeof DEBUG_SOURCE;
  payload: DebugDataPayload;
};

export const CONNECT_DEBUG_MESSAGE: DebugData = {
  source: DEBUG_SOURCE,
  payload: { connected: true },
};
