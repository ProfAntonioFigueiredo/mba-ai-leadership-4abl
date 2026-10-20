import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { initializeBackend } from "./backend.js";
initializeBackend().then(() =>
  createRoot(document.getElementById("root")).render(<App />),
);
