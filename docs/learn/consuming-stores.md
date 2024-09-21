# Consuming Stores

Since **Impact** introduces such a strong concept of encapsulation of stores it is able to enable automatic observation in components. If you use the [Babel Plugin](../index.md#automatic-observation) any component consuming a store will automatically become an observer. This is not required, but the HOC `observer` is quite tedious and disrupting to the simple component definition.

When using the babel plugin you only have to follow a very simple convention. The name of your hook has to end with `Store`. So `useAppStore`, `useDashboardStore` etc.

To provide the store to a component tree use the `.provider` prop. This is a design decision that allows you to both provide and consume the store from the same component.

```tsx
import { useAppStore } from "./AppStore";

function NestedComponent() {
  const appStore = useAppStore();

  return <div />;
}

export default useAppStore.provider(function App() {
  const appStore = useAppStore();

  return <NestedComponent />;
});
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

const EditIssue = useEditIssueStore.provider(function EditIssue() {
  const editIssueStore = useEditIssueStore();
});

function App() {
  const { currentIssue } = useAppStore();

  if (currentIssue) {
    return <EditIssue key={currentIssue.id} issue={currentIssue} />;
  }

  return <div />;
}
```
