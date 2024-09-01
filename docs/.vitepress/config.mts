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
          { text: "Lifecycle", link: "/learn/lifecycle" },
          { text: "Store Context", link: "/learn/store-context" },
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
            text: "context",
            link: "/context",
          },
          {
            text: "createStore",
            link: "/createStore",
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
            text: "mutation",
            link: "/mutation",
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
            text: "signal",
            link: "/signal",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/christianalfoni/impact" },
    ],
  },
});
