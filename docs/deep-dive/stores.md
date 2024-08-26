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

Compose the store using additional functions which you call during instantiation of the store. As they are called during instantiation, they can also consume parent stores:

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

## Consuming stores in React

By providing stores you can pass them initial state from React. This is immensely useful when dealing with asynchronous state. As an example we might have a store that handles authentication and the application should only mount when you are `AUTHENTICATED`.

```ts
import { signal, createStore, cleanup } from "impact-react";

export const useSessionStore = createStore(SessionStore);

function SessionStore() {
  // We create the API for handling the session
  const api = createSessionApi();

  // The `authenticate` returns a promise of user if you are
  // authenticated, or null if not authenticated
  const [session, setSession] = signal(api.authenticate());

  // When the auth changes we update the session
  cleanup(
    api.onAuthChange((maybeUser) => setSession(Promise.resolve(maybeUser))),
  );

  return {
    session,
    signIn() {
      api.signIn();
    },
    signOut() {
      api.signOut();
    },
  };
}
```

Now that we have the session store we can use it in a component:

```tsx
import { useObserver } from "impact-react";
import { useSessionStore } from "../stores/SessionStore";
import { AppStoreProvider } from "../stores/AppStore";
import { App } from "./App";

function Session() {
  return (
    <useSessionStore.Provider>
      <AppSession />
    </useSessionStore.Provider>
  );
}

function AppSession() {
  using _ = useObserver();

  const sessionStore = useSessionStore();
  const session = sessionStore.session();

  if (session.status === "pending") {
    return <div>Authenticating...</div>;
  }

  if (session.status === "rejected") {
    return <div>Could not authenticate: {session.reason}</div>;
  }

  // When the user changes this session user also changes
  const user = session.value;

  return (
    // We use the ID of the user to identify unique state managent
    // for that user, meaning the provider and store is re-created
    // when the ID changes
    <AppStoreProvider key={user.id} user={user}>
      <App />
    </AppStoreProvider>
  );
}
```

In this application there is no reason to show the `<App />` without a user. Now we split the asynchronous nature of the session and can isolate the state management of the App around a guaranteed user.

```ts
import { User } from "./ApiStore";
import { signal, cleanup, createStore } from "impact-react";

export const useAppStore = createStore(AppStore);

type Props = {
  // All props are signals, so define props as callbacks
  user: () => User;
};

function AppStore(props: Props) {
  return {
    // Any updates from React is updated on the signal, so
    // we'll just use that signal for the user and expose
    // it on the store
    user: props.user,
  };
}
```

A different example would be if you have an `EditTicket` component with complex state management. You can create an `EditTicketStore` with a provider which requires a `ticket`. Now you have a transient store mounted for that ticket until you unmount the editing experience due to some other state change.

## Providing stores in React

At times a store represents a specific component. Since you can not provide and consume a context in the same component you will need to split them up. A recommended pattern for that is:

```tsx
export function Counter() {
  return (
    <useCounterStore.Provider>
      <CounterContent />
    </useCounterStore.Provider>
  );
}

function CounterContent() {
  const counterStore = useCounterStore();

  // ...
}
```

The main `Counter` component is now able to use other stores to resolve any asynchronous state, include a suspense and error boundary etc. Here shown in a more relevant example:

```tsx
function Editor(props) {
  using _ = useObserver();

  const { getProcess } = useAppStore();

  const process = use(getProcess(props.id));

  return (
    <useEditorStore.Provider key={props.id} process={process}>
      <Suspense fallback={<Skeleton />}>
        <EditorContent />
      </Suspense>
    </useEditorStore.Provider>
  );
}

function EditorContent() {
  using _ = useObserver();

  const { dataFromProcess, isAwesome } = useEditorStore();

  const dataFromProcess = use(dataFromProcess());

  return <div>{isAwesome()}</div>;
}
```
