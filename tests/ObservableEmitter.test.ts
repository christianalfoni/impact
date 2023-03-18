import { ObservableEmitter } from "../src";

describe("ObservableEmitter", () => {
  it("should subscribe, emit and dispose", () => {
    const emitter = new ObservableEmitter<void>();

    let notifiedCount = 0;

    const dispose = emitter.subscribe(() => {
      notifiedCount++;
    });

    emitter.emit();

    expect(notifiedCount).toBe(1);

    dispose();
    emitter.emit();

    expect(notifiedCount).toBe(1);
  });
});
