import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Impact",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  description: "Reactive React",
  cleanUrls: true,
  themeConfig: {
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present Christian Alfoni",
    },
    search: {
      provider: "local",
    },
    editLink: {
      pattern: "https://github.com/christianalfoni/impact/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
    logo: { light: "/Icon.png", dark: "/Icon-dark.png" },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Learn", link: "/learn/" },
      { text: "Guides", link: "/guides/choosing-reactive-primitives" },
      { text: "Impact API", link: "/create-component" },
      { text: "Signals API", link: "/signal" },
    ],

    sidebar: [
      {
        text: "Learn",
        items: [
          { text: "Introduction", link: "/learn/" },
          { text: "Closures", link: "/learn/closures" },
          { text: "Props", link: "/learn/props" },
          { text: "Context", link: "/learn/context" },
          { text: "Stores", link: "/learn/stores" },
          {
            text: "Nested Stores",
            link: "/learn/nested-stores",
          },
          { text: "Store Lifecycle", link: "/learn/store-lifecycle" },
          { text: "Consuming Stores", link: "/learn/consuming-stores" },
        ],
      },
      {
        text: "Guides",
        items: [
          {
            text: "Choosing Reactive Primitives",
            link: "/guides/choosing-reactive-primitives",
          },
          {
            text: "Developing with Impact",
            link: "/guides/developing-with-impact",
          },
          {
            text: "Queries and Mutations",
            link: "/guides/queries-and-mutations",
          },
        ],
      },
      {
        text: "Impact API",
        items: [
          {
            text: "createStore",
            link: "/create-store",
          },
        ],
      },
      {
        text: "Signals API",
        items: [
          {
            text: "signal",
            link: "/signal",
          },
          {
            text: "derived",
            link: "/derived",
          },
          {
            text: "effect",
            link: "/effect",
          },
          {
            text: "observers",
            link: "/observers",
          },
          {
            text: "query",
            link: "/query",
          },
          {
            text: "mutation",
            link: "/mutation",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/christianalfoni/impact" },
    ],
  },
});
