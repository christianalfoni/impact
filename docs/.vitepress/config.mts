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
      { text: "Guides", link: "/guides/queries-and-mutations" },
      { text: "Impact API", link: "/createReactiveContext" },
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
          { text: "Reactive Context", link: "/learn/reactive-context" },
          {
            text: "Nested State Management",
            link: "/learn/nested-state-management",
          },
          { text: "Lifecycle", link: "/learn/lifecycle" },
          { text: "Shared Context", link: "/learn/shared-context" },
          {
            text: "Stores",
            link: "/learn/stores",
          },
        ],
      },
      {
        text: "Guides",
        items: [
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
            text: "createReactiveContext",
            link: "/createReactiveContext",
          },
          {
            text: "cleanup",
            link: "/cleanup",
          },
          {
            text: "context",
            link: "/context",
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
