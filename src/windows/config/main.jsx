import { atom, createStore, Provider } from "jotai";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import React from "react";
import { readConfig } from "../../global/config";
import "../../styles/style.css"
import App from "./App";

const configStore = createStore();
const configAtom = atom({});

export function get(key) {
  let config = configStore.get(configAtom);

  return config[key];
}

readConfig().then(
  v => {
    configStore.set(configAtom, v);
    const rootElement = document.getElementById("root");
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <Provider store={configStore}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </React.StrictMode>
    );
  }
)

