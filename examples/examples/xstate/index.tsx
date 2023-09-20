import { createHooksProvider } from "impact-app";
import { useToggle } from "./useToggle";
import { Toggle } from "./Toggle";
import { Flex, Heading } from "@radix-ui/themes";

const HooksProvider = createHooksProvider({
  useToggle,
});

export function XStateExample() {
  return (
    <HooksProvider>
      <Flex direction="column" gap="6">
        <Heading>XState</Heading>
        <Toggle />
      </Flex>
    </HooksProvider>
  );
}
