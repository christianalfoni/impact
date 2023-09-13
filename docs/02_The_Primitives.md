# The Primitives

You can think about Impact as two sets of primitives.

## 1. Management primitives

It does not really matter what state primitives you use, it is the fact that these primitives can be encapsulated and interacted with in a predictable and organised manner that is the "management" of "state management".

### ReactiveHook

You can think about reactive hooks as normal hooks, though they rather use reactive state primitives and runs outside the reconciliation loop of React. That means you get the awesome composition of React hooks without the performance and mental overhead of Reacts reconciliation.

### ReactiveHooksProvider

By default you do not need to explicitly provide reactive hooks to React as they are all globally registered. To explicitly expose reactive hooks to React and scope them to specific component trees you use a `ReactiveHooksProvider`. This allows you to pass values to instantiate the hooks and it makes sure all components, and also other hooks, consumes the same instance.

## 2. Reactive state primitives

Impact ships with its own reactive state primitives, but you can use other state primitives like [RxJS](https://rxjs.dev/guide/overview) and [XState](https://xstate.js.org/) where they make sense. There are many types of state challenges and there are different tools to deal with these different challenges. Impact does not tell you to define your state in a specific way, it gives you a way to manage state regardless of how it is defined.

### Signal

A signal is just a way to store a state value components can track when they change. You will use `observe` with components to register any signal access from any store to the component as it renders. This avoids having to manually select and optimise state in components. Consume any hooks and the component reconciles based on what you access from those hooks.

### SuspensePromise

A promise which allows React to synchronously access it when it is resolved/rejected. In combiniation with a Suspense and Error boundary this promise allows it to be consumed directly in components.

### Emitter

The most fundamental reactive primitive is an event emitter. Impact ships with its own event emitter that ensures encapsulation of **publicly** listening to events and **privately** emitting events from stores.