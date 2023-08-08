import React, { useEffect } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { BrowserRouter } from 'react-router-dom';

export default function Config() {
    useEffect(() => {
        if (appWindow.label === 'config') {
            appWindow.show();
        }
    }, []);
    return (
        <BrowserRouter>
            <div>Config</div>
        </BrowserRouter>
    );
}
