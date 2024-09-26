import { DebugEvent as _DebugEvent } from "@impact-react/store";

export const DEBUG_SOURCE = "impact-react-debugger";
export type DebugEvent = _DebugEvent;

export type DebugData = {
  source: typeof DEBUG_SOURCE;
  event: DebugEvent;
};

export const CONNECT_DEBUG_MESSAGE: DebugData = {
  source: DEBUG_SOURCE,
  event: { type: "connected" },
};
