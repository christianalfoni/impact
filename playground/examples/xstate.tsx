import { Flex, Heading, Text } from "@radix-ui/themes";
import { ExampleSandpack } from "../ExampleSandpack";

export function XStateExample() {
  return (
    <Flex direction="column" gap="4" grow="1">
      <Heading>XState</Heading>
      <Text>
        In this example we look at how you can use other state primitives in the
        ecosystem.
      </Text>
      <ExampleSandpack
        dependencies={["xstate"]}
        example={`import { Button, Flex } from "@radix-ui/themes";
import { observe } from "impact-app";
import { useToggle } from "./useToggle";

function Toggle() {
  const { isToggled, toggle } = useToggle();

  return (
    <Flex p="6" gap="4" align="center">
      Is toggled? {isToggled ? "YES" : "NO"}
      <Button onClick={() => toggle()}>Toggle</Button>
    </Flex>
  );
}

export default observe(Toggle)`}
        files={{
          "/useToggle.js": `import { createMachine, interpret } from "xstate";
import { createStore, signal } from "impact-app";

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

export const useToggle = createStore(Toggle);`,
        }}
      />
    </Flex>
  );
}
