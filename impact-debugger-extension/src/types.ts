import { DebugMessage } from "@impact-react/store";

export type StateChange = {
  timestamp: number;
  key: string;
  oldValue: unknown;
  newValue: unknown;
};

export type StoreNode = {
  id: string;
  children: StoreNode[];
};

export type StoreData = {
  id: string;
  parentId?: string;
  name: string;
  props: Record<string, unknown>;
  state: Record<string, unknown>;
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
