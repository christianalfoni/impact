# The Primitives

You can think about Impact as two sets of primitives.

## 1. Management primitives

It does not really matter what state primitives you use, it is way these primitives can be encapsulated and interacted with that is the "management" of "state management".

### Store

The store in Impact is a management primitive, not a state primitive. It can encapsulate state and related logic to manage that state, but this is not required to define a store. The store is just a function which returns a public interface that can be consumed by components and other stores using the hooks pattern. You will not define one big store, but rather define several smaller stores with specific responsibilities and public interfaces.

### StoresProvider

By default stores are available globally in any component and other store. You do not have to provide them explicitly to a component tree. This can work for some applications, but to take full advantage of Impact you will use a `StoresProvider` to expose stores to a component tree. That component tree being all pages of your application, a single page or a single feature. The `StoresProvider` manages the resolvement of stores through the component tree to give you control of what components shares what instances of stores.

## 2. Reactive state primitives

Impact ships with its own reactive state primitives, but you can use other state primitives like [RxJS](https://rxjs.dev/guide/overview), [XState](https://xstate.js.org/) and even [Mobx observables](https://mobx.js.org/README.html) if that is your preference. There are many types of state challenges and there are different tools to deal with these different challenges. Impact does not tell you to define your state in a specific way, it gives you a way to manage state.

### Signal

A signal is just a way to store a state value components can track when they change. You will use `observe` with components to register any signal access from any store to the component as it renders. This avoids having to manually select and optimise state in components. Consume any stores and the component reconciles based on what you access from those stores.

### Queries and mutations

Data fetching and mutation primitives that allows you to consume them naturally in your components subscribing to their state, using suspense or consume them directly in your stores. 

### Emitter

The most fundamental reactive primitive is an event emitter. Impact ships with its own event emitter that ensures encapsulation of **publicly** listening to events and **privately** emitting events from stores.