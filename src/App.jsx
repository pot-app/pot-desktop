import { appWindow } from '@tauri-apps/api/window';
import { BrowserRouter } from 'react-router-dom';
import { info } from 'tauri-plugin-log-api';
import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';
import Screenshot from './window/Screenshot';
import Translate from './window/Translate';
import Recognize from './window/Recognize';
import Config from './window/Config';
import Updater from './window/Updater';
import { store } from './utils/store';
import './style.css';
import './i18n';

const windowRouter = {
    translate: <Translate />,
    screenshot: <Screenshot />,
    recognize: <Recognize />,
    config: <Config />,
    updater: <Updater />,
};

export default function App() {
    const { setTheme } = useTheme();

    useEffect(() => {
        store.get('app_theme').then((t) => {
            info(t);
            if (t && t !== 'system') {
                setTheme(t);
            } else {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    setTheme('dark');
                } else {
                    setTheme('light');
                }
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                    if (e.matches) {
                        setTheme('dark');
                    } else {
                        setTheme('light');
                    }
                });
            }
        });
    }, []);
    return <BrowserRouter>{windowRouter[appWindow.label]}</BrowserRouter>;
}
