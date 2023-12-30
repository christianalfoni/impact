
<p align="center">
  <img align="center" width="200" src="https://github.com/christianalfoni/impact/assets/3956929/5279b512-e4d9-4474-92cf-7d06b356e23c" />
</p>
<p align="center">
  <b>Bringing reactivity to React</b>
</p>

<br />

<p align="center">
⚠️ <b>Release candidate</b> ⚠️
</p>

<br/>

> **State management** is hard
>
> **Building UIs** is hard
>
> **Building UIs** should not be hard because of **state management**
>
> **State management** should not be hard because of **building UIs**
>
> *Engineering Zen Master, Christian Alfoni*

## Get started

Install Impact to your project:

```sh
npm install impact-app
```

Or try it out on [codesandbox.io](https://codesandbox.io/p/devbox/impact-template-fp6gd9)

## Docs

- [Tutorial](./docs/01_tutorial.md)
- Advanced
  - [Queries and mutations](./docs/02_queries_and_mutations.md)
- Api
  - [Store](./docs/03_store.md)
  - [Context](./docs/04_context.md)
  - [Signal](./docs/05_signal.md)

## Understanding The Design

Reacts responsibility is to compose dynamic user interfaces and doing so across the client and server boundary. The primitives of React for state are scoped to individual components and you rely on mechanisms like props passing and context providers to share state and management of that state between components. A common misconception about React is that its primitives is designed to manage state, but they are really about synchronising state. It quite quickly becomes cumbersome to use Reacts primitives to share state and state management across components in a way that performs and scales. Expressing state management with the mental overhead of the reconciliation loop also creates friction.

**The first principle** of **Impact** is to allow developers to write state and manage state state without the mental and performance overhead of reconcilication, but still tie it to the lifecycle of component trees.

**The second principle** of **Impact** is to allow scoping state and management of the state to component trees, as opposed to using only a global scope.

**The third principle** of **Impact** is to minimze indirection when navigating and debugging code. In other words you should ideally always be a single intellisense click away from finding the origin of state and the related management of that state.

