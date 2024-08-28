# Context

When you return an interface from a store, that interface is public. That means all nested components and stores has access to that interface. Often there is certain management of state that should only be managed by the stores. You want a private interface between the stores.

Just like React has its context to inject values in nested components, **Impact** has its context to inject values in nested stores. Unlike the React context, which resolves with a context reference, **Impact** resolves with a simple key reference. This simplifies to providing and consumption of store contexts.

```ts
import { context } from "impact-react";

export type GlobalStoreContext = {
  addListItem(item: string): void;
};

function GlobalStore() {
  // We have some state that we only want to be changed by other stores
  const [list, setList] = signal<string[]>([]);

  // We register a function to handle updating the list
  context<GlobalStoreContext>({
    addListItem(item) {
      setList((current) => [...current, item]);
    },
  });

  return {
    list,
  };
}

function SomeNestedStore() {
  // We only need to access the key on the context to consume it from a parent store that
  // provides that key. If no key exists, an error is thrown
  const { addListItem } = context<GlobalStoreContext>();

  return {
    doSomething() {
      addListItem("foo");
    },
  };
}
```
