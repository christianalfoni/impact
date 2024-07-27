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
      { text: "Advanced", link: "/advanced/patterns" },
      { text: "API Reference", link: "/derived" },
    ],

    sidebar: [
      {
        text: "Learn",
        items: [
          { text: "Introduction", link: "/learn/" },
          { text: "Closures", link: "/learn/closures" },
          { text: "Props", link: "/learn/props" },
          { text: "Context", link: "/learn/context" },
          { text: "The Application", link: "/learn/the-application" },
          { text: "Signals", link: "/learn/signals" },
          { text: "Derived", link: "/learn/derived" },
          { text: "Effects", link: "/learn/effects" },
          { text: "Promises", link: "/learn/promises" },
        ],
      },
      {
        text: "Advanced",
        items: [
          {
            text: "Patterns",
            link: "/advanced/patterns",
          },
          {
            text: "Routing",
            link: "/advanced/routing",
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
            text: "derived",
            link: "/derived",
          },
          {
            text: "effect",
            link: "/effect",
          },
          {
            text: "observe",
            link: "/observe",
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
