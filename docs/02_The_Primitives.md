# The Primitives

You can think about Impact as two primitives.

## 1. The management primitive: Context

You probably already know contexts from React. Contexts is the primitive you use to share and manage state scoped to a component tree. Impact contexts are also just React contexts, but they have a reactive implementation. That means you use reactive state primitives instead of the state primitives tied to the reconciliation loop of React. You are freed from the performance challenges and the mental overhead of sharing state and management of state through React contexts.

## 2. The state primitive: Signal

A signal is just a way to create an observable value. What makes Impact signals especially powerful is that they also make promises observable and suspendable. With an observable reactive primitive your components will only reconcile based on what they actually access from a context, as opposed to reconciling regardless of what changes within the context using native React contexts.

