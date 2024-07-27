# Routing

The term "single page application" does not mean there is necessarily only a single page or view of the application. It just means that there is a single HTML file that bootstraps the application on the client. You will still need a client side router to handle page transitions, use URL queries to persist state etc.

There are many different client side routers and we will be using [typed-client-router](https://github.com/christianalfoni/typed-client-router) in this example.

```ts
import { createRouter, TRoutes } from "typed-client-router";
import { observe, signal } from "impact-react";
import { createMain, Main } from "./main";
import { createItems, Items } from "./items";

const routes = {
  main: "/",
  items: "/items",
  item: "/items/:id",
} as const;

type Route = TRoutes<typeof routes>;

type Page =
  | {
      name: "notFound";
    }
  | {
      name: "main";
      page: Main;
    }
  | {
      name: "items";
      page: Items;
    };

function createApp() {
  // We create the router
  const router = createRouter(routes);
  // We create a signal representing the route with the page
  const route = signal(createPage(router.current));
  // We listen to route changes and create the relevant page
  router.listen((route) => route(createPage(route)));

  return {
    router,
    get route() {
      return route();
    },
  };

  // Private functions can be defined below the return statement to more clearly see
  // what signals and public interface the application exposes
  function createPage(route?: Route): Page {
    const currentRoute = route();

    // If we are already on a page we dispose of it
    if (currentRoute) {
      currentRoute.page.dispose();
    }

    // There might not be a matching route, where we set a "not found" state
    if (!route) {
      return {
        name: "notFound",
      };
    }

    // We create the relevant page for the route
    switch (route.name) {
      case "main": {
        return {
          name: "main",
          page: createMain(),
        };
      }
      case "items": {
        return {
          name: "items",
          page: createItems(),
        };
      }
      case "item": {
        return {
          name: "items",
          // Notice that routing does not need to be nested into your app. It is translating url params/queries into state
          page: createItems(route.params.id),
        };
      }
    }
  }
}

const app = createApp();

export const useApp = () => app;
export const useMain = () =>
  // you might consider throwing an error here instead
  app.route.name === "main" ? app.route.page : null;
export const useItems = () =>
  app.route.name === "items" ? app.route.page : null;
```

Implementing a state first router is a lower abstraction than for example [react-router](), but it gives you more flexibility with less API surface. In the example above you can choose to:

- Expose your own stricter and typed navigation interface to React
- Cache pages
- Manipulate URL queries without worrying about reconciliation in React

You can now consume this application in React by:

```tsx
import { observe } from "impact-app";
import { useApp, useMain, useItems } from "./app";

const App = observe(() => {
  const app = useApp();

  if (app.page.name === "notFound") {
    return <h4>Not Found</h4>;
  }

  if (app.page.name === "main") {
    return <Main />;
  }

  if (app.page.name === "items" || app.page.name === "item") {
    return <Items />;
  }
});

const Main = observe(() => {
  const main = useMain();

  return <h1>Main Page</h1>;
});

const Items = observe(() => {
  const items = useItems();

  let itemChildren;

  // When we create items with an ID we created the current
  // item
  if (items.current) {
    itemChildren = <div>The item</div>;
  }

  return (
    <div>
      <h1>Items Page</h1>
      {itemChildren}
    </div>
  );
});
```
