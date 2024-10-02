# Developing with Impact

By default Impact can be seen very much like any other global state management solution.

```tsx
import { createStore } from "@impact-react/*";

function AppStore() {
  return {};
}

export const useAppStore = createStore(AppStore);
```

The difference is that you mount that global scope at the edge of your application.

```tsx
import { createRoot } from "react-dom/client";
import { useAppStore } from "./stores/AppStore";
import { App } from "./App";

const root = createRoot(document.querySelector("#root"));

root.render(
  <useAppStore.Provider>
    <App />
  </useAppStore.Provider>,
);
```

Having a single store for state management is great, cause there is a single point of consumption. That makes it very straight forward to discover and use any state in any component. The store can be as big as you want. A good idea is to compose the store by creating namespaces:

```tsx
import { createStore } from "@impact-react/*";
import { createDashboardStore } from "./dashboard";
import { createProfileStore } from "./profile";

function AppStore() {
  const dashboard = createDashboardStore();
  const profile = createProfileStore();

  return {
    dashboard,
    profile,
  };
}

export const useAppStore = createStore(AppStore);
```

It is just calling functions that returns some public interface, just like the store itself.

## When to go nested

If there is no friction managing the state of this store, there is no need to create any nested store. Perfomance will not be an issue as components only reconcile by the state they actually consume. Friction can occur when some state depends on other state. An example of this would be the current user.
