# Stores

## Constructing stores

Define your store much like a component, only returning an interface to interact with state management instead of UI.

```ts
function AppStore() {
  return {};
}
```

The `signal` signature makes it easy to ensure privacy by default in your stores. You will typically only return the `getter` part of your signal to the components and create constrained methods to change that state. That said, you can always just return the `setter` for the signal as well.

```ts
import { signal } from "impact-react";

function AppStore() {
  const [count, setCount] = signal(0);

  return {
    count,
    increase() {
      setCount((current) => current + 1);
    },
  };
}
```

Define any private functions _after_ the return statement. This increases readability of the store as its key features are at the top.

```ts
import { signal } from "impact-react";

function AppStore() {
  const [count, setCount] = signal(0);

  return {
    count,
    increase: updateCount,
  };

  function updateCount() {
    setCount((current) => current + 1);
  }
}
```

Compose the store using additional functions which you call during instantiation of the store. As they are called during instantiation, they can also consume parent stores, do cleanups etc.

```ts
import { signal } from "impact-react";

function AppStore() {
  const counter = createCounter();

  return {
    counter,
  };
}

function createCounter() {
  const [count, setCount] = signal(0);

  return {
    count,
    increase: updateCount,
  };

  function updateCount() {
    setCount((current) => current + 1);
  }
}
```

There are no limits to how big your stores can be in terms of performance. How you choose to integrate logic into existing stores or create new stores is up to you.

## Props

Stores can receive props. These props becomes signals inside the store. When React reconciles and updates the prop, the corresponding signal will update its value and trigger observation.

```tsx
import { Signal, createStore, derived, effect } from "impact-react";

type StoreProps = {
  // Define props as functions returning the value.
  // Do not use optional props, but rather undefined
  user: () => UserDTO | undefined;
};

function AppStore(props: StoreProps) {
  // If the user prop changes, you can derive from it when
  // it changes
  const isAwesome = derived(() => props.user()?.isAwesome ?? false);

  // The same goes for effects
  effect(() => {
    if (props.user()?.isAwesome) {
      alert("Good for you!");
    }
  });

  return {
    // You can just expose it
    // to nested stores and components "as is"
    user: props.user,
  };
}

const useAppStore = createStore(AppStore);

type Props = { user?: UserDTO };

function App(props) {
  return (
    <useAppStore.Provider user={props.user}>
      <SomeAppFeature />
    </useAppStore.Provider>
  );
}
```

Props often act as initial values to internal signals of the store:

```ts
function CounterStore(props) {
  const [count] = signal(props.initialCount());

  return {
    count,
  };
}
```

## Consuming signals

You have to call a signal to consume it. It is recommend that you default to calling the signal where it is actually consumed:

```ts
// Do NOT do this
const currentUser = user();
console.log(currentUser.id);

// Do this
console.log(user().id);
```

This helps readability as there are less variables assigned and you do not only know **what** is observed, but also **why**. There are times where you have to assign a variable, for example when consuming a promise:

```ts
const currentPromise = somePromise();

if (currentPromise.status === "pending") {
  return;
}
```

This is for TypeScript to do its type narrowing.
