---
codeCaption: Managing promises
code: |
  import { Suspense } from 'react'
  import { observe, signal, use } from 'impact-react'

  function createApp() {
    const data = signal(fetchData())

    return {
      get data() {
        return data()
      }
    }
    
    function fetchData() => {
      return new Promise((resolve) =>
        setTimeout(() => resolve('DATA'), 2000)
      )
    }
  }

  const app = createApp()

  const Data = observe(() => {
    if (app.data.status === 'pending') {
      return <h4>Loading...</h4>
    }

    if (app.data.status === 'rejected') {
      return <h4>Error: ${app.data.reason}</h4>
    }

    return (
      <h1>
        {app.data.value}
      </h1>
    )
  })

  const SuspendedData = observe(() => {
    const data = use(app.data)

    return <h1>{data}</h1>
  })

  const App = () => {
    return (
      <>
        <Data />
        <Suspense fallback={<h4>Suspending...</h4>}>
          <SuspendedData />
        </Suspense>
      </>
    )
  }

  export default App
---

# Promises

<ClientOnly>
  <Playground />
</ClientOnly>

You might use `useEffect` to fetch data and update local component state with the result of the fetching. The states of `LOADING` and `ERROR` are typically handled in individual states. You might also be using data fetching solutions like [react-query](https://tanstack.com/query/v3/) or [swr](https://swr.vercel.app/). Or maybe you use a global state store to manage the data fetching.

**Impact** signals have first-class support for promises. That means you can treat promises as any other value and consume them directly in components. When a promise is assigned to a signal, it is enhanced with a `.status` property, with related `.reason` and `.value`, which come from the [use](https://react.dev/reference/react/use) specification of React. This makes the promise compatible with the `use` hook and usable with [Suspense](https://react.dev/reference/react/Suspense), but the promise itself is also reactive. As such, you can consume promises "as is" and check their `status` directly to evaluate what to render.

Signal promises can be used for data queries, mutations or producing any other asynchronous value. You can learn more about [queries and mutations](../advanced/queries-and-mutations.md) in the advanced section.