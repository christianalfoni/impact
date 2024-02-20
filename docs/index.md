---
# https://vitepress.dev/reference/default-theme-home-page
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
      link: /advanced/
    - theme: alt
      text: Documentation
      link: /store

features:
  - title: Simple and performant
    details: Implement shared state management without the mental and performance overhead of component reconcilication.
  - title: Globally or scoped
    details: Scope state management globally or to component trees, where React data fetching patterns can be embraced.
  - title: Accessible DX
    details: Minimize "time to source" when navigating and debugging code. Sourcemaps driven debugger giving you code insight during runtime.
code: |
  import { store, signal } from 'impact-react'

  const useStore = store(() => {
    const tick = signal(0)
    let interval

    return {
      get tick() {
        return tick.value
      },
      start() {
        interval = setInterval(() => {
          tick.value++
        }, 500)
      },
      stop() {
        clearInterval(interval)
      }
    }
  })

  export default function App() {
    const { tick, start, stop } = useStore()

    return (
      <div>
        <h4>Tick count: {tick}</h4>
        <button onClick={start}>Start</button>
        <button onClick={stop}>Stop</button>
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

</HomeContent>