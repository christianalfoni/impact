import * as Impact from "../src";

describe("ObservableComputedState", () => {
  it("should compute its initial state", () => {
    const computed = Impact.computed(() => 0);

    expect(computed.get()).toBe(0);
  });
  it("should compute from other ObservableState and update", () => {
    expect.assertions(2);

    const state = Impact.value(0);
    const computed = Impact.computed(() => state.get());

    expect(computed.get()).toBe(0);
    state.set(1);
    expect(computed.get()).toBe(1);
  });
});
