# Understanding The Design

Reacts responsibility is to compose dynamic user interfaces and doing so across the client and server boundary. The primitives of React for state are scoped to individual components and you rely on mechanisms like props passing and context providers to share state and management of that state between components. A common misconception about React is that its primitives is designed to manage state, but they are really more about synchronising state. It quite quickly becomes cumbersome to use Reacts primitives to share state and state management across components in a way that performs and scales. Expressing state management with the mental overhead of the reconciliation loop also creates friction.

**The first principle** of **Impact** is to allow developers to write state and manage state state without the mental and performance overhead of reconcilication, but still tie it to the lifecycle of component trees.

**The second principle** of **Impact** is to allow scoping state and management of the state to component trees, as opposed to using only a global scope.

**The third principle** of **Impact** is to minimze indirection when navigating and debugging code. In other words you should ideally always be a single intellisense click away from finding the origin of state and the related management of that state.

## The fundamental building block

State management is not only about what kind of state primitive you use to store state, it is also how you organise and interact with that state in your code. The management of the state. Traditionally when you manage state outside of React you do so in a global context using a state store, but that is not ideal. You might initialize your application with global state, but a lot of your state and management of that state is only related to certain pages, feature or even a complex component.

Impact is not mainly about its state primitive, **signals**, it is about how you organise and interact with state primitives in general. You can actually choose completely different state primitives than what Impact offers and still get the core value out of **Impact**.

**So what is this fundamental "management building block"?**

To give familiarity with an existing mental model we call it **contexts**. A context is just a function encapsulating state and management of that state which can be exposed at any level of your component tree. It is the same model you know from React. The important difference with Impact contexts is that they run outside the reconciliation loop of React, meaning you avoid the performance and mental overhead of using traditional contexts, but you still gain all the benefits from them.

## Concurrent mode

With concurrent mode React fully embraces the fact that components needs to be pure. That means you can not use `useRef` or `useState` to instantiate something with side effects, as you can not reliably dispose of them. The reason is that the concurrent mode could run the component body several times without running `useEffect` to clean things up.

For **Impact** to work the `ReactiveContextProvider` creates a `ContextContainer` which needs to be disposed on unmount. This is exactly what is not possible to achieve with concurrent mode. The great thing though is that a `ContextContainer` by itself is not a side effect, there is nothing in there, just references to what "can be there". It is only when the provider is mounted and children components starts consuming the context that it is "instantiated".

That does not solve disposal completely though, cause a `useEffect` might also run multiple times. That is why the `ReactiveContextProvider` uses a component class with `componentDidUmount` to trigger disposal. This lifecycle method only runs when the component actually unmounts.

But that actually does not completely solve the challenge. React might call `componentDidUnmount`, but still keep reference to the component and mount it again. This happens for example during suspense. Impact solves this by making the `ReactiveContextProvider` create the `ContextContainer` during its render. If there is no existing `ContextContainer`, or it has been disposed, it will create a new one. This changes the context value and guarantees consuming components will resolve it again. The final event on this component is a `componentDidUnmount` which will guarantee disposing of the context.

