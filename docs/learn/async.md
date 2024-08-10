---
codeCaption: Managing promises
code: |
  import { Suspense } from 'react'
  import { useStore, signal, use } from 'impact-react'

  function DataStore() {
    const data = signal(fetchData())

    return {
      get data() {
        return data()
      }
    }

    function fetchData() {
      return new Promise((resolve) => setTimeout(
        () => resolve('DATA'),
        2000
      ))
    }
  }

  function Data() {
    using dataStore = useStore(DataStore)

    const data = dataStore.data

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
    using dataStore = useStore(DataStore)
    
    const data = use(dataStore.data)

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

# Async

<ClientOnly>
  <Playground />
</ClientOnly>

You might use `useEffect` to fetch data and update local component state with the result of the fetching. The states of `LOADING` and `ERROR` are typically handled in individual `useState`. You might also be using data fetching solutions like [react-query](https://tanstack.com/query/v3/) or [swr](https://swr.vercel.app/). Or maybe you use a global state store to manage the data fetching.

::: tip

You can still embrace existing data fetching solutions. The data fetching results you get from for example **react-query** can be passed to a store, where it becomes a signal. This signal stays up to date and can be used inside the store or exposed back to React through the store.

:::

**Impact** signals has first class support for promises. That means you can treat promises as any other value and consume them directly in components. When a promise is assigned to a signal it is enhanced with a `.status` property, with related `.reason` and `.value`, which is from the [use](https://react.dev/reference/react/use) specification of React. This makes the promise compatible with the use hook and can be used with [Suspense](https://react.dev/reference/react/Suspense), but the promise itself is also reactive. That means you can consume promises "as is" and check its `status` directly to evaluate what to render.

Signal promises can be used for data queries, mutations or producing any other asynchronous value. You can learn more about [queries and mutations](../deep-dive/queries-and-mutations.md) in the advanced section.

::: tip

With React 19 you can use the `use` hook from React instead

:::
