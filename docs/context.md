# Context

When you return an interface from a reactive context, that interface is public. That means all nested components and contexts has access to that interface. Often there is certain management of state that should only be managed by the reactive contexts. You want a private interface between them.

Just like React has its context hierarchy to inject values in nested components, **Impact** has its reactive context hierarchy to inject values in nested reactive contexts. Unlike the React context, which resolves with a context reference, **Impact** resolves with a simple key reference. This simplifies the providing and consumption of values.

```ts
import { context } from "@impact-react/[*]";

export type GlobalStoreContext = {
  alert(message: string): void;
};

function GlobalStore() {
  context<GlobalStoreContext>({
    alert(message) {
      // Typically this would be changing some internal state or using some internal state management
      // dependency
      alert(message);
    },
  });

  return {
    list,
  };
}

function SomeNestedStore() {
  // We only need to access the key on the context to consume it from a parent reactive context that
  // provides that key. If no key exists, an error is thrown
  const { alert } = context<GlobalStoreContext>();

  return {
    doSomething() {
      alert("foo");
    },
  };
}
```
