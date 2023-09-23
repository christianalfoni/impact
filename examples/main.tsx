import "@radix-ui/themes/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";

import { Box, Container, Theme } from "@radix-ui/themes";
import { App } from "./App";

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
      <Box p="8" style={{ backgroundColor: "var(--gray-1)" }} height="100%">
        <Container>
          <App />
        </Container>
      </Box>
    </Theme>
  </React.StrictMode>,
);

/*

*/
