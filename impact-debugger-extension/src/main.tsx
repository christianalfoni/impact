import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Panel from "./Panel";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Panel />
  </StrictMode>,
);
