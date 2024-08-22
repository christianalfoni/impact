type CodeLocation = {
  name: string;
  path: string;
};

type ObserverType = "component" | "effect" | "derived";

type Observer = CodeLocation & {
  type: ObserverType;
};

export type DebugDataDTO =
  | {
      id: number;
      type: "signal";
      source: CodeLocation;
      target: CodeLocation;
      observers: Observer[];
      value: any;
    }
  | {
      id: number;
      type: "derived";
      source: CodeLocation;
      target: CodeLocation;
      observers: Observer[];
      value: any;
    }
  | { id: number; type: "effect"; name: string; target: CodeLocation }
  | { type: "store"; name: string };

export const CONNECT_DEBUG = {
  source: "impact-react-debugger",
  payload: { event: "connect" },
};

export type DebugData =
  | typeof CONNECT_DEBUG
  | {
      source: "impact-react-debugger";
      payload: { event: "message"; payload: DebugDataDTO };
    };
