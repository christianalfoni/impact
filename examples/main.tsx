import "@radix-ui/themes/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { Theme } from "@radix-ui/themes";
import { App } from "./App";
import { CommonHooksProvider } from "./common-hooks";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme>
      <CommonHooksProvider>
        <App />
      </CommonHooksProvider>
    </Theme>
  </React.StrictMode>
);
