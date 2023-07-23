# Understanding The Design

React is not a framework, it is a UI library. It is focused on the challenge of composing dynamic user interfaces. A functional and declarative paradigm makes sense for React.

The primitives of React for managing state and side effects are scoped to individual components and you rely on mechanisms like props passing and context providers to share state and logic. This very quickly creates a lot of indirection in your code which leads to a confusing developer experience and affects performance.

A core principle of **impact-app** is to allow developers to write object oriented code decoupled from React, but still naturally bridges it the world of React. It does this by using reactive primitives that is consumed just as natural in the object oriented world as in the functional component world and binds the lifecycle of classes to the lifecycle of omponent trees.

## Exposing classes

Classes is at the core of object oriented programming and there are different ways you can expose an instantiated classes to React. A core feaature of **impact-app** is to bind the lifecycle of a class to the lifecycle of a component tree. Classes are created and disposed related to what components are consuming them.

To enable this mechanism **impact-app** relies on [tsyringe](https://github.com/microsoft/tsyringe), a library from Microsoft, under the hood. Tsyringe is a general purpose dependency injector which takes advantage of features not yet fully available in the language, but it enables the developer experience **impact-app** is aiming for.

## Reactive primitives

To enable components to reconcile when state changes inside classes **impact-app** relies on a sibling standalone project called [signalit](https://github.com/christianalfoni/signalit). It exposes a simple `signal` primitive that can be consumed as natural in the object oriented world as in the component world of React. Its API is designed to allow typical object oriented patterns like the accessor pattern and treats its values as immutable, which conforms to Reacts expectations.



