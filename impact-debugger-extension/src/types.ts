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

export type DebuggerProtocol =
  | {
      type: "highlight-element";
      data: { reactFiberId: number; componentDisplayName: string };
    }
  | {
      type: "highlight-clean";
      data: undefined;
    };
