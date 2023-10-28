# The Primitives

You can think about Impact as two primitives.

## 1. The management primitive: Context

You probably already know contexts from React. Contexts is the primitive you use to share and manage state scoped to a component tree. Impact contexts are also just React contexts, but they have a reactive implementation. That means you use reactive state primitives instead of the state primitives tied to the reconciliation loop of React. That means the code you write in an Impact context has less performance and mental overhead.

## 2. The state primitive: Signal

A signal is just a way to create an observable state value. What makes Impact signals especially powerful is that they also make promises observable and suspendable. With an observable reactive primitive your components will only reconcile based on what state they actually access from a context, not because any state within the context changed.

