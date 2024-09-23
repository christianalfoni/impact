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
    details: Reactive primitives are more performant and enables an accessible developer experience. Automatic observation in components for any reactive primitives
  - title: Nested state stores
    details: Instead of leaving context and going global, take advantage of nested stores and handle state dependencies like a champ.
---

<HomeContent>

<br />

<h1 align="center">

:warning: In BETA :warning:

<iframe class="youtube-video" src="https://www.youtube.com/embed/r3r-i9A72-s?si=1eceGkJvtETCLG0O" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

</h1>

## Presenting Impact

> **Impact** is born from the experience of building rich complex productivity applications. Their complexity is not primarily in data fetching, but managing a dynamic and highly interactive user interface on the client. Reactive primitives has helped us solve performance challenges while keeping us sane expressing all this complexity. At the same time these reactive primitives have forced us out of React and into a global scope. With **Impact** you can use the reactive primitives you know and love and replace the reconciling state management in React with intuitive and performant primitives.

If you have used Impact in an application or you think it has valuable perspectives or concepts for a discussion, please use the [Template Slides Deck](https://docs.google.com/presentation/d/1pHBW-HxkugtK8Ny1ebj3a_klqu3HzHnSPvbVNw1drnU/edit?usp=sharing). Present Impact at your company, a local meetup or at a conference. Please reach out if you have any questions or think the slide deck should be updated.

## Install Impact

- **@impact-react/signals**: [Documentation](./signal) - [Get started template](https://codesandbox.io/p/devbox/impact-signals-6h3gtk)
- **@impact-react/mobx**: [Documentation](https://mobx.js.org/README.html) - [Get started template](https://codesandbox.io/p/devbox/impact-mobx-tzdy8n)
- **@impact-react/preact**: [Documentation](https://preact.com/guide/v10/signals/) - [Get started template](https://codesandbox.io/p/devbox/impact-preact-rpzzk3)
- **@impact-react/legend**: [Documentation](https://legendapp.com/open-source/state/v3/) - [Get started template](https://codesandbox.io/p/devbox/impact-legend-krrvjk)

::: code-group

```sh [signals]
# Install
npm install @impact-react/signals

# Opt-in babel plugin
{
  "plugins": ["@impact-react/signals/transform"]
}
```

```sh [mobx]
# Install
npm install @impact-react/mobx

# Opt-in babel plugin
{
  "plugins": ["@impact-react/mobx/transform"]
}
```

```sh [preact]
# Install
npm install @impact-react/preact

# Opt-in babel plugin
{
  "plugins": ["@impact-react/preact/transform"]
}
```

```sh [legend]
# Install
npm install @impact-react/legend

# Opt-in babel plugin
{
  "plugins": ["@impact-react/legend/transform"]
}
```

:::

::: info

With the babel plugin all components which calls a hook ending with the name `Store` will be wrapped in the related `observer`. That means all your store hooks needs to end with `Store`, for example `useAppStore` or `useGlobalStore`.

:::

</HomeContent>
