import { ObservableState } from "../src";

describe("ObservableState", () => {
  it("should take an initial value", () => {
    const state = new ObservableState(0);

    expect(state.get()).toBe(0);
  });
  it("should be able to set a value", () => {
    const state = new ObservableState(0);
    state.set(1);
    expect(state.get()).toBe(1);
  });
  it("should be able to update a value", () => {
    const state = new ObservableState(0);
    state.update((current) => current + 1);
    expect(state.get()).toBe(1);
  });
  it("should be able to subscribe", () => {
    expect.assertions(1);
    const state = new ObservableState(0);
    state.subscribe((value) => {
      expect(value).toBe(1);
    });
    state.set(1);
  });
});
