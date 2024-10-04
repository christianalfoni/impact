import { DebugMessage } from "@impact-react/store";

export type StateChange = {
  timestamp: number;
  key: string;
  oldValue: unknown;
  newValue: unknown;
};

export type StoreData = {
  id: string;
  name: string;
  props: Record<string, unknown>;
  state: Record<string, unknown>;
  children: StoreData[];
  stateTimeline: StateChange[];
  stale: boolean;
  highlighted: boolean;
};

export type BackgroundScriptMessage =
  | {
      name: "init";
    }
  | {
      name: "message";
      message: DebugMessage;
    };
