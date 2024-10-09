# Choosing reactive primitives

The JavaScript ecosystem offers different reactive primitives for different use cases. When it comes to state management and user interfaces we have recently aligned strongly on a **signal** type of primitive. There is even a [proposal](https://eisenbergeffect.medium.com/a-tc39-proposal-for-signals-f0bedd37a335) to bring signals to JavaScript itself.

At a high level a signal allows us to define state, observe that state and run some logic when the state changes. This mechanism enables primitives like `signal`, `observable`, `computed`, `derived`, `effect`, `reaction`, `observe` and even React primitives like `observer`, `Observer` and `Reactive.div`.

**Impact** allows you to choose between different reactive primitives for state management. Even though **signal** is not necessarily the terminology for all these different solutions, they fundamentally work exactly the same. That said, they come in flavours and has different strengths. This guide will help you sort out what strengths speaks to you the most.

**Impact Signals**

- Similar to the state API of React
- A `signal` signature that encourages read only state to be exposed from the stores
- First class support for promises, making them observable and compatible with suspense
- Data fetching primitives built on `signal`

## Mobx

- Allows you to use the normal mutation API of JavaScript
- Supports a class based object oriented paradigm
- The reactive primitives almost disappears with `makeAutoObservable`

## Preact

## Legend
