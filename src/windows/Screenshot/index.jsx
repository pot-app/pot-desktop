import { appWindow, currentMonitor } from '@tauri-apps/api/window';
import { appCacheDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import { emit } from '@tauri-apps/api/event';

export default function Screenshot() {
    const [imgurl, setImgurl] = useState('');
    const [isMoved, setIsMoved] = useState(false);
    const [isDown, setIsDown] = useState(false);
    const [mouseDownX, setMouseDownX] = useState(0);
    const [mouseDownY, setMouseDownY] = useState(0);
    const [mouseMoveX, setMouseMoveX] = useState(0);
    const [mouseMoveY, setMouseMoveY] = useState(0);

    useEffect(() => {
        currentMonitor().then((monitor) => {
            const size = monitor.size;
            const position = monitor.position;
            invoke('screenshot', { x: position.x, y: position.y }).then((_) => {
                appCacheDir().then((appCacheDirPath) => {
                    join(appCacheDirPath, 'pot_screenshot.png').then((filePath) => {
                        setImgurl(convertFileSrc(filePath));
                    });
                });
            });
        });
    }, []);
    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#000000',
                }}
            />
            <img
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                }}
                src={imgurl}
                onLoad={() => {
                    if (appWindow.label === 'screenshot' && imgurl !== '') {
                        setTimeout(() => {
                            void appWindow.show();
                            void appWindow.setFocus();
                        }, 50);
                    }
                }}
            />
            <div
                style={{
                    position: 'fixed',
                    top: Math.min(mouseDownY, mouseMoveY),
                    left: Math.min(mouseDownX, mouseMoveX),
                    bottom: screen.height - Math.max(mouseDownY, mouseMoveY),
                    right: screen.width - Math.max(mouseDownX, mouseMoveX),
                    backgroundColor: '#ffffff20',
                    border: '1px solid #ffffff',
                    display: !isMoved && 'none',
                }}
            />
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#ffffff00',
                    cursor: 'crosshair',
                }}
                onMouseDown={(e) => {
                    setIsDown(true);
                    setMouseDownX(e.clientX);
                    setMouseDownY(e.clientY);
                }}
                onMouseMove={(e) => {
                    if (isDown) {
                        setIsMoved(true);
                        setMouseMoveX(e.clientX);
                        setMouseMoveY(e.clientY);
                    }
                }}
                onMouseUp={async (e) => {
                    appWindow.hide();
                    setIsDown(false);
                    setIsMoved(false);
                    const monitor = await currentMonitor();
                    const dpi = monitor.scaleFactor;
                    const left = Math.floor(Math.min(mouseDownX, e.clientX) * dpi);
                    const top = Math.floor(Math.min(mouseDownY, e.clientY) * dpi);
                    const right = Math.floor(Math.max(mouseDownX, e.clientX) * dpi);
                    const bottom = Math.floor(Math.max(mouseDownY, e.clientY) * dpi);
                    await invoke('cut_screenshot', { left, top, right, bottom });
                    await emit('ocr');
                    await appWindow.close();
                }}
            />
        </>
    );
}
