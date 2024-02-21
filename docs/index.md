---
layout: home

hero:
  name: "Impact"
  tagline: Reactive state management for React
  actions:
    - theme: brand
      text: Learn
      link: /learn/
    - theme: alt
      text: Advanced
      link: /advanced/lists
    - theme: alt
      text: API Reference
      link: /store

features:
  - title: Familiar paradigm
    details: Use the hooks pattern you know and love, but without the mental and performance overhead of reconcilication.
  - title: Globally or scoped
    details: Scope state management globally or to component trees, where React data fetching patterns can be embraced.
  - title: Accessible DX
    details: Minimize "time to source" when navigating and debugging code. Sourcemaps driven debugger giving you code insight during runtime.
code: |
  import { store, signal } from 'impact-react'

  const useStore = store(() => {
    let interval
    const tick = signal(0)
    
    return {
      get tick() {
        return tick.value
      },
      toggle() {
        if (interval === undefined) {
          interval = setInterval(() => {
            tick.value++
          }, 500)
        } else {
          clearInterval(interval)
          interval = undefined
        }
      }
    }
  })

  export default function App() {
    const { tick, toggle } = useStore()

    return (
      <div>
        <h4>Tick count: {tick}</h4>
        <button onClick={toggle}>Toggle</button>
      </div>
    )
  }
---


<HomeContent>

<Playground />

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