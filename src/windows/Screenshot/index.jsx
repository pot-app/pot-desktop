import { appWindow, currentMonitor } from '@tauri-apps/api/window';
import { appCacheDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api';

export default function Screenshot() {
    const [imgurl, setImgurl] = useState('');

    useEffect(() => {
        currentMonitor().then((monitor) => {
            const size = monitor.size;
            const position = monitor.position;
            invoke('screenshot', { x: position.x, y: position.y }).then((_) => {
                appCacheDir().then((appCacheDirPath) => {
                    join(appCacheDirPath, 'pot_screenshot.png').then((filePath) => {
                        setImgurl(convertFileSrc(filePath));
                        if (appWindow.label === 'screenshot') {
                            void appWindow.show();
                        }
                    });
                });
            });
        });
    }, []);
    return (
        <>
            <img
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                }}
                src={imgurl}
            />
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100vh',
                    cursor: 'crosshair',
                    backgroundColor: '#ffffff20',
                }}
            />
        </>
    );
}
