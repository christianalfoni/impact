# Consuming Stores

Since **Impact** introduces such a strong concept of encapsulation of stores and how they are consumed, it is able to enable automatic observation in components. If you use the [Babel Plugin](../index.md#automatic-observation) any component consuming a store will automatically become an observer. This is not required, but it is nice to not have to put `observer` is quite disrupting to the simple component definition.

When using the babel plugin you only have to follow a very simple convention. The name of your hook has to end with `Store`. So `useAppStore`, `useDashboardStore` etc.

To provide the store to a component tree use the `.provider` prop. This is a design decision that allows you to both provide and consume the store from the same component.

```ts
import { useAppStore } from "./AppStore";

export default useAppStore.provider(function App() {
  const appStore = useAppStore();

  return <div />
});
```

Passing state from one store to another can be done in two ways. Either you simply use the store directly in a nested store:

```ts
import { useAppStore } from "./AppStore";

function DashboardStore() {
  const appStore = useAppStore();

  return {};
}
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
