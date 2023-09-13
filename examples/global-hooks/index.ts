import { createHooksProvider } from "impact-app";
import { useApi } from "./useApi";
import { useRouter } from "./useRouter";

export const globalHooks = {
  useApi,
  useRouter,
};

export const GlobalHooksProvider = createHooksProvider(globalHooks);
