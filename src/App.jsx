import { appWindow } from '@tauri-apps/api/window';
import { BrowserRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { warn } from 'tauri-plugin-log-api';
import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';

import { invoke } from '@tauri-apps/api/tauri';
import Screenshot from './window/Screenshot';
import Translate from './window/Translate';
import Recognize from './window/Recognize';
import Updater from './window/Updater';
import { store } from './utils/store';
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
    const [devMode] = useConfig('dev_mode', false);
    const [appTheme] = useConfig('app_theme', 'system');
    const [appLanguage] = useConfig('app_language', 'en');
    const [appFont] = useConfig('app_font', 'default');
    const [appFallbackFont] = useConfig('app_fallback_font', 'default');
    const [appFontSize] = useConfig('app_font_size', 16);
    const { setTheme } = useTheme();
    const { i18n } = useTranslation();

    useEffect(() => {
        store.load();
    }, []);

    useEffect(() => {
        if (devMode !== null && devMode) {
            document.addEventListener('keydown', async (e) => {
                let allowKeys = ['c', 'v', 'x', 'a', 'z', 'y'];
                if (e.ctrlKey && !allowKeys.includes(e.key.toLowerCase())) {
                    e.preventDefault();
                }
                if (e.key === 'F12') {
                    await invoke('open_devtools');
                }
                if (e.key.startsWith('F') && e.key.length > 1) {
                    e.preventDefault();
                }
                if (e.key === 'Escape') {
                    await appWindow.close();
                }
            });
        } else {
            document.addEventListener('keydown', async (e) => {
                let allowKeys = ['c', 'v', 'x', 'a', 'z', 'y'];
                if (e.ctrlKey && !allowKeys.includes(e.key.toLowerCase())) {
                    e.preventDefault();
                }
                if (e.key.startsWith('F') && e.key.length > 1) {
                    e.preventDefault();
                }
                if (e.key === 'Escape') {
                    await appWindow.close();
                }
            });
        }
    }, [devMode]);

    useEffect(() => {
        if (appTheme !== null) {
            if (appTheme !== 'system') {
                setTheme(appTheme);
            } else {
                try {
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
                } catch {
                    warn("Can't detect system theme.");
                }
            }
        }
    }, [appTheme]);

    useEffect(() => {
        if (appLanguage !== null) {
            i18n.changeLanguage(appLanguage);
        }
    }, [appLanguage]);

    useEffect(() => {
        if (appFont !== null && appFallbackFont !== null) {
            document.documentElement.style.fontFamily = `"${appFont === 'default' ? 'sans-serif' : appFont}","${
                appFallbackFont === 'default' ? 'sans-serif' : appFallbackFont
            }"`;
        }
        if (appFontSize !== null) {
            document.documentElement.style.fontSize = `${appFontSize}px`;
        }
    }, [appFont, appFallbackFont, appFontSize]);

    return <BrowserRouter>{windowMap[appWindow.label]}</BrowserRouter>;
}
