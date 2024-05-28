import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Impact",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  description: "Reactive state management for React",
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
      { text: "Advanced", link: "/advanced/lists" },
      { text: "API Reference", link: "/useStore" },
    ],

    sidebar: [
      {
        text: "Learn",
        items: [
          { text: "Introduction", link: "/learn/" },
          { text: "Closures", link: "/learn/closures" },
          { text: "Props", link: "/learn/props" },
          { text: "Context", link: "/learn/context" },
          { text: "Reactive context", link: "/learn/reactive-context" },
          { text: "Signals", link: "/learn/signals" },
          { text: "Derived", link: "/learn/derived" },
          { text: "Stores", link: "/learn/stores" },
          { text: "Effects", link: "/learn/effects" },
          { text: "Scoping", link: "/learn/scoping" },
          { text: "Data Fetching", link: "/learn/data-fetching" },
        ],
      },
      {
        text: "Advanced",
        items: [
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
            text: "signal",
            link: "/signal",
          },
          {
            text: "store",
            link: "/store",
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
