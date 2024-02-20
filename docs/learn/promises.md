---
code: |
    import { store, signal, cleanup } from 'impact-react'

    const useStore = store(() => {
        const someApi = new Api()
        const data = signal(someApi.fetchData())

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
            <div>
                {data.value}
            </div>
        )
    }

    function SuspendedData() {
        
    }

    export default function App() {
        return (
            <useStore.Provider>
                <Data />
                <Suspense>
                    <SuspendedData />
                </Suspense>
            </useStore.Provider>
        )
    }
prev: /scoping
---

# Promises

React is synchronous. You can not await promises during component render. Typically you use effects to call asynchronous APIs and then update local component state with the result of the promise. The states of `LOADING` and `ERROR` are typically handled is individual states.

In **Impact** a signal has first class support for promises. That means you can treat promises as any other values and consume them directly in components.

When a promise is assigned to a signal it gets enhanced with a `.status` property, with related `.reason` and `.value`, which is from the [use]() specification of React. This makes the promise compatible with the use hook, but the promise itself is also reactive. That means you can just consume the `status` directly where a suspending `use` is not the tool for the job.

<Playground />