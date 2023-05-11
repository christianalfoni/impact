import * as Impact from "../src";
import { sleep } from "./utils";

describe("ObservableSubscription", () => {
  it("should have initial value", () => {
    const subscription = Impact.subscription(0, () => {
      return () => {};
    });

    expect(subscription.get()).toBe(0);
  });
  it("should update the value", async () => {
    const subscription = Impact.subscription(0, (update) => {
      sleep(0).then(() => {
        update(1);
      });
      return () => {};
    });

    expect(subscription.get()).toBe(0);
    await sleep(0);
    expect(subscription.get()).toBe(1);
  });
  it("should update only with a subscriber", async () => {
    const subscription = Impact.subscription(
      0,
      (update) => {
        sleep(0).then(() => {
          update(1);
        });
        return () => {};
      },
      true
    );

    await sleep(0);
    expect(subscription.get()).toBe(0);
    subscription.subscribe(() => {});
    await sleep(0);
    expect(subscription.get()).toBe(1);
  });
});
