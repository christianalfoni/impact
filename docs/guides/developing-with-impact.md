# Developing with Impact

By default Impact can be seen very much like any other global state management solution.

```tsx
import { createStore } from "@impact-react/*";

function AppStore() {
  return {};
}

export const useAppStore = createStore(AppStore);
```

The difference is that you mount that global store at the edge of your application.

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

Having a single store for state management is great, cause there is a single point of consumption. That makes it very straight forward to discover and use any state in any component. The store can be as big as you want as components reconcile only by what they consume. A good idea is to compose the store by creating namespaces:

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

If there is no friction managing the state of this store, there is no need to create any nested store. But you might want to co locate your state management with the component that interacts with it. For example around a page or a feature.

A good mental model is to think of a store provided to a component tree as a **view**. When reaching a certian level of complexity in UI and related state management, you wire up a **view**. A dashboard page with a dashboard store would be a **view**, and a feature with a feature store would be a **view**.

```tsx
function DashboardStore() {
  return {};
}

const useDashboardStore = createStore(DashboardStore);

function Dashboard() {
  const dashboard = useDashboardStore();

  return <div />;
}

function DashboardView() {
  return (
    <useDashboardStore.Provider>
      <Dashboard />
    </useDashboardStore.Provider>
  );
}
```

The view component simply wires your store to the rest of the component tree. It is also a good candidate to resolve any asynchronous state dependencies, provide a suspense boundary and do error handling for the view.

```tsx
function DashboardView() {
  const appStore = useAppStore();

  const projects = use(appStore.fetchProjects());

  return (
    <useDashboardStore.Provider projects={projects}>
      <Suspense fallback={<DashboardSkeleton />}>
        <ErrorBoundary view="dashboard">
          <Dashboard />
        </ErrorBoundary>
      </Suspense>
    </useDashboardStore.Provider>
  );
}
```
