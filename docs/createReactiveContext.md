---
outline: deep
---

# createReactiveContext

Creates the hook and related provider for the reactive context. Just like React you can have multiple instances of the same context simply by providing it in different parts of your component tree.

::: tip

If a nested component throws an error, the reactive context provided will be disposed and the error is thrown further up the component tree. If you want to recover from nested errors without disposing the context, create error boundaries related to nested components of the ReactiveContextProvider.

:::

```tsx
import { createReactiveContext } from "@impact-react/[*]";

function CounterStore() {
  return {};
}

const useCounterStore = createReactiveContext(CounterStore);
```

::: info
There are two scenarios where providing a reactive context throws an error in development:

1. If you use the `use` hook with a promise in a nested component, but have no `Suspense` boundary between the ReactiveContextProvider and the nested component to catch it
2. If the store is using React hooks

Both scenarios represents something you would normally not do, but might occur as you learn about **Impact**.

:::

## Resolving Reactive Contexts

The core feature of Impact is the ability to resolve reactive contexts. You provide a reactive context using a `ReactiveContextProvider` in the component tree and any nested component can now consume it. This is not much different from consuming a regular React context. Where things might start to challenge your technical intuition is when the same hook can be used inside the _reactive context_ to also resolve other reactive contexts up the component tree.

Hopefully this behaviour is an intuitive developer experience, but to scratch your technical itch, let us take on a concrete example by looking at a simplified component tree:

```
AppStoreProvider
  App
    AdminRoute
      AdminStoreProvider
        AdminPage
          FeatureStoreProvider
            Feature
```

Each **Provider** in this tree has its own **ReactiveContextContainer** instance that is provided down the component tree using React context. This **ReactiveContextContainer** instance is also passed the parent **ReactiveContextContainer** from up the component tree using the React context. That means **ReactiveContextContainer**'s represents the same hierarchy of contexts as the React context itself.

So when a reactive context hook is used inside **Feature** it will `useContext` to find the closest **ReactiveContextContainer**, which comes from **FeatureStoreProvider**. This **ReactiveContextContainer** instance has a parent property referencing the **ReactiveContextContainer** on **AdminStoreProvider**, which has a parent property referencing the **ReactiveContextContainer** on **AppStoreProvider**.

With this in mind we can now explain step by step what happens when the **Feature** component uses `useAppStore` to gain access to a user.

1. We first get the **ReactiveContextContainer** from **FeatureStoreProvider** using `useContext`
2. We call `.resolve(AppStore)` on that **ReactiveContextContainer**
3. Since **AppStore** is not handled by that **ReactiveContextContainer** it will use its parent, the **ReactiveContextContainer** of **AdminStoreProvider**, to resolve the context. But it is not there either and again it uses the parent which leads it to the **ReactiveContextContainer** of **AppStoreProvider**
4. The context is instantiated if necessary and returned

But what if the **Feature** component uses `useFeatureStore` and the **FeatureStore** itself uses `useAppStore`?

1. We first get the **ReactiveContextContainer** from **FeatureStoreProvider** using `useContext`
2. We call `.resolve(FeatureStore)` on that **ReactiveContextContainer**
3. Since **FeatureStore** is handled by this **ReactiveContextContainer** and it has not been instantiated yet, it will be instantiated
4. During instantiation the **ReactiveContextContainer** is set as the currently active container. When `useAppStore` is called in **FeatureStore** it will use the active **ReactiveContextContainer** to resolve the **AppStore**, which basically brings us to point **3.** on the previous example

The following [deep dive video](https://www.youtube.com/watch?v=yOAZo1SUYrM) goes into even more detail on how this is implemented, but hopefully this helped scratch your technical itch and gave a deeper understanding of how stores are resolved through the component tree both from components and other stores.
