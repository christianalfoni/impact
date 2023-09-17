import { createHook, signal, useCleanup } from "impact-app";
import { TRoutes, createRouter } from "typed-client-router";

const routes = {
  pageA: "/page-a",
  pageB: "/page-b/:id",
  pageC: "/page-c",
} as const;

function Router() {
  const router = createRouter(routes, {
    base: "/routing",
  });
  const route = signal(router.current);

  useCleanup(router.listen(handleRouteChange));

  function handleRouteChange(newRoute?: TRoutes<typeof routes>) {
    route.value = newRoute;
  }

  return {
    get route() {
      return route.value;
    },
    openPageA() {
      router.push("pageA", {});
    },
    openPageB(id: string) {
      router.push("pageB", { id });
    },
    openPageC({ showSomething }: { showSomething: boolean }) {
      router.push("pageC", {}, { showSomething: String(showSomething) });
    },
  };
}

export const useRouter = createHook(Router);
