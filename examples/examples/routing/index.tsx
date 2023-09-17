import { createHooksProvider } from "impact-app";
import { useRouter } from "./useRouter";
import { Pages } from "./Pages";

const HooksProvider = createHooksProvider({
  useRouter,
});

export function RoutingExample() {
  return (
    <HooksProvider>
      <Pages />
    </HooksProvider>
  );
}
