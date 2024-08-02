# Stores

## Constructing stores

Define your store much like a component, only returning state instead of UI.

```ts
function AppStore() {
  return {};
}
```

Return signals using `getters`. This makes them readonly and triggers observation:

```ts
import { signal } from "impact-react";

function AppStore() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
  };
}
```

Define any private function _after_ the return statement. This increases readability of the store as its key features are at the top.

```ts
import { signal } from "impact-react";

function AppStore() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
    increase() {
      updateCount();
    },
  };

  function updateCount() {
    count((current) => current + 1);
  }
}
```

Compose the store using `create` functions, which are called during instantiation of the store. That means that they can also use parent stores:

```ts
import { signal } from "impact-react";

function AppStore() {
  const counter = createCounter();

  return {
    counter,
  };
}

function createCounter() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
    increase() {
      updateCount();
    },
  };

  function updateCount() {
    count((current) => current + 1);
  }
}
```

Export a hook and a provider if it it depends on props or parent stores:

```ts
import { signal, useStore, createStoreProvider } from "impact-react";

export const useAppStore = () => useStore(AppStore);
export const AppStoreProvider = createStoreProvider(AppStore);

type Props = {
  initialCount: number
}

// Do not destructure props. This is not for technical reason,
// but pointing to props in the Store code helps emphasize its
// external source. Also often a prop is converted to a signal and
// you typically want to name them the same
function AppStore(props: Props) {
  const counter = createCounter(props.initialCount);

  return {
    counter,
  };
}

function createCounter(initialCount: number) {
  const count = signal(initialCount);

  return {
    get count() {
      return count();
    },
    increase() {
      updateCount();
    },
  };

  function updateCount() {
    count((current) => current + 1);
  }
}
```

There are no limits to how big your stores can be in terms of performance. How you choose to integrate logic into existing stores or create new stores is up to you.

## Consuming stores in React

By providing stores you can pass them initial state from React. This is immensely useful when dealing with asynchronous state. As an example we might have a store that handles authentication and the application should only mount when you are `AUTHENTICATED`.

```ts
import { signal, useStore } from "impact-react";
import { useApiStore } from "./ApiStore";

export const useSessionStore = () => useStore(SessionStore);

function SessionStore() {
  // We use our global API store
  const api = useApiStore();
  // The `authenticate` returns a promise of user if you are
  // authenticated, or null if not authenticated
  const session = signal(api.authenticate());

  // When the auth changes we update the session. The session
  // signal is just a function so we can just pass it as the listener
  // callback
  api.onAuthChange(session);

  return {
    get session() {
      return session();
    },
    signIn() {
      api.signIn();
    },
    signOut() {
      api.signOut();
    },
  };
}
```

Now that we have the session store we can use it in our top level component:

```tsx
import { useSessionStore } from "../stores/SessionStore";
import { AppStoreProvider } from "../stores/AppStore";
import { App } from "./App";

function AppSession() {
  using sessionStore = useSessionStore();

  // We consume the observable promise directly
  const session = sessionStore.session;

  if (session.status === "pending") {
    return <div>Authenticating...</div>;
  }

  if (session.status === "rejected") {
    return <div>Could not authenticate: {session.reason}</div>;
  }

  const user = session.value;

  return (
    <AppStoreProvider user={user}>
      <App />
    </AppStoreProvider>
  );
}
```

In this application there is no reason to show the `<App />` without a user. Now we split the asynchronous nature of the session and can isolate the state management of the App around a guaranteed user.

```ts
import { User, useApiStore } from "./ApiStore";
import { useStore, signal, cleanup, createStoreProvider } from "impact-react";

export const useAppStore = () => useStore(AppStore);
export const AppStoreProvider = createStoreProvider(AppStore);

type Props = {
  user: User;
};

function AppStore(props: Props) {
  const api = useApiStore();
  const user = signal(props.user);

  cleanup(api.subscribeUserUpdates(user));

  return {
    get user() {
      return user();
    },
  };
}
```

A different example would be if you have an `EditTicket` component with complex state management. You can create an `EditTicketStore` with a provider which requires a `ticket`. Now you have a transient store mounted for that ticket until you unmount the editing experience due to some other state change.
