import "@radix-ui/themes/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { Theme } from "@radix-ui/themes";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme>
      <App />
    </Theme>
  </React.StrictMode>
);
