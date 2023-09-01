import { appWindow } from '@tauri-apps/api/window';
import { BrowserRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';

import Screenshot from './window/Screenshot';
import Translate from './window/Translate';
import Recognize from './window/Recognize';
import Updater from './window/Updater';
import Config from './window/Config';
import { useConfig } from './hooks';
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
    const [appTheme] = useConfig('app_theme', 'system');
    const [appLanguage] = useConfig('app_language', 'en');
    const { setTheme } = useTheme();
    const { i18n } = useTranslation();

    useEffect(() => {
        if (appTheme !== null) {
            if (appTheme !== 'system') {
                setTheme(appTheme);
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
        }
        if (appLanguage !== null) {
            i18n.changeLanguage(appLanguage);
        }
    }, [appTheme, appLanguage]);

    return <BrowserRouter>{windowMap[appWindow.label]}</BrowserRouter>;
}
