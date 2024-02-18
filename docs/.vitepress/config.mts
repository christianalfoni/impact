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
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Learn",
        items: [
          { text: "State Management", link: "/learn" },
          { text: "Closures", link: "/learn/closures" },
          { text: "Props", link: "/learn/props" },
          { text: "React Context", link: "/learn/react-context" },
          { text: "Impact Context", link: "/learn/impact-context" },
          { text: "Signals", link: "/learn/signals" },
        ],
      },
      {
        text: "API",
        items: [{ text: "globalStore", link: "/api#globalstore" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/christianalfoni/impact" },
    ],
  },
});
