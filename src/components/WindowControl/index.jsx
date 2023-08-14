import { VscChromeClose, VscChromeMinimize, VscChromeMaximize, VscChromeRestore } from 'react-icons/vsc';
import React, { useEffect, useState } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { Button } from '@nextui-org/react';
import './style.css';

export default function WindowControl() {
    const [isMax, setIsMax] = useState(false);

    useEffect(() => {
        listen('tauri://resize', async () => {
            if (await appWindow.isMaximized()) {
                setIsMax(true);
            } else {
                setIsMax(false);
            }
        });
    }, []);

    return (
        <div>
            <Button
                isIconOnly
                variant='light'
                style={{ borderRadius: 0, width: '35px', height: '35px' }}
                onClick={() => appWindow.minimize()}
            >
                <VscChromeMinimize style={{ fontSize: '16px' }} />
            </Button>
            <Button
                isIconOnly
                variant='light'
                style={{ borderRadius: 0, width: '35px', height: '35px' }}
                onClick={() => {
                    if (isMax) {
                        appWindow.unmaximize();
                    } else {
                        appWindow.maximize();
                    }
                }}
            >
                {isMax ? (
                    <VscChromeRestore style={{ fontSize: '16px' }} />
                ) : (
                    <VscChromeMaximize style={{ fontSize: '16px' }} />
                )}
            </Button>
            <Button
                isIconOnly
                variant='light'
                style={{
                    width: '35px',
                    height: '35px',
                }}
                className='close-button rounded-none rounded-tr-[10px]'
                onClick={() => appWindow.close()}
            >
                <VscChromeClose style={{ fontSize: '16px' }} />
            </Button>
        </div>
    );
}
