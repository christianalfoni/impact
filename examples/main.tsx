import "@radix-ui/themes/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { Theme } from "@radix-ui/themes";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme>
      <h1>Hello world</h1>
    </Theme>
  </React.StrictMode>
);
