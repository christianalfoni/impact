import { TRoutes, TRouter, createRouter } from "typed-client-router";
import { useCleanup, createHook, signal } from "impact-app";

export const routes = {
  main: "/",
  datafetching: "/examples/datafetching",
  visibility: "/examples/visibility",
  routing: "/examples/routing",
  xstate: "/examples/xstate",
  hooks: "/learn/hooks",
  signals: "/learn/signals",
} as const;

export type Routes = TRoutes<typeof routes>;

export type Router = TRouter<typeof routes>;

function Router() {
  const router = createRouter(routes);

  // We'll immediately redirect to the first example when on root
  if (router.current?.name === "main") {
    router.replace("hooks", { example: "1" });
  }

  const currentRoute = signal(router.current);
  const disposeRouterListener = router.listen(onRoute);

  useCleanup(disposeRouterListener);

  function onRoute(route?: Routes) {
    if (route) {
      currentRoute.value = route;
    }
  }

  return {
    get route() {
      return currentRoute.value;
    },
    open(route: Routes) {
      router.push(route.name, route.params);
    },
    getUrl(route: Routes) {
      return router.url(route.name, route.params);
    },
  };
}

export const useRouter = createHook(Router);
