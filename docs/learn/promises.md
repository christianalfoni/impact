---
codeCaption: Promises
code: |
  import { Suspense } from 'react'
  import { createStore, signal, use, useObserver } from 'impact-react'

  function DataStore() {
    const [data, setData] = signal(fetchData())

    return {
      data
    }

    function fetchData() {
      return new Promise((resolve) => setTimeout(
        () => resolve('DATA'),
        2000
      ))
    }
  }

  const useDataStore = createStore(DataStore)

  function Data() {
    using _ = useObserver()
    
    const dataStore = useDataStore()
    const data = dataStore.data()

    if (data.status === 'pending') {
      return <h4>Loading...</h4>
    }

    if (data.status === 'rejected') {
      return <h4>Error: ${data.reason}</h4>
    }

    return (
      <h1>
        {data.value}
      </h1>
    )
  }

  function SuspendedData() {
    using _ = useObserver()

    const dataStore = useDataStore()
    const data = use(dataStore.data())

    return <h1>{data}</h1>
  }

  export default function App() {
    return (
      <>
        <Data />
        <Suspense fallback={<h4>Suspending...</h4>}>
          <SuspendedData />
        </Suspense>
      </>
    ) 
  }
---

# Promises

Arguably the most complicated part of state management, and coding in general, is to manage asynchronicity. There are different complicated asynchronous concepts in state management that controls a user experience, but at the core of this we typically have a promise. It being data fetching, creating a websocket connection, waiting for a modal to close etc. With React 19 we have a new hook called `use` which allows us to consume promises as values in components. This is a pretty big deal as it allows us to think about asynchronous state as actual consumable values.

::: tip

If you are not using React 19 yet, you can use a `use` polyfill from Impact

:::

**Impact** signals has first class support for promises. That means you can treat promises as any other value and consume them directly in components.

```ts
import { signal } from "impact-react";

// Create a signal with a promise
const [promisedValue, setPromisedValue] = signal(getSomePromisedValue());

// Unwrapping it gives you an Observable Promise
const promise = promisedValue();

// You can await the promise inside a store
const value = await promise;

// Or you can use the use hook inside a component
const value = use(promise);
```

When a promise is assigned to a signal it is enhanced with a `.status` property, with related `.reason` and `.value`, which is from the [use](https://react.dev/reference/react/use) specification of React. This makes the promise compatible with the use hook and can be used with [Suspense](https://react.dev/reference/react/Suspense), but the promise itself is also observable. That means you can consume promises "as is" and check its `status` directly to evaluate what to render.

```ts
import { signal } from "impact-react";

// Create a signal with a promise
const [promisedValue, setPromisedValue] = signal(getSomePromisedValue());

// Unwrapping it gives you an Observable Promise
const promise = promisedValue();

if (promise.status === "fulfilled") {
  promise.value;
} else if (promise.status === "rejected") {
  promise.reason;
} else {
  // pending
}
```

Signal promises can be used for data queries, mutations or producing any other asynchronous value. They can also be combined with `derived` and `effect`. Signal promises are also the underlying mechanism for the [query](../query.md) and [mutation](../mutation.md) primitive of **Impact**. You can learn more about [queries and mutations](../deep-dive/queries-and-mutations.md) in the advanced section.

::: tip

You can still embrace existing data fetching solutions. The data fetching results you get from for example **react-query** can be passed to a store, where it becomes a signal. This signal stays up to date and can be used inside the store or exposed back to nested components and stores.

:::

<ClientOnly>
  <Playground />
</ClientOnly>
