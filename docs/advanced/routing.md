# Routing

The term "single page application" does not mean there is necessarily only a single page or view of the application. It just means that there is a single HTML file that bootstraps the application on the client. You will still need a client side router to handle page transitions, use URL queries to persist state etc.

There are many different client side routers and we will be using [typed-client-router](https://github.com/christianalfoni/typed-client-router) in this example.

```ts
import { createRouter } from "typed-client-router";
import { observer, signal } from "impact-react";
import { createMain, Main } from "./main";
import { createItems, Items } from "./items";

function createApp() {
  // We create the router
  const router = createRouter({
    main: "/",
    items: "/items",
    item: "/items/:id",
  });

  // We create a signal representing the route
  const route = signal(router.current);
  const main = createMain();
  const items = createItems(router);

  // We listen to route changes and create the relevant page
  router.listen(route);

  return {
    get route() {
      return route();
    },
    main,
    items,
  };
}

const app = createApp();
```

Implementing a state first router is a lower abstraction than for example [react-router](https://reactrouter.com/en/main), but it gives you more flexibility with less API surface. In the example above you can choose to:

- Expose your own stricter and typed navigation interface to React
- Cache pages
- Manipulate URL queries without worrying about reconciliation in React

You can now consume this application in React by:

```tsx
import { observer } from "impact-app";
import { useApp, useMain, useItems } from "./app";

const App = observer(() => {
  const app = useApp();

  if (!app.route) {
    return <h4>Not Found</h4>;
  }

  if (app.route.name === "main") {
    return <Main />;
  }

  if (app.route.name === "items" || app.route.name === "item") {
    return <Items />;
  }
});

const Main = observer(() => {
  const { main } = useApp();

  return <h1>Main Page</h1>;
});

const Items = observer(() => {
  const { items } = useApp();

  let itemChildren;

  // The current item is populated by the Items, which listens
  // to url changes of "item"
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
