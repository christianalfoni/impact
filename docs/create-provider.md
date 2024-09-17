# createProvider

Provides the state of a reactive component to any nested components, reactive or not.

```tsx
import { createComponent, createProvider } from "@impact-react/[*]";

type State = {
  count: number;
};

const [provideCounter, useCounter] = createProvider<State>();

export { useCounter };

export default createComponent(function Counter() {
  const state = reactive({ count });

  provideCounter(state);

  return () => <NestedComponent />;
});

// Needs to be an observer
function NestedComponent() {
  const counter = useCounter();

  return <h1>Count: {counter.count}</h1>;
}
```

## How it works

Hopefully this behaviour is an intuitive developer experience, but to scratch your technical itch, let us take on a concrete example by looking at a simplified component tree:

```
  ReactiveApp
    AdminRoute
        ReactiveAdminPage
            Feature
```

Each reactive component in this tree has its own **ReactiveContextContainer** instance. If the component provides a value, the **ReactiveContextContainer** is exposed on the React context. This **ReactiveContextContainer** instance is also passed the parent **ReactiveContextContainer** from up the component tree using the React context. That means **ReactiveContextContainer**'s represents the same hierarchy of contexts as the React context itself.

So when for example `useApp` is used inside **Feature** it will `useContext` to find the closest **ReactiveContextContainer**, which comes from **ReactiveAdminPage** as its exposes some state. This **ReactiveContextContainer** instance has a parent property referencing the **ReactiveContextContainer** on **ReactiveApp** which also provides some state, including our user.

With this in mind we can now explain step by step what happens when the **Feature** component uses `useApp` to gain access to a user.

1. We first get the **ReactiveContextContainer** from **ReactiveAdminPage** using `useContext`
2. We call `.resolve(appRef)` on that **ReactiveContextContainer**
3. Since the _appRef_ is not handled by the **ReactiveContextContainer** of **ReactiveAdminPage** it will use its parent, the **ReactiveContextContainer** of **AppPage**, to resolve the context. It will get a match on the ref and return the state provided

But what if the **ReactiveAdminPage** component uses `useApp` in its state management scope?

1. When we have an executing reactive state management scope the `useApp` will rather look directly at its own **ReactiveContextContainer**
2. We call `.resolve(appRef)` on that **ReactiveContextContainer** and we are back at point 3. above
