---
codeCaption: Introducing signals
code: |
  import { signal, observer } from 'impact-react'

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

  const Counter = observer(() => (
    <button onClick={app.increase}>
      Increase ({app.count})
    </button>
  ))

  const Enabler = observer(() => (
    <button onClick={app.enable}>
      {app.enabled ? "Enabled" : "Enable"}
    </button>
  ))

  const App = () => {
    return (
      <>
        <Counter />
        <Enabler />
      </>
    )
  }

  export default App
---

# Signals

<ClientOnly>
  <Playground />
</ClientOnly>

`signal` is the primitive representing an observable value. The signal itself is a function and you call it to unwrap the value. When unwrapping a value in a component, it will automatically observe any changes to that value. It does not matter how many signals are exposed through the application; only the ones accessed in a component will cause that component to reconcile.

Just like `useState`, the value of a signal is considered immutable and needs to _strictly_ change its value to trigger observation.

As the example above shows, it is common to expose signals using `getters`, meaning that unwrapping the value becomes implicit when consuming a signal from a component.

::: tip

The callback of signals uses [Immer]() under the hood and allows you to use the traditional mutation API of JavaScript to make changes to complex objects.

```ts
const list = signal([]);

list((current) => {
  current.push("foo");
});
```

:::

::: info

The API of a signal is inspired by [Solid JS](https://www.solidjs.com/). It was chosen for the following reasons:

- Using a `.get/.set/.update` imperative API does not match the paradigm of functional React
- Using a `.value` getter/setter fits the paradigm, but bloats the code with a lot of `.value` references, making it harder to read what is being accessed and changed
- The function API just adds a couple of parenthesis and keeps the naming of the signal clear and concise in the code. It also naturally enables the use of a callback to update the value

:::
