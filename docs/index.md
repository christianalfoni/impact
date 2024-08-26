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
  - title: Nested stores
    details: Built on React context. Provide stores, pass them props and consume them from any nested component or store.
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
