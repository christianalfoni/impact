# Resolving Stores

One of the features of Impact is the ability to resolve stores from the React context. You provide a store using a `StoreProvider` in the component tree and any nested component can now consume the same store. This is not much different from consuming a regular context. Where things might start to challenge your technical intuition is when the the same `useStore` hook can be used inside the _store_ to also resolve stores up the component tree.

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

Each **StoreProvider** in this tree has its own **StoreContainer** instance that is provided down the component tree using React context. This **StoreContainer** instance is also passed the parent **StoreContainer** from up the component tree using the React context. That means **StoreContainer**'s represents the same hierarchy of stores as the React context itself.

So when `useStore` is used inside **Feature** it will `useContext` to find the closest **StoreContainer**, which comes from **FeatureStoreProvider**. This **StoreContainer** instance has a parent property referencing the **StoreContainer** on **AdminStoreProvider**, which has a parent property referencing the **StoreContainer** on **AppStoreProvider**.

With this in mind we can now explain step by step what happens when the **Feature** component uses `useAppStore` to gain access to a user.

1. We first get the **StoreContainer** from **FeatureStoreProvider** using `useContext`
2. We call `.resolve(AppStore)` on that **StoreContainer**
3. Since **AppStore** is not handled by that **StoreContainer** it will use its parent, the **StoreContainer** of **AdminStoreProvider**, to resolve the store. But it is not there either and again it uses the parent which leads it to the **StoreContainer** of **AppStoreProvider**
4. The store is instantiated if necessary and returned

But what if the **Feature** component uses `useFeatureStore` and the **FeatureStore** itself uses `useAppStore`?

1. We first get the **StoreContainer** from **FeatureStoreProvider** using `useContext`
2. We call `.resolve(FeatureStore)` on that **StoreContainer**
3. Since **FeatureStore** is handled by this **StoreContainer** and it has not been instantiated yet, it will be instantiated
4. During instantiation the **StoreContainer** is set as the currently active container. When `useAppStore` is called in **FeatureStore** it will use the active **StoreContainer** to resolve the **AppStore**, which basically brings us to point **3.** on the previous example

The following [deep dive video](https://www.youtube.com/watch?v=yOAZo1SUYrM) goes into even more detail on how this is implemented, but hopefully this helped scratch your technical itch and gave a deeper understand of how stores are resolved through the component tree and the stores themselves.
