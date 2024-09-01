# Stores

## Constructing stores

Define your store much like a hook, returning an interface to interact with state management instead of UI.

```ts
function AppStore() {
  return {};
}
```

When defining state it is good practice to expose that state as `readonly`. How you achieve this depends on the observable primitives you use. Here shown with **impact-react-signals**.

```ts
import { signal } from "impact-react-signals";

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
    increase,
  };

  function increase() {
    setCount((current) => current + 1);
  }
}
```

Compose the store using additional functions which you call during instantiation of the store. As they are called during instantiation, they can also consume parent stores, do cleanups etc.

```ts
import { signal } from "impact-react-signals";

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
    increase,
  };

  function increase() {
    setCount((current) => current + 1);
  }
}
```

There are no limits to how big your stores can be in terms of performance. How you choose to integrate logic into existing stores or create new stores is up to you.

## Props

Stores can receive props. These props becomes observable values inside the store. When React reconciles and updates the prop, the corresponding observable will update its value and trigger observation.

Here showing an example using Mobx:

```tsx
import { cleanup } from "impact-react";
import { computed, autorun } from "mobx";

type StoreProps = {
  // Do not use optional props, but rather undefined
  user: UserDTO | undefined;
  initialCount: number;
};

function AppStore(props: StoreProps) {
  const state = observable({
    // Can be used as initial values
    count: props.initialCount,
  });

  // If the user prop changes, you can derive from it when
  // it changes
  const isAwesome = computed(() => props.user?.isAwesome ?? false);

  // The same goes for effects
  cleanup(
    autorun(() => {
      if (props.user?.isAwesome) {
        alert("Good for you!");
      }
    }),
  );

  return {
    // You can just expose it
    // to nested stores and components
    get user() {
      return props.user;
    },
  };
}

const useAppStore = createStore(AppStore);

type Props = { user?: UserDTO };

function App(props) {
  return (
    <useAppStore.Provider user={props.user} initialCount={10}>
      <SomeAppFeature />
    </useAppStore.Provider>
  );
}
```

## Nested stores

When providing stores you can pass them initial state from React. This is immensely useful when dealing with asynchronous state. As an example we might have a store that handles authentication and the application should only mount when you are `AUTHENTICATED`.

Showing an example using [impact-react-signals]():

```ts
import { createStore } from "./store";
import { cleanup } from "impact-react";
import { signal } from "impact-react-signals";

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
import { useObserver } from "impact-react-signals";
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

  const { session } = useSessionStore();
  const currentSession = session();

  if (currentSession.status === "pending") {
    return <div>Authenticating...</div>;
  }

  if (currentSession.status === "rejected") {
    return <div>Could not authenticate: {currentSession.reason}</div>;
  }

  // When the user changes this session user also changes
  const user = currentSession.value;

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
