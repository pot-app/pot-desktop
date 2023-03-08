import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../../styles/style.css"
import { readConfig } from "../../global/config";

readConfig().then(
  _ => {
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
)

