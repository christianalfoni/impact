---
layout: home

hero:
  name: "impact-react"
  tagline: "/** \n
  * Nested observable stores \n
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
      text: Deep Dive
      link: /deep-dive/stores
    - theme: alt
      text: API Reference
      link: /cleanup

features:
  - title: The best of both worlds
    details: Use your favourite observable primitives to manage state. Use Reacts reconciliation model to manage UI.
  - title: Performant and accessible
    details: Observe state from any parent store, combined with observation in components.
  - title: Nested functional stores
    details: Built on React context. Provide functional stores, pass them observable props and consume from nested components and stores.
---

<HomeContent>

<br />

<h1 align="center">

:warning: In development :warning:

</h1>

## Presenting Impact

[🍿 Impact Presentation 🍿](https://www.youtube.com/watch?v=1QHn8LVlPYE) - [🍿 Impact Technical Deep Dive 🍿](https://www.youtube.com/watch?v=yOAZo1SUYrM)

If you have used Impact in an application or you think it has valuable perspectives or concepts for a discussion, please use the [Template Slides Deck](https://docs.google.com/presentation/d/1pHBW-HxkugtK8Ny1ebj3a_klqu3HzHnSPvbVNw1drnU/edit?usp=sharing). Present Impact at your company, a local meetup or at a conference. Please reach out if you have any questions or think the slide deck should be updated.

## Install impact-react

```sh
npm install impact-react
```

## Configure store

### Mobx

```ts
import { configureStore } from "impact-react";
import { observable } from "mobx";

export const createStore = configureStore((propValue) => {
  const value = observable.box(propValue);

  return {
    get() {
      return value.get();
    },
    set(newPropValue) {
      value.set(newPropValue);
    },
  };
});
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
