import { Observable } from "../src";

describe("Observable", () => {
  it("should subscribe and dispose", () => {
    const observable = new Observable();

    let notifiedCount = 0;

    const dispose = observable.subscribe(() => {
      notifiedCount++;
    });

    observable["notify"]();

    expect(notifiedCount).toBe(1);

    dispose();
    observable["notify"]();

    expect(notifiedCount).toBe(1);
  });
  it("should have have a referencable subscribe", () => {
    const observable = new Observable();
    const subscribe = observable.subscribe;

    let notifiedCount = 0;

    subscribe(() => {
      notifiedCount++;
    });

    observable["notify"]();

    expect(notifiedCount).toBe(1);
  });
});
