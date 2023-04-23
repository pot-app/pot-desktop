import { atom, createStore, Provider } from "jotai";
import { appWindow } from "@tauri-apps/api/window";
import ReactDOM from "react-dom/client";
import React from "react";
import { readConfig } from "../../global/config";
import "../../styles/style.css";
import App from "./App";

document.addEventListener('DOMContentLoaded', () => {
  let label = appWindow.label;
  if (label == 'translator' || label == 'popclip' || label == 'persistent') {
    appWindow.show();
    appWindow.setFocus();
  }
})

const configStore = createStore();
const configAtom = atom({});

export function get(key) {
  let config = configStore.get(configAtom);

  return config[key];
}

readConfig().then(
  v => {
    configStore.set(configAtom, v);
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <div data-tauri-drag-region className="titlebar" />
        <Provider store={configStore}>
          <App />
        </Provider>
      </React.StrictMode>
    );
  }
)

