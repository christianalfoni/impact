import { createHooksProvider } from "impact-app";
import { useToggle } from "./useToggle";
import { Toggle } from "./Toggle";

const HooksProvider = createHooksProvider({
  useToggle,
});

export function XStateExample() {
  return (
    <HooksProvider>
      <Toggle />
    </HooksProvider>
  );
}
