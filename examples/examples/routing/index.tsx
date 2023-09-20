import { createHooksProvider } from "impact-app";
import { useRouter } from "./useRouter";
import { Pages } from "./Pages";
import { Flex, Heading } from "@radix-ui/themes";

const HooksProvider = createHooksProvider({
  useRouter,
});

export function RoutingExample() {
  return (
    <HooksProvider>
      <Flex direction="column" gap="6">
        <Heading>Routing</Heading>
        <Pages />
      </Flex>
    </HooksProvider>
  );
}
