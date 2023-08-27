# Understanding The Design

Reacts main purpose is to compose dynamic user interfaces and doing so across the client and server boundary. The primitives of React for managing state are scoped to individual components and you rely on mechanisms like props passing and context providers to share it. A typical misconception of React is that you can run asynchronous logic within `useEffect`, but this hook is to manage subscriptions. React is actually quite constrained on managing state performantly across components and orchestrating asynchronous logic. 

**The first principle** of **Impact** is to allow developers to write state and logic without the mental and performance overhead of reconcilication, but still tie it to the lifecycle of component trees.

**The second principle** of **Impact** is to minimze indirection when navigating and debugging code. In other words you should ideally always be a single click away from finding executing code

## Reactive primitives

**Impact** implements a reactive primitive called signals. This is a very simple reactive primitive which does targeted reconciliation of components.

"Change" is where things go wrong in your application. A user interacts with the application and you have unexpected state changes. The signal debugger gives you exact information about where a state change occurs in your code and also where state changes are being observed in your code. With VSCode you will be able to click debugging information in the browser and go straight to the code location inside VSCode. 

**Impact** also enables promises to be consumed "the React way". That means promises created in reactive hooks can be enhanced to be a `SuspensePromise`. This is just a normal promise, but React can now evaluate the state of the promise to use it with suspense.
