---
codeCaption: Managing promises
code: |
  import { Suspense } from 'react'
  import { useStore, store, cleanup, createStoreProvider, use } from 'impact-react'

  function DataStore() {
    const fetchData = () => new Promise((resolve) => setTimeout(() => resolve('DATA'), 2000))
    const data = signal(fetchData())

    return {
      get data() {
        return data.value
      }
    }
  }

  const DataStoreProvider = createStoreProvider(DataStore)

  function Data() {
    using dataStore = useStore(DataStore)
    const { data } = dataStore

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
      <DataStoreProvider>
        <Data />
        <Suspense fallback={<h4>Suspending...</h4>}>
          <SuspendedData />
        </Suspense>
      </DataStoreProvider>
    )
  }
---

# Data Fetching

You might use `useEffect` to fetch data and update local component state with the result of the fetching. The states of `LOADING` and `ERROR` are typically handled in individual states. You might also be using data fetching solutions like [react-query](https://tanstack.com/query/v3/) or [swr](https://swr.vercel.app/). Or maybe you use a global state store to manage the data fetching.

**Impact** signals has first class support for promises. That means you can treat promises as any other value and consume them directly in components. When a promise is assigned to a signal it is enhanced with a `.status` property, with related `.reason` and `.value`, which is from the [use](https://react.dev/reference/react/use) specification of React. This makes the promise compatible with the use hook and can be used with [Suspense](https://react.dev/reference/react/Suspense), but the promise itself is also reactive. That means you can consume promises "as is" and check its `status` directly to evaluate what to render.

Signal promises can be used for data queries, mutations or producing any other asynchronous value. You can learn more about [queries and mutations](../advanced/queries-and-mutations.md) in the advanced section.

<ClientOnly>
  <Playground />
</ClientOnly>