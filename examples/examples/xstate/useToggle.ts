import { createMachine, interpret } from "xstate";
import { createHook, signal } from "impact-app";

const toggleMachine = createMachine({
  id: "toggle",
  initial: "inactive",
  states: {
    inactive: {
      on: {
        toggle: "active",
      },
    },
    active: {
      on: {
        toggle: "inactive",
      },
    },
  },
});

function Toggle() {
  const toggleActor = interpret(toggleMachine).start();
  const isToggled = signal(toggleActor.getSnapshot().value);

  toggleActor.subscribe((snapshot) => {
    isToggled.value = snapshot.value;
  });

  return {
    get isToggled() {
      return isToggled.value === "active";
    },
    toggle() {
      toggleActor.send({ type: "toggle" });
    },
  };
}

export const useToggle = createHook(Toggle);
