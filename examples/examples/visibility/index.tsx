import { createHooksProvider } from "impact-app";
import { useVisbility } from "./useVisibility";
import { Visibility } from "./Visibility";

const HooksProvider = createHooksProvider({
  useVisbility,
});

export function VisibilityExample() {
  return (
    <HooksProvider>
      <Visibility />
    </HooksProvider>
  );
}
