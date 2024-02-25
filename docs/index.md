---
layout: home

hero:
  name: "Impact;"
  tagline: "/** \n
  * Reactive state management for React \n
*/
  "
  image:
    light: /Icon.png
    dark: /Icon-dark.png
  actions:
    - theme: brand
      text: Learn
      link: /learn/
    - theme: alt
      text: Advanced
      link: /advanced/lists
    - theme: alt
      text: API Reference
      link: /useStore

features:
  - title: Familiar paradigm
    details: Use the hooks pattern you know and love from React, but without the mental and performance overhead of reconcilication.
  - title: Globally or scoped
    details: Scope state management globally or to component trees, where React data fetching patterns can be embraced.
  - title: Accessible DX
    details: Minimize "time to source" when navigating and debugging code. Sourcemaps driven debugger giving you code insight during runtime.
codeCaption: Example store 
code: |
  import { useStore, signal } from 'impact-react'

  function Store() {
    let interval
    const tick = signal(0)
    const isTicking = signal(false)

    const startInterval = () => {
      interval = setInterval(() => {
        tick.value++
      }, 500)
      isTicking.value = true
    }

    const stopInterval = () => {
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
          stopInterval()
        } else {
          startInterval()
        }
      }
    }
  }

  export default function App() {
    const { tick, isTicking, toggle } = useStore(Store)

    return (
      <div>
        <h4>Tick count: {tick}</h4>
        <button onClick={toggle}>{isTicking ? "Stop" : "Start"}</button>
      </div>
    )
  }
---


<HomeContent>

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

Or start from [codesandbox.io](https://codesandbox.io/p/devbox/impact-template-fp6gd9)

## Install debugger

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