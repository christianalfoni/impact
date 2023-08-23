import { Service, useService } from "impact-app";
import { TRoutes, TRouter, createRouter } from "typed-client-router";
import { Signal } from "impact-app";
import { Disposable } from "impact-app";
import { Link } from "@radix-ui/themes";

const routes = {
  example: "/examples/:number",
} as const;

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
      this._router.replace("example", { number: "1" });
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

  openExample(number: number) {
    this._router.push("example", { number: String(number) });
  }

  getExampleUrl(number: number) {
    return this._router.url("example", { number: String(number) });
  }
}

export const useRouter = () => useService(RouterService);

export function ExampleLink({
  number,
  children,
}: {
  number: number;
  children: string;
}) {
  const router = useRouter();

  return (
    <Link
      href={router.getExampleUrl(number)}
      onClick={(event) => {
        event.preventDefault();
        router.openExample(number);
      }}
    >
      {children}
    </Link>
  );
}
