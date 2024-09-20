---
layout: home

hero:
  name: "Impact"
  tagline: "/** \n
  * Delightful State Management \n
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
      text: Guides
      link: /guides/
    - theme: alt
      text: Impact API
      link: /create-component


features:
  - title: The best of both worlds
    details: Use your favourite reactive primitives to manage state. Use Reacts reconciliation model to manage UI.
  - title: Performant and accessible
    details: Reactive primitives are more performant and enables an accessible developer experience with automatic observation in components.
  - title: Next state stores
    details: Instead of leaving context and going global, take advantage of nested stores and handle state dependencies like a champ.
---

<HomeContent>

<br />

<h1 align="center">

:warning: In development :warning:

</h1>

## Presenting Impact

> **Impact** is born from the experience of building rich complex productivity applications. Their complexity is not primarily in data fetching, but managing a dynamic and highly interactive user interface on the client. Reactive primitives has helped us solve performance challenges while keeping us sane expressing all this complexity. At the same time these reactive primitives have forced us out of React and into a global scope. With **Impact** you can use the reactive primitives you know and love and replace the reconciling state management in React with intuitive and performant primitives.

[🍿 Impact Presentation 🍿](https://www.youtube.com/watch?v=x5a-9k498q0) - [🍿 Impact Technical Deep Dive 🍿](https://www.youtube.com/watch?v=yOAZo1SUYrM)

If you have used Impact in an application or you think it has valuable perspectives or concepts for a discussion, please use the [Template Slides Deck](https://docs.google.com/presentation/d/1pHBW-HxkugtK8Ny1ebj3a_klqu3HzHnSPvbVNw1drnU/edit?usp=sharing). Present Impact at your company, a local meetup or at a conference. Please reach out if you have any questions or think the slide deck should be updated.

## Install Impact

**Impact Signals** - [documentation](./signal) - [Get started template](https://codesandbox.io/p/devbox/impact-template-fp6gd9?file=%2Fsrc%2FApp.tsx%3A13%2C5)

```sh
npm install @impact-react/signals
```

**Mobx** - [documentation](https://mobx.js.org/README.html)

```sh
npm install @impact-react/mobx
```

**Preact Signals** - [documentation](https://preact.com/guide/v10/signals/)

```sh
npm install @impact-react/preact
```

**Legend State** - [documentation](https://legendapp.com/open-source/state/v3/)

```sh
npm install @impact-react/legend
```

## Automatic observation

**Babel Config**

```json
{
  // "plugins": ["@impact-react/signals/transform"]
  "plugins": ["@impact-react/*/transform"]
}
```

::: info

All functions that has a nested call to a hook that ends with the name `Store` will be wrapped in the related `observer`. That means all your store hooks needs to end with `Store`, for example `useAppStore` or `useGlobalStore`.

:::

</HomeContent>
