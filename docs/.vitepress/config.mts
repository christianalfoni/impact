import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Impact",
  description: "Reactive contexts for React",
  cleanUrls: true,
  themeConfig: {
    logo: { light: "/Icon.png", dark: "/Icon-dark.png" },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Learn", link: "/learn/" },
      { text: "Advanced", link: "/advanced/" },
      { text: "API Reference", link: "/store" },
    ],

    sidebar: [
      {
        text: "Learn",
        items: [
          { text: "State Management", link: "/learn/" },
          { text: "Closures", link: "/learn/closures" },
          { text: "Props", link: "/learn/props" },
          { text: "Context", link: "/learn/context" },
          { text: "Store", link: "/learn/store" },
          { text: "Composable Store", link: "/learn/composable-store" },
          { text: "Signals", link: "/learn/signals" },
          { text: "Derived", link: "/learn/derived" },
          { text: "Effects", link: "/learn/effects" },
          { text: "Scoping", link: "/learn/scoping" },
          { text: "Promises", link: "/learn/promises" },
        ],
      },
      {
        text: "Advanced",
        items: [
          {
            text: "Lists",
            link: "/advanced/lists",
          },
        ],
      },
      {
        text: "API Reference",
        items: [
          {
            text: "Store",
            link: "/store",
          },
          {
            text: "Signal",
            link: "/signal",
          },
          {
            text: "Derived",
            link: "/derived",
          },
          {
            text: "Effect",
            link: "/effect",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/christianalfoni/impact" },
    ],
  },
});
