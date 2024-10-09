# Consuming Stores

Since **Impact** introduces such a strong concept of encapsulation of stores it is able to enable automatic observation in components. If you use the [Babel Plugin](../index.md#automatic-observation) any component consuming a store will automatically become an observer. This is not required, but the manually using the HOC `observer` is quite tedious and disrupting to the simple component definition.

When using the babel plugin you only have to follow a very simple convention. The name of your hook has to end with `Store`. So `useAppStore`, `useDashboardStore` etc.

To provide the store to a component tree use the `.Provider` prop. This is a design decision that emphasizes that the store is just a context provider that can take props and exposes a value (state management) to any nested components.

```tsx
import { useAppStore } from "./AppStore";

function NestedComponent() {
  const appStore = useAppStore();

  return <div />;
}

function App() {
  const appStore = useAppStore();

  return <NestedComponent />;
}

export function AppView() {
  return (
    <useAppStore.Provider>
      <App />
    </useAppStore.Provider>
  );
}
```

Passing state from one store to another can be done in two ways. Either you simply use the store directly in a nested store:

```ts
import { createStore } from "@impact-react/[*]";
import { useAppStore } from "./AppStore";

function DashboardStore() {
  const appStore = useAppStore();

  return {};
}

export const useDashboardStore = createStore(DashboardStore);
```

Or often you will be resolving state from one store and pass it as a prop to a nested store:

```tsx
import { useAppStore } from "./AppStore";
import { useEditIssueStore } from "./EditIssueStore";

function EditIssue() {
  const editIssueStore = useEditIssueStore();
}

function App() {
  const { currentIssue } = useAppStore();

  if (currentIssue) {
    return (
      <useEditIssueStore.Provider key={currentIssue.id} issue={currentIssue}>
        <EditIssue />
      </useEditIssueStore.Provider>
    );
  }

  return <div />;
}
```
