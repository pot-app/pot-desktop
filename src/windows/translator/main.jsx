import React from "react";
import ReactDOM from "react-dom/client";
import { readConfig } from "../../global/config";
import App from "./App";
import "../../styles/style.css"

readConfig().then(
  _ => {
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <div data-tauri-drag-region className="titlebar" />
        <App />
      </React.StrictMode>
    );
  }
)

