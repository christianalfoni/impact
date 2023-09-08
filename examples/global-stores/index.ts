import { createStoresProvider } from "impact-app";
import { useApi } from "./useApi";
import { useRouter } from "./useRouter";

export const globalStores = {
  useApi,
  useRouter,
};

export const GlobalStoresProvider = createStoresProvider(globalStores);
