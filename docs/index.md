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
    details: Use Impacts modern reactive model to manage state and Reacts component model to manage UI.
  - title: Performant and predictable
    details: Reactive primitives of signal, derived and effect, combined with inferred observation in components.
  - title: Globally or scoped
    details: Expose state management globally, or scope it to component trees to take advantage of modern React data fetching patterns.
codeCaption: Example store 
code: |
  import { useStore, signal } from 'impact-react'

  function Store() {
    let interval
    const tick = signal(0)
    const isTicking = signal(false)

    const start = () => {
      interval = setInterval(() => {
        tick.value++
      }, 500)
      isTicking.value = true
    }

    const stop = () => {
      clearInterval(interval)
      isTicking.value = false
    }
    
    return {
      get tick() {
        return tick.value
      },
      get isTicking() {
        return isTicking.value
      },
      toggle() {
        if (isTicking.value) {
          stop()
        } else {
          start()
        }
      }
    }
  }

  export default function App() {
    using store = useStore(Store)

    const { tick, isTicking, toggle } = store

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