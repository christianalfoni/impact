import { TRoutes, TRouter, createRouter } from "typed-client-router";
import { cleanup, createHook, signal } from "impact-app";
import { routes } from "../routes";

export type Routes = TRoutes<typeof routes>;

export type Router = TRouter<typeof routes>;

function Router() {
  const router = createRouter(routes);

  // We'll immediately redirect to the first example when on root
  if (router.current?.name === "main") {
    router.replace("caching", { example: "1" });
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
}

export const useRouter = createHook(Router);