import { appWindow } from '@tauri-apps/api/window';
import { BrowserRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';

import Screenshot from './window/Screenshot';
import Translate from './window/Translate';
import Recognize from './window/Recognize';
import Updater from './window/Updater';
import { store } from './utils/store';
import Config from './window/Config';
import './style.css';
import './i18n';

const windowMap = {
    translate: <Translate />,
    screenshot: <Screenshot />,
    recognize: <Recognize />,
    config: <Config />,
    updater: <Updater />,
};

export default function App() {
    const { setTheme } = useTheme();
    const { i18n } = useTranslation();

    useEffect(() => {
        store.get('app_theme').then((t) => {
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
        store.get('app_language').then((l) => {
            if (l) {
                i18n.changeLanguage(l);
            } else {
                i18n.changeLanguage('en');
                store.set('app_language', 'en');
                store.save();
            }
        });
    }, []);

    return <BrowserRouter>{windowMap[appWindow.label]}</BrowserRouter>;
}
