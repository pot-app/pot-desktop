import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { appWindow } from '@tauri-apps/api/window';
import React from 'react';
import Screenshot from './window/Screenshot';
import Translate from './window/Translate';
import Recognize from './window/Recognize';
import Config from './window/Config';
import Updater from './window/Updater';
import './i18n';

const windowRouter = {
    translate: <Translate />,
    screenshot: <Screenshot />,
    recognize: <Recognize />,
    config: <Config />,
    updater: <Updater />,
};

export default function App() {
    return <NextThemesProvider attribute='class'>{windowRouter[appWindow.label]}</NextThemesProvider>;
}
