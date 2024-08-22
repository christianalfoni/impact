# Stores

## Constructing stores

Define your store much like a component, only returning an API to interact with state management instead of UI.

```ts
function AppStore() {
  return {};
}
```

You can return signals "as is" from stores, but that means you will also be able to change them from components. It is recommended that you rather use `getters` to make the signals `readonly` and expose specific methods to change them. This also makes consumption of state consistent from stores.

::: tip

If you do want to allow updating a signal directly from a store you can add a `setter`.

:::

```ts
import { signal } from "impact-react";

function AppStore() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
    // If you really want to allow components to directly manipulate the value,
    // like in a form, you can expose a setter
    set count(newValue) {
      count(newValue);
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

Export a hook and optionally a provider if it it depends on props or parent stores:

```ts
import { signal, Signal, useStore, createStoreProvider } from "impact-react";

export const useAppStore = () => useStore(AppStore);
export const AppStoreProvider = createStoreProvider(AppStore);

type Props = {
  initialCount: number;
};

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

## Props

Stores that are provided in the React component tree can receive props. These props becomes signals inside the store. When React reconciles and updates the prop, the corresponding signal will update its value and trigger observation. That means you should always consume the prop from the props object, as that gives you the latest value of the signal.

```tsx
import { Signal, createStoreProvider, derived, effect } from "impact-react";

type StoreProps = {
  // Do not define props as optional, but rather
  // make them possibly undefined
  user: UserDTO | undefined;
};

function AppStore(props: StoreProps) {
  // If the user prop changes, you can derive from it when
  // it changes
  const isAwesome = derived(() => props.user?.isAwesome ?? false);

  // The same goes for effects
  effect(() => {
    if (props.user?.isAwesome) {
      alert("Good for you!");
    }
  });

  return {
    get user() {
      // You can just expose it
      // to nested stores and components "as is"
      return props.user;
    },
  };
}

const AppStoreProvider = createStoreProvider(AppStore);

type Props = { user?: UserDTO };

function App(props) {
  return (
    <AppStoreProvider user={props.user}>
      <SomeAppFeature />
    </AppStoreProvider>
  );
}
```

If a `prop` never changes, but you want to use it as an initial value, just put it in a signal:

```ts
function CounterStore(props) {
  const count = signal(props.initialCount);

  return {
    get count() {
      return count();
    },
  };
}
```

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

  // When the auth changes we update the session
  api.onAuthChange((maybeUser) => session(Promise.resolve(maybeUser)));

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
import { observer } from "impact-react";
import { useSessionStore } from "../stores/SessionStore";
import { AppStoreProvider } from "../stores/AppStore";
import { App } from "./App";

export default observer(function AppSession() {
  const { session } = useSessionStore();

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
});
```

In this application there is no reason to show the `<App />` without a user. Now we split the asynchronous nature of the session and can isolate the state management of the App around a guaranteed user.

```ts
import { User } from "./ApiStore";
import {
  useStore,
  Signal,
  signal,
  cleanup,
  createStoreProvider,
} from "impact-react";

export const useAppStore = () => useStore(AppStore);
export const AppStoreProvider = createStoreProvider(AppStore);

type Props = {
  user: User;
};

function AppStore(props: Props) {
  return {
    get user() {
      // Any updates from React is updated on the signal, so
      // we'll just use that signal for the user and expose
      // it on the store
      return props.user;
    },
  };
}
```

A different example would be if you have an `EditTicket` component with complex state management. You can create an `EditTicketStore` with a provider which requires a `ticket`. Now you have a transient store mounted for that ticket until you unmount the editing experience due to some other state change.

## Providing stores in React

By default a store is global. You use the `createStoreProvider` to provide the store through the React context. At times a store represents a specific component. Since you can not provide and consume a context in the same component you will need to split them up. A recommended pattern for that is:

```tsx
export function Counter() {
  return (
    <CounterStoreProvider>
      <CounterContent />
    </CounterStoreProvider>
  );
}

const CounterContent = observer(function CounterContent() {
  const { count } = useCounterStore();

  return <div>{count}</div>;
});
```

The `Counter` component is now able to use other stores to resolve any asynchronous state, include a suspense and error boundary etc. Here shown in a more relevant example:

```tsx
export const Editor = observer(function Editor(props) {
  const { getProcess } = useAppStore()

  const process = use(getProcess(props.id))

  return (
    <EditorStoreProvider process={process}>
      <Suspense fallback={<Skeleton />}>
        <EditorContent />
      </Suspense>
    </CounterStoreProvider>
  );
})

const EditorContent = observer(function EditorContent() {
  const { dataFromProcess, isAwesome } = useEditorStore();

  const dataFromProcess = use(dataFromProcess)

  return <div>{isAwesome}</div>;
})
```
