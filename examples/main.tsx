import "@radix-ui/themes/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { Theme } from "@radix-ui/themes";
import { App } from "./App";
import { GlobalHooksProvider } from "./global-hooks";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme>
      <GlobalHooksProvider>
        <App />
      </GlobalHooksProvider>
    </Theme>
  </React.StrictMode>
);

/*

*/
