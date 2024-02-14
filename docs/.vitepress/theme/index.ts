import DefaultTheme from "vitepress/theme";
import Playground from "./Playground.vue";
import "./custom.css";
import { install } from "vue-codemirror";

// override vue-codemirror extensions

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(install, { extensions: [] });
    app.component("playground", Playground);
  },
};
