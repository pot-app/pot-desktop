import { atom, createStore, Provider } from "jotai";
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
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <Provider store={configStore}>
          <App />
        </Provider>
      </React.StrictMode>
    );
  }
)

