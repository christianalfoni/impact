import "@radix-ui/themes/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { Theme } from "@radix-ui/themes";
import { App } from "./App";
import { ServiceProvider } from "impact-app";
import { RouterService } from "./services/Router";
import { ApiService } from "./services/Api";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme>
      <ServiceProvider services={[RouterService, ApiService]}>
        <App />
      </ServiceProvider>
    </Theme>
  </React.StrictMode>
);
