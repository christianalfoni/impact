import { createStoresProvider } from "impact-app";
import { useVisbility } from "./useVisibility";
import { Visibility } from "./Visibility";

const StoresProvider = createStoresProvider({
  useVisbility,
});

export function VisibilityExample() {
  return (
    <StoresProvider>
      <Visibility />
    </StoresProvider>
  );
}
