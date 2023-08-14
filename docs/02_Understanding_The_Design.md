# Understanding The Design

Reacts main purpose is to compose dynamic user interfaces and doing so across the client and server boundary. The primitives of React for managing state and side effects are scoped to individual components and you rely on mechanisms like props passing and context providers to share state and logic. A functional paradigm makes sense for React.

Where React comes short is when the scale of your client managed state and logic creates friction. This friction appears in two ways:

1. Performance becomes and issue and you start throwing memo components left and right and split up your context providers into many nested context providers
2. The passing of props and usage of context providers creates several levels of indirection, meaning it is difficult to navigate your code to find where state is defined and logic is executed

**The first core principle** of **Impact** is to allow developers to write object oriented code decoupled from React, but still naturally bridge it to the world of React. It does this by using reactive primitives that is consumed just as natural in the object oriented world as in the functional component world and binds the lifecycle of classes to the lifecycle of component trees.

**The second core principle** of **Impact** is to minimze indirection when navigating and debugging code. In other words you should ideally always be a single click away from finding executing code

## The bridge

Classes is at the core of object oriented programming and there are different ways you can expose an instantiated class to React. A feature of **Impact** is to bind the lifecycle of a class to the lifecycle of a component tree. In other words classes are created and disposed related to what components are consuming them.

To enable this mechanism **Impact** relies on [tsyringe](https://github.com/microsoft/tsyringe), a library from Microsoft, under the hood. Tsyringe is a general purpose dependency injector which enables the developer experience **Impact** is aiming for. There are other types of dependency injection, but TSyringe covers the following requirements:

- Nested injection containers with scoped class resolvement
- No type overrides (`!`) to express the validity of injection
- Injection of values
- Disposal of resolved classes when container is disposed

For you as a developer this low level dependency is exposed as two decorators on the object oriented side of things, and a provider component and a hook on the React side of things.

## Reactive primitives

**Impact** implements a reactive primitive called signals. This is a very simple reactive primitive which is designed to work just as well in an object oriented world, as in the functional and declarative world of React. That means the API for consuming the value of a signal needs to feel natural in both programming paradigms. Also changing the value should be allowed using mutation, though result in an "immutable" value for React to consume. All these considerations went into the design of the signals API.

"Change" is where things go wrong in your application. A user interacts with the application and you have unexpected state changes. The signal debugger gives you exact information about where a state change occurs in your code and also where state changes are being observed in your code. With VSCode you will be able to click debugging information in the browser and go straight to the code location inside VSCode. 

**Impact** also enables promises to be consumed "the React way". That means promises created in classes can be enhanced to be a `SuspensePromise`. This is just a normal promise, but React can now evaluate the state of the promise to use it with suspense.

