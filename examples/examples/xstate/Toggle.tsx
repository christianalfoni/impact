import { Box, Button } from "@radix-ui/themes";
import { useToggle } from "./useToggle";

import { observe } from "impact-app";

export function Toggle() {
  using _ = observe();

  const { isToggled, toggle } = useToggle();

  return (
    <Box p="6">
      Is toggled? {isToggled ? "YES" : "NO"}
      <Button onClick={() => toggle()}>Toggle</Button>
    </Box>
  );
}
