---
codeCaption: Introducing signals
code: |
  import { signal, observe } from 'impact-react'

  function createApp() {
    const count = signal(0)
    const enabled = signal(false)

    return {
      get count() {
        return count()
      },
      get enabled() {
        return enabled()
      },
      increase() {
        count(current => current + 1)
      },
      enable() {
        enabled(true)
      }
    }
  }

  const app = createApp()

  const Counter = observe(() => (
    <button onClick={app.increase}>
      Increase ({app.count})
    </button>
  ))

  const Enabler = observe(() => (
    <button onClick={app.enable}>
      {app.enabled ? "Disable" : "Enable"}
    </button>
  ))

  export default function App() {
    return (
      <>
        <Counter />
        <Enabler />
      </>
    )
  }
---

# Signals

<ClientOnly>
  <Playground />
</ClientOnly>

`signal` is the primitive representing an observable state value. The value itself is a function and you call it to get access to unwrap the value. When unwrapping a value in a component, it will automatically observe any changes to that value. It does not matter how many signals are exposed through the application; only the ones accessed in a component will cause that component to reconcile.

Just like `useState`, the value of a signal is considered immutable and needs to _strictly_ change its value to trigger observation. 

As the example above shows, it is common to expose signals using `getters`, meaning that unwrapping the value becomes implicit when consuming a signal from a component.

::: tip

The callback of signals uses [Immer]() under the hood and allows you to use the traditional mutation API of JavaScript to make changes to complex objects.

```ts
const list = signal([])

list((current) => current.push('foo'))
```

:::