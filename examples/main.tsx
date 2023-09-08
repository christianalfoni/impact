import "@radix-ui/themes/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { Theme } from "@radix-ui/themes";
import { App } from "./App";
import { GlobalStoresProvider } from "./global-stores";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme>
      <GlobalStoresProvider>
        <App />
      </GlobalStoresProvider>
    </Theme>
  </React.StrictMode>,
);

/*

*/
