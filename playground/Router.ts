import { TRoutes, TRouter, createRouter } from "typed-client-router";
import { cleanup, signal, context } from "impact-app";

export const routes = {
  main: "/",
  datafetching: "/examples/datafetching",
  visibility: "/examples/visibility",
  routing: "/examples/routing",
  xstate: "/examples/xstate",
  stores: "/learn/stores",
  signals: "/learn/signals",
  queries: "/learn/queries",
  mutations: "/learn/mutations",
} as const;

export type Routes = TRoutes<typeof routes>;

export type Router = TRouter<typeof routes>;

export const useRouter = context(() => {
  const router = createRouter(routes);

  // We'll immediately redirect to the first example when on root
  if (router.current?.name === "main") {
    router.replace("stores", {});
  }

  const currentRoute = signal(router.current);
  const disposeRouterListener = router.listen(onRoute);

  cleanup(disposeRouterListener);

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
});
