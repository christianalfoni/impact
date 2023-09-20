import { Button, Flex } from "@radix-ui/themes";
import { useToggle } from "./useToggle";

import { observe } from "impact-app";

export function Toggle() {
  using _ = observe();

  const { isToggled, toggle } = useToggle();

  return (
    <Flex p="6" gap="4" align="center">
      Is toggled? {isToggled ? "YES" : "NO"}
      <Button onClick={() => toggle()}>Toggle</Button>
    </Flex>
  );
}
