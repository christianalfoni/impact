# Understanding The Design

React is not a framework, it is a UI library. It is focused on the challenge of composing dynamic user interfaces across the client and server boundary. A functional and declarative paradigm makes sense for React.

The primitives of React for managing state and side effects are scoped to individual components and you rely on mechanisms like props passing and context providers to share state and logic. This very quickly creates a lot of indirection in your code which leads to a confusing developer experience and affects performance.

A core principle of **Impact** is to allow developers to write object oriented code decoupled from React, but still naturally bridge it to the world of React. It does this by using reactive primitives that is consumed just as natural in the object oriented world as in the functional component world and binds the lifecycle of classes to the lifecycle of component trees.

In short. A functional paradigm is a great tool to compose UIs, while object oriented code arguably deals better with organising and managing complex state management.

## The bridge

Classes is at the core of object oriented programming and there are different ways you can expose an instantiated class to React. A core feature of **Impact** is to bind the lifecycle of a class to the lifecycle of a component tree. In other words classes are created and disposed related to what components are consuming them.

To enable this mechanism **Impact** relies on [tsyringe](https://github.com/microsoft/tsyringe), a library from Microsoft, under the hood. Tsyringe is a general purpose dependency injector which enables the developer experience **Impact** is aiming for. There are other types of dependency injection, but TSyringe covers the following requirements:

- Nested injection containers with scoped class resolvement
- No type overrides (`!`) to express the validity of injection
- Injection of values

## Reactive primitives

To enable components to reconcile when state changes inside classes **Impact** relies on a sibling standalone project called [SignalIt](https://github.com/christianalfoni/signalit). It exposes a simple `signal` and `asyncSignal` primitive that can be consumed as natural in the object oriented world as in the component world of React. Its API is designed to allow typical object oriented patterns like the accessor pattern and treats its values as immutable, which conforms to Reacts expectations.



