import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Counter } from "./App.tsx";
import { addDebugListener } from "@impact-react/store";
import "./index.css";

addDebugListener(console.log);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Counter />
  </StrictMode>,
);
