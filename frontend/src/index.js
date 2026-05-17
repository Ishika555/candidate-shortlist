// ============================================================
// index.js — React Entry Point
// Mounts the App component to the #root div in public/index.html
// ============================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Create the React root and render the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // StrictMode highlights potential problems in development
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
