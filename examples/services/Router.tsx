import { Service, useService } from "impact-app";
import { TRoutes, TRouter, createRouter } from "typed-client-router";
import { Signal } from "impact-app";
import { Disposable } from "impact-app";
import { Link } from "@radix-ui/themes";
import { routes } from "./routes";

export type Routes = TRoutes<typeof routes>;

export type Router = TRouter<typeof routes>;

@Service()
export class RouterService extends Disposable {
  private _router: Router;

  @Signal()
  private _route: Routes;
  get route() {
    return this._route;
  }

  constructor() {
    super();
    this._router = createRouter(routes);

    if (!this._router.current) {
      this._router.replace("caching", { example: "1" });
    }

    // Since we enforce a valid route
    this._route = this._router.current!;

    const disposeRouterListener = this._router.listen((route) => {
      if (route) {
        this._route = route;
      }
    });

    this.onDispose(disposeRouterListener);
  }

  open(route: Routes) {
    this._router.push(route.name, route.params);
  }

  getUrl(route: Routes) {
    return this._router.url(route.name, route.params);
  }
}

export const useRouter = () => useService(RouterService);

export function ExampleLink({
  name,
  params,
  children,
}: Routes & {
  children: string;
}) {
  const router = useRouter();

  return (
    <Link
      href={router.getUrl({ name, params })}
      onClick={(event) => {
        event.preventDefault();
        router.open({ name, params });
      }}
    >
      {children}
    </Link>
  );
}
