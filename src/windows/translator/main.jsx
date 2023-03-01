import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../../styles/style.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div data-tauri-drag-region class="titlebar" />
    <App />
  </React.StrictMode>
);
