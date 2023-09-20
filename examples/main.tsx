import "@radix-ui/themes/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";

import { Box, Container, Theme } from "@radix-ui/themes";
import { App } from "./App";
import { GlobalHooksProvider } from "./global-hooks";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme
      accentColor="grass"
      grayColor="gray"
      panelBackground="solid"
      scaling="100%"
      radius="full"
      style={{ height: "100vh" }}
    >
      <GlobalHooksProvider>
        <Box p="8" style={{ backgroundColor: "var(--gray-1)" }} height="100%">
          <Container>
            <App />
          </Container>
        </Box>
      </GlobalHooksProvider>
    </Theme>
  </React.StrictMode>,
);

/*

*/
