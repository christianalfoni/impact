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

Export a hook and a provider, unless it is global:

```ts
import { signal, useStore, createStoreProvider } from "impact-react";

export const useAppStore = () => useStore(AppStore);
export const AppStoreProvider = createStoreProvider(AppStore);

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

It is a good rule of thumb to think about global stores as stores that does not have dependency to other state or stores. If you find yourself defining a store without props at a nested level in the application you should consider implementing it in a parent store with a `create` function instead.

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