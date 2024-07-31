---
layout: home

hero:
  name: "Impact"
  tagline: "/** \n
  * Complex single page applications with React \n
*/
\n\n
By CodeSandbox team
  "
  image:
    light: /Icon.png
    dark: /Icon-dark.png
  actions:
    - theme: brand
      text: Learn
      link: /learn/
    # - theme: alt
    #   text: Advanced
    #   link: /advanced/lists
    - theme: alt
      text: API Reference
      link: /cleanup
    - theme: alt
      text: Start from template 
      link: https://codesandbox.io/p/devbox/impact-template-fp6gd9

features:
  - title: The best of both worlds
    details: Use Impacts reactive model to manage state. Use Reacts reconciliation model to manage UI.
  - title: Performant and predictable
    details: Reactive primitives of signal, derived and effect, combined with inferred observation in components.
  - title: Supercharges the React context
    details: Expose reactive stores on React contexts, wielding your state management with delight.
codeCaption: Example
horizontalPlayground: true
code: |
  import { signal, observer, useStore } from 'impact-react'

  function TickStore() {
    const tick = signal(0)
    const isTicking = signal(false)

    let interval

    return {
      get tick() {
        return tick()
      },
      get isTicking() {
        return isTicking()
      },
      toggle() {
        if (isTicking()) {
          stop()
        } else {
          start()
        }
      }
    }
    
    function start() {
      interval = setInterval(() => {
        tick(current => current + 1)
      }, 500)
      isTicking(true)
    }

    function stop() {
      clearInterval(interval)
      isTicking(false)
    }
  }

  const App = observer(() => {
    const { tick, toggle, isTicking } = useStore(TickStore)

    return (
      <div>
        <h4>Tick count: {tick}</h4>
        <button onClick={toggle}>
          {isTicking ? "Stop" : "Start"}
        </button>
      </div>
    )
  })
  
  export default App
---

<HomeContent>

<hr/>

<h1 align="center">

:warning: Release candidate :warning:

</h1>

<hr/>

<ClientOnly>
  <Playground />
</ClientOnly>

## Install impact-react

```sh
npm install impact-react
```

## Install debugger

The Debugger will show you what signals and effects are being executed. With sourcemaps you'll see the exact point in the file where signals are changed.

```sh
npm install impact-react-debugger
```

```ts
if (import.meta.env.DEV) {
  import("impact-react-debugger");
}
```

::: tip

Hit SHIFT twice to toggle the debugger

:::

</HomeContent>
