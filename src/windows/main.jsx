import { atom, createStore, Provider } from 'jotai';
import { appWindow } from '@tauri-apps/api/window';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import React from 'react';
import { readConfig } from '../global/config';
import Translator from './Translator';
import Config from './Config';
import Ocr from './Ocr';
import './i18n';
import '../styles/style.css';

const windowRouter = {
    persistent: <Translator />,
    translator: <Translator />,
    popclip: <Translator />,
    config: <Config />,
    ocr: <Ocr />,
    util: (
        <>
            <Translator />
            <Config />
            <Ocr />
        </>
    ),
};

const configStore = createStore();
const configAtom = atom({});

export function get(key) {
    let config = configStore.get(configAtom);

    return config[key];
}

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
document.addEventListener('keydown', async (e) => {
    let allowKeys = ['c', 'v', 'x', 'a'];
    if (e.ctrlKey && !allowKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
    if (e.key.startsWith('F')) {
        e.preventDefault();
    }
    if (e.key === 'Escape') {
        await appWindow.close();
    }
});

readConfig().then((v) => {
    configStore.set(configAtom, v);
    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <Provider store={configStore}>
                <BrowserRouter>{windowRouter[appWindow.label]}</BrowserRouter>
            </Provider>
        </React.StrictMode>
    );
});
