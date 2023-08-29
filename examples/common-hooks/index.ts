import { createHooksProvider } from "../../src/ReactiveHooks";
import { useApi } from "./useApi";
import { useRouter } from "./useRouter";

export const commonHooks = {
  useApi,
  useRouter,
};

export const CommonHooksProvider = createHooksProvider(commonHooks);
