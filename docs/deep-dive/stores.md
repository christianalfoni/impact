# Stores

## Constructing stores

Define your store much like a component, only returning an API to interact with state management instead of UI.

```ts
function AppStore() {
  return {};
}
```

Return signals using `getters`. This makes them readonly and triggers observation when consumed from components:

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
  initialCount: Signal<number>;
};

function AppStore(props: Props) {
  const counter = createCounter(props.initialCount());

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
import { useSessionStore } from "../stores/SessionStore";
import { AppStoreProvider } from "../stores/AppStore";
import { App } from "./App";

function AppSession() {
  using sessionStore = useSessionStore();

  if (sessionStore.session.status === "pending") {
    return <div>Authenticating...</div>;
  }

  if (sessionStore.session.status === "rejected") {
    return <div>Could not authenticate: {sessionStore.session.reason}</div>;
  }

  // When the user changes this session user also changes
  const user = sessionStore.session.value;

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
  user: Signal<User>;
};

function AppStore(props: Props) {
  // Any updates from React is updated on the signal, so
  // we'll just use that signal for the user and expose
  // it on the store
  const user = props.user;

  return {
    get user() {
      return user();
    },
  };
}
```

A different example would be if you have an `EditTicket` component with complex state management. You can create an `EditTicketStore` with a provider which requires a `ticket`. Now you have a transient store mounted for that ticket until you unmount the editing experience due to some other state change.

## Destructuring

Destructuring is a great feature of JavaScript. It allows you to extract elements of an array or properties from an object efficiently. With Impact it is recommended to **NOT** destructure props and stores for the following reasons:

**1. Not destructuring component/store props makes it easier to set initial state**

```tsx
function MyStore(props) {
  // Prevent conflicting names
  const count = signal(props.count());
}

function MyComponent(props) {
  // Prevent conflicting names
  const [count, setCount] = useState(props.count);
}
```

**2. Not destructuring component/store props gives reference to its source**

```tsx
function MyStoreOrComponent(props) {
  const foo;

  // Imagine scrolling
  props.count;
  foo;
  // We know the source of these values
}

function MyComponent() {
  using appStore = useAppStore();

  const [foo, setFoo] = useState("foo");

  // Imagine scrolling
  appStore.count;
  foo;
  // We know the source of these values
}
```

**3. Not destructuring stores prevents lack of observation**

```tsx
function MyStore() {
  using globalStore = useGlobalStore();

  // Accessing "foo" is now observed
  const derivedValue = derived(() => globalStore.foo + "!!!");
}
```

## Providing stores in React

By default a store is global. You use the `createStoreProvider` to provide the store through the React context. At times a store represents a specific component. Since you can not provide and consume a context in the same component you will need to split them up. A recommended pattern for that is:

```tsx
export function Counter() {
  return (
    <CounterStoreProvider>
      <Counter />
    </CounterStoreProvider>
  );
}

function CounterContent() {
  using counterStore = useCounterStore();

  return <div>{counterStore.count}</div>;
}
```

The `Counter` component is now able to use other stores to resolve any asynchronous state, include a suspense and error boundary etc. Here shown in a more relevant example:

```tsx
export function Editor(props) {
  using appStore = useAppStore()

  const process = use(appStore.getProcess(props.id))

  return (
    <EditorStoreProvider process={process}>
      <Suspense fallback={<Skeleton />}>
        <EditorContent />
      </Suspense>
    </CounterStoreProvider>
  );
}

function EditorContent() {
  using editorStore = useEditorStore();

  const dataFromProcess = use(editorStore.dataFromProcess)

  return <div>{dataFromProcess.isAwesome}</div>;
}
```
