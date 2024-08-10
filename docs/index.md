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
    - theme: alt
      text: API Reference
      link: /cleanup
    - theme: alt
      text: Start from template 
      link: https://codesandbox.io/p/devbox/impact-template-fp6gd9

features:
  - title: The best of both worlds
    details: Use Impacts observation model to manage state. Use Reacts reconciliation model to manage UI.
  - title: Performant and predictable
    details: Primitives of signal, derived and effect, combined with automatic observation in components.
  - title: A bridge between reconciliation and observation
    details: Makes reconciling values into signals in stores and signals into reconciling values in components.
codeCaption: Example
horizontalPlayground: true
code: |
  import { signal, useStore } from 'impact-react'

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

  export default function App() {
    using tickStore = useStore(TickStore)

    return (
      <div>
        <h4>Tick count: {tickStore.tick}</h4>
        <button onClick={tickStore.toggle}>
          {tickStore.isTicking ? "Stop" : "Start"}
        </button>
      </div>
    )
  }
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

## Presentation

[🍿 Watch Impact presentation 🍿](https://www.youtube.com/watch?v=1QHn8LVlPYE)

If you have used Impact in an application or you think it has valuable perspectives or concepts for a discussion, please use the [Template Slides Deck](https://docs.google.com/presentation/d/1pHBW-HxkugtK8Ny1ebj3a_klqu3HzHnSPvbVNw1drnU/edit?usp=sharing). Present Impact at your company, a local meetup or at a conference. Please reach out if you have any questions or think the slide deck should be updated.

## Install impact-react

```sh
npm install impact-react
```

::: warning

Impact requires Explicit Resource Management which is currently a Stage 3 proposal. It works out of the box with latest TypeScript, SWC and ESBuild. Implementations in browsers is on its way. Babel currently requires a [plugin](https://babeljs.io/docs/babel-plugin-proposal-explicit-resource-management).

:::

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
