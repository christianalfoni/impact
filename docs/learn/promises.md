---
code: |
    import { Suspense } from 'react'
    import { store, signal, cleanup, use } from 'impact-react'

    const useStore = store(() => {
        const fetchData = () => new Promise((resolve) => setTimeout(() => resolve('DATA'), 2000))
        const data = signal(fetchData())

        return {
            get data() {
                return data.value
            }
        }
    })

    function Data() {
        const { data } = useStore()

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
        const store = useStore()
        const data = use(store.data)

        return <h1>{data}</h1>
    }

    export default function App() {
        return (
            <useStore.Provider>
                <Data />
                <Suspense fallback={<h4>Suspending...</h4>}>
                    <SuspendedData />
                </Suspense>
            </useStore.Provider>
        )
    }
---

# Promises

React is synchronous. You can not await promises during component render. Typically you use effects to call asynchronous APIs and then update local component state with the result of the promise. The states of `LOADING` and `ERROR` are typically handled in individual states.

**Impact** signals has first class support for promises. That means you can treat promises as any other values and consume them directly in components.

When a promise is assigned to a signal it gets enhanced with a `.status` property, with related `.reason` and `.value`, which is from the [use]() specification of React. This makes the promise compatible with the use hook, but the promise itself is also reactive. That means you can just consume the `status` directly where a suspending `use` is not the tool for the job.

This is as powerful for data fetching as mutations, which you can learn more about in the [advanced]() section.

<ClientOnly>
  <Playground />
</ClientOnly>