---
layout: home

hero:
  name: "Impact"
  tagline: "/** \n
  * Reactive state management for React \n
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
      link: /useStore
    - theme: alt
      text: Start from template 
      link: https://codesandbox.io/p/devbox/impact-template-fp6gd9

features:
  - title: The best of both worlds
    details: Use Impacts reactive model to manage state and Reacts reconciliation model to manage UI.
  - title: Performant and predictable
    details: Reactive primitives of signal, derived and effect, combined with inferred observation in components.
  - title: Globally or scoped
    details: Expose state management globally, or scope it to component trees to take advantage of modern React data fetching patterns.
codeCaption: Example store 
code: |
  import { useStore, store } from 'impact-react'

  function CounterStore() {
    const counter = store({
      tick: 0,
      isTicking: false,
      toggle() {
        if (counter.isTicking) {
          stop()
        } else {
          start()
        }
      }
    })

    let interval

    function start() {
      interval = setInterval(() => {
        counter.tick++
      }, 500)
      counter.isTicking = true
    }

    function stop() {
      clearInterval(interval)
      counter.isTicking = false
    }
    
    return counter
  }

  export default function App() {
    using counter = useStore(CounterStore)

    const { tick, isTicking, toggle } = counter

    return (
      <div>
        <h4>Tick count: {tick}</h4>
        <button onClick={toggle}>{isTicking ? "Stop" : "Start"}</button>
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

## Install impact-react

::: code-group

```sh [npm]
npm install impact-react
```

```sh [yarn]
yarn add impact-react
```

```sh [pnpm]
pnpm add impact-react
```

:::

:warning: **impact-react** requires [Explicit Resource Management](https://babeljs.io/docs/babel-plugin-proposal-explicit-resource-management) which is currently a **Stage 3** proposal. 

## Install debugger

The Debugger will show you what signals and effects are being executed. With sourcemaps you'll see the exact point in the file where signals are changed.

The debugger will also enable warnings when observation is not enabled using the `using` keyword.

::: code-group

```sh [npm]
npm install impact-react-debugger
```

```sh [yarn]
yarn add impact-react-debugger
```

```sh [pnpm]
pnpm add impact-react-debugger
```

:::

```ts
if (import.meta.env.DEV) {
  import('impact-react-debugger')
}
```

::: tip
Hit SHIFT twice to toggle the debugger
:::


</HomeContent>