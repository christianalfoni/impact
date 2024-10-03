import {
  DebugEvent as _DebugEvent,
  SerializedStore as _SerializedStore,
} from "@impact-react/store";

export type StateChange = {
  timestamp: number;
  key: string;
  oldValue: unknown;
  newValue: unknown;
};

export type ComponentData = {
  id: string;
  name: string;
  props: Record<string, unknown>;
  state: Record<string, unknown>;
  children: ComponentData[];
  stateTimeline: StateChange[];
  stale: boolean;
  reactFiberId: number;
  highlighted: boolean;
};

export const DEBUG_SOURCE = "impact-react-debugger";
export type DebugEvent = _DebugEvent;
export type SerializedStore = _SerializedStore;

export type DebugData = {
  source: typeof DEBUG_SOURCE;
  event: DebugEvent;
};

export const CONNECT_DEBUG_MESSAGE: DebugData = {
  source: DEBUG_SOURCE,
  event: { type: "connected" },
};

export type DebuggerProtocol =
  | {
      type: "highlight-element";
      data: { reactFiberId: number; componentDisplayName: string };
    }
  | {
      type: "highlight-clean";
      data: undefined;
    };
