import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Impact",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  description: "Complex single page applications with React",
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
      { text: "Advanced", link: "/advanced/stores" },
      { text: "API Reference", link: "/cleanup" },
    ],

    sidebar: [
      {
        text: "Learn",
        items: [
          { text: "Introduction", link: "/learn/" },
          { text: "Closures", link: "/learn/closures" },
          { text: "Props", link: "/learn/props" },
          { text: "Context", link: "/learn/context" },
          { text: "Store", link: "/learn/store" },
          { text: "Scoping", link: "/learn/scoping" },
          { text: "Signals", link: "/learn/signals" },
          { text: "Derived", link: "/learn/derived" },
          { text: "Effects", link: "/learn/effects" },
          { text: "Async", link: "/learn/async" },
        ],
      },
      {
        text: "Advanced",
        items: [
          {
            text: "Stores",
            link: "/advanced/stores",
          },

          {
            text: "Lists",
            link: "/advanced/lists",
          },
          {
            text: "Queries and Mutations",
            link: "/advanced/queries-and-mutations",
          },
        ],
      },
      {
        text: "API Reference",
        items: [
          {
            text: "cleanup",
            link: "/cleanup",
          },
          {
            text: "createStoreProvider",
            link: "/createStoreProvider",
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
            text: "observer",
            link: "/observer",
          },
          {
            text: "signal",
            link: "/signal",
          },
          {
            text: "useStore",
            link: "/useStore",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/christianalfoni/impact" },
    ],
  },
});
