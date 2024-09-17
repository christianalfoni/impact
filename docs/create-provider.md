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
  App
    AdminRoute
        AdminPage
            Feature
```

Each reactive component in this tree has its own **ReactiveContextContainer** instance that is provided down the component tree using React context, **given** that it provides state. This **ReactiveContextContainer** instance is also passed the parent **ReactiveContextContainer** from up the component tree using the React context. That means **ReactiveContextContainer**'s represents the same hierarchy of contexts as the React context itself.

So when a provide state hook is used inside **Feature** it will `useContext` to find the closest **ReactiveContextContainer**, which comes from **FeatureStoreProvider**. This **ReactiveContextContainer** instance has a parent property referencing the **ReactiveContextContainer** on **AdminPage**, which has a parent property referencing the **ReactiveContextContainer** on **App**.

With this in mind we can now explain step by step what happens when the **Feature** component uses `useAppStore` to gain access to a user.

1. We first get the **ReactiveContextContainer** from **Features** using `useContext`
2. We call `.resolve(AppStore)` on that **ReactiveContextContainer**
3. Since **AppStore** is not handled by that **ReactiveContextContainer** it will use its parent, the **ReactiveContextContainer** of **AdminStoreProvider**, to resolve the context. But it is not there either and again it uses the parent which leads it to the **ReactiveContextContainer** of **AppStoreProvider**
4. The context is instantiated if necessary and returned

But what if the **Feature** component uses `useFeatureStore` and the **FeatureStore** itself uses `useAppStore`?

1. We first get the **ReactiveContextContainer** from **FeatureStoreProvider** using `useContext`
2. We call `.resolve(FeatureStore)` on that **ReactiveContextContainer**
3. Since **FeatureStore** is handled by this **ReactiveContextContainer** and it has not been instantiated yet, it will be instantiated
4. During instantiation the **ReactiveContextContainer** is set as the currently active container. When `useAppStore` is called in **FeatureStore** it will use the active **ReactiveContextContainer** to resolve the **AppStore**, which basically brings us to point **3.** on the previous example

The following [deep dive video](https://www.youtube.com/watch?v=yOAZo1SUYrM) goes into even more detail on how this is implemented, but hopefully this helped scratch your technical itch and gave a deeper understanding of how stores are resolved through the component tree both from components and other stores.
