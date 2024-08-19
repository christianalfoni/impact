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
      { text: "Deep Dive", link: "/deep-dive/stores" },
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
          { text: "Nested Stores", link: "/learn/nested-stores" },
          { text: "Signals", link: "/learn/signals" },
          { text: "Derived", link: "/learn/derived" },
          { text: "Effects", link: "/learn/effects" },
          { text: "Promises", link: "/learn/promises" },
        ],
      },
      {
        text: "Deep Dive",
        items: [
          {
            text: "Stores",
            link: "/deep-dive/stores",
          },
          {
            text: "Resolving Stores",
            link: "/deep-dive/resolving-stores",
          },
          {
            text: "Teamwork",
            link: "/deep-dive/teamwork",
          },
          {
            text: "Lists",
            link: "/deep-dive/lists",
          },
          {
            text: "Queries and Mutations",
            link: "/deep-dive/queries-and-mutations",
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
