---
codeCaption: The Application
code: |
  import { signal, observe } from 'impact-react'

  function createApp() {
      const count = signal(0)

      return {
        get count() {
          return count()
        },
        increase() {
          count(current => current + 1)
        }
      }
  }

  const app = createApp()

  const App = observe(() => (
    <button onClick={app.increase}>
      Increase ({app.count})
    </button>
  ))

  export default App
---

# The Application

<ClientOnly>
  <Playground />
</ClientOnly>

Moving back to our initial example, we implement the same `count` and `increase`. With **Impact** we change our mindset. We think about the application as an entity completely separate from React, where React is only responsible for producing a user interface. The user interface derives from the state of the application and interacts with its public interface to change the state. That means the application can technically run without React.

This mindset is important for rich complex single page applications. The reason is that React can reach an inflection point where the structure of state, and related logic, diverges from the structure of the UI. In rich web applications this happens quickly as there is a lot of state to be managed and the state is typically shared across UI. As a result it becomes difficult to navigate and understand how the application works and make changes to it.

::: info

You might ask why something like [Mobx]() is not good enough. Mobx is great, but it has some challenges:

- It forces you to use mutable values, which is a different paradigm from React
- It encourages class based paradigm which is a different paradigm from React
- By default Mobx forces you to create action wrappers to change observables, which is especially inconvient with async functions
- It exposes all observables as a proxy which is not ideal to debug and can cause issues with 3rd parties

:::
