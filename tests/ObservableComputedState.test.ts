import { ObservableComputedState, ObservableState } from "../src/Observable";

describe("ObservableComputedState", () => {
  it("should compute its initial state", () => {
    const computed = new ObservableComputedState(() => 0);

    expect(computed.get()).toBe(0);
  });
  it("should compute from other ObservableState and update", () => {
    expect.assertions(2);

    const state = new ObservableState(0);
    const computed = new ObservableComputedState(() => state.get());

    expect(computed.get()).toBe(0);
    state.set(1);
    expect(computed.get()).toBe(1);
  });
});
