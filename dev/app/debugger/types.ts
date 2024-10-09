export type StateChange = {
  timestamp: number;
  key: string;
  oldValue: any;
  newValue: any;
};

export type ComponentData = {
  id: string;
  name: string;
  props: null | Record<string, any>;
  state: null | Record<string, any>;
  children: ComponentData[];
  stateTimeline: StateChange[];
  stale: boolean;
  reactFiberId: number;
  highlighted: boolean;
};
