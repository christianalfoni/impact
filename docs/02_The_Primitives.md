# The Primitives

You can think about Impact as two primitives.

## 1. The management primitive: Context

You probably already know contexts from React. Contexts are a really great primitive for sharing state across components. They also create boundaries for data fetching and ensures state and related subscriptions are disposed when unmounted. Impact conceptually also provides contexts to React, but they are reactive. That means you use reactive primitives instead of the primitives tied to the reconciliation loop of React. This benefits performance and the mental overhead that comes with the reconciliation loop.

## 2. The state primitive: Signal

A signal is just a way to store a state value components can track when they change. What makes Impact signals especially powerful is that they also make promises observable and suspendable. You will use `observe` with components to register any signal access from any store to the component as it renders. This avoids having to manually select and optimise state in components. Consume signals from any store and the component reconciles based on what you access from those stores.

