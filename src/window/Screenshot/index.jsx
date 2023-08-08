import React, { useEffect } from 'react';
import { appWindow } from '@tauri-apps/api/window';

export default function Screenshot() {
    useEffect(() => {
        if (appWindow.label === 'screenshot') {
            appWindow.show();
        }
    }, []);
    return <div>Screenshot</div>;
}
