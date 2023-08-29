# Understanding The Design

Reacts responsibility is to compose dynamic user interfaces and doing so across the client and server boundary. The primitives of React for managing state are scoped to individual components and you rely on mechanisms like props passing and context providers to share state. A common misconception about React is that their primitives can be used to manage state and related logic, but they are more about synchronisation than management.

Working on productivity types of applications with a alot of client state management it very quickly becomes cumbersome to use Reacts primitives to share state and logic in a performant way. Also expressing logic with the mental overhead of the reconciliation loop creates friction.

**The first principle** of **Impact** is to scope state and logic to component trees, as opposed to local component scope or a global scope.

**The second principle** of **Impact** is to allow developers to write state and logic without the mental and performance overhead of reconcilication, but still tie it to the lifecycle of component trees.

**The third principle** of **Impact** is to minimze indirection when navigating and debugging code. In other words you should ideally always be a single click away from finding the origin of state and methods

## Reactive primitives

**Impact** implements a reactive primitive called signals. This is a very simple reactive primitive which does targeted reconciliation of components. With its use of the new `using` keyword in JavaScript there is no overhead added to the React runtime.

"Change" is where things go wrong in your application. A user interacts with the application and you have unexpected state changes. The signal debugger gives you exact information about where a state change occurs in your code and also where state changes are being observed in your code. With VSCode you will be able to click debugging information in the browser and go straight to the code location inside VSCode. 

**Impact** also enables promises to be consumed "the React way". That means promises created in reactive hooks can be enhanced to be a `SuspensePromise`. This is just a normal promise, but React can now evaluate the state of the promise to use it with suspense.
