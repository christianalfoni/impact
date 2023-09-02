import { createHooksProvider } from "../../src/ReactiveHooks";
import { useApi } from "./useApi";
import { useRouter } from "./useRouter";

export const globalHooks = {
  useApi,
  useRouter,
};

export const GlobalHooksProvider = createHooksProvider(globalHooks);
