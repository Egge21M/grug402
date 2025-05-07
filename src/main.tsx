import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <div className="absolute inset-0 flex flex-col items-center p-4">
    <App />
  </div>,
);
