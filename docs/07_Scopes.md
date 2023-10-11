# Scopes

Impact stores can be exposed through a **scope**. This scope represents a boundary in your application. The outer most scope is your global scope, which is the default scope. Depending on your application you will find it beneficial to add additional nested scopes where specific stores are exposed.

## Why scopes?

Traditional global state stores has a single scope, the global scope. That means all state that will ever be available in your application (except local component state) will live *at some time* in this global scope.

If you think about your application as something running on a public computer where multiple people might sign in and out, that is a problem. You have to be very careful cleaning up this global state store when a user signs out or the next user might get insight into some other users details. Normally we just refresh the application when signing out, but only having a single global scope indicates we lose a benefit from local component scope. Predictable disposing of state. By exposing stores through scopes in the component tree you get the same disposing mechanism as local component state, only for component trees.

Another important aspect of creating scopes is that they act as data boundaries. Instead of managing state that might or might not be available in your global state store, due to its asynchronous nature, you can rather do data fetching between scopes so that each scope and its stores has initialized data. In practice that means you move most, if not all, your asynchronous data fetching logic to components using suspense and subscriptions, as opposed to managing promises and their state manually.

A third aspect of scopes is that they improve context awareness in your components. Your components will never need to override typing or validate the existence of state. The components operate within a scope where related state stores are initialized with their initial state. No more optional initialization of state.