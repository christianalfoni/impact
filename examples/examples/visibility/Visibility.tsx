import { Box, Text } from "@radix-ui/themes";
import { useVisbility } from "./useVisibility";
import { useEffect } from "react";

export function Visibility() {
    using visibility = useVisbility();

    useEffect(() => visibility.onChange(console.log), []);

  return (
    <Box p="6">
        <Text size="4">Are we visible? {visibility.isVisible ? 'YEAH' : 'NO'}</Text>
        <Box>
            <Text>Check the console to see the event</Text>
        </Box>
    </Box>
  );
}
