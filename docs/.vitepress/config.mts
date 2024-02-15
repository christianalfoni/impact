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
        items: [{ text: "Global store", link: "/learn" }],
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
