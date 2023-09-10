# The Primitives

You can think about Impact as two sets of primitives.

## 1. Management primitives

It does not really matter what reactive primitive you use, it is the fact that these primitives can be defined and consumed in an organised matter that is the "management" of "state management".

### Store

You can think about the store as a context provider. It does not configure any state or logic, it is just a container to provide something to React in a "reactive way". In other words it is a context provider that is not part of the reconciliation loop of React, but is still bound to the component tree.

### StoresProvider

To bind stores to the lifecycle of a component tree you use a `StoresProvider`. This allows you to pass values to instantiate the stores and it makes sure all components, and also other stores, consumes the same instance of a store.

## 2. Reactive state primitives

Impact ships with its own reactive state primitives, but you can choose to add other reactive primitives like [RxJS](https://rxjs.dev/guide/overview) and [XState](https://xstate.js.org/) where they make sense. There are many types of state challenges and there are different tools to deal with these different challenges. Impact does not tell you to define your state in a specific way, it primarily gives you a way to manage it.

### Signal

A signal is just a way to store a state value components can track when they change. You will use `observe` with components to register any signal access from any store to the component as it renders. This avoids having to manually select and optimise state in components. Consume any stores and the component reconciles based on what you access from those stores.

### SuspensePromise

A promise which allows React to synchronously access it when it is resolved/rejected. In combiniation with a Suspense and Error boundary this promise allows it to be consumed directly in components.

### Emitter

The most fundamental reactive primitive is an event emitter. Impact ships with its own event emitter that ensures encapsulation of **publicly** listening to events and **privately** emitting events from stores.