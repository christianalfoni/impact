import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactDevTool from "./ReactDevTool";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReactDevTool />
  </StrictMode>,
);
