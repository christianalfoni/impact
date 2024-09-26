export type StateChange = {
  timestamp: number;
  key: string;
  oldValue: any;
  newValue: any;
};

export type ComponentData = {
  id: string;
  name: string;
  props: Record<string, any>;
  state: Record<string, any>;
  children: ComponentData[];
  stateTimeline: StateChange[];
  stale: boolean;
};
