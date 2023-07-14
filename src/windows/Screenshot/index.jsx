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
    const [imgWidth, setImgWidth] = useState(0);

    useEffect(() => {
        currentMonitor().then((monitor) => {
            const position = monitor.position;
            invoke('screenshot', { x: position.x, y: position.y }).then((width) => {
                //真实图片宽度
                setImgWidth(width);
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
                draggable={false}
                onLoad={() => {
                    if (appWindow.label.startsWith('screenshot') && imgurl !== '') {
                        setTimeout(() => {
                            void appWindow.show();
                            void appWindow.setFocus();
                            void appWindow.setResizable(false);
                        }, 100);
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
                    backgroundColor: '#2080f020',
                    border: '1px solid #2080f0',
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
                    backgroundColor: '#00000020',
                    cursor: 'crosshair',
                }}
                onMouseDown={(e) => {
                    if (e.buttons === 1) {
                        setIsDown(true);
                        setMouseDownX(e.clientX);
                        setMouseDownY(e.clientY);
                    } else {
                        void appWindow.close();
                    }
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
                    const dpi = imgWidth / screen.width;
                    // const dpi = monitor.scaleFactor; //这是系统的dpi，不一定是网页内容的dpi
                    const left = Math.floor(Math.min(mouseDownX, e.clientX) * dpi);
                    const top = Math.floor(Math.min(mouseDownY, e.clientY) * dpi);
                    const right = Math.floor(Math.max(mouseDownX, e.clientX) * dpi);
                    const bottom = Math.floor(Math.max(mouseDownY, e.clientY) * dpi);
                    await invoke('cut_screenshot', { left, top, right, bottom });
                    if (appWindow.label === 'screenshot_ocr') {
                        await emit('ocr');
                    } else {
                        await emit('translate');
                    }
                    await appWindow.close();
                }}
            />
        </>
    );
}
