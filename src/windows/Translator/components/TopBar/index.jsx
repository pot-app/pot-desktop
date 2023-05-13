import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import React, { useState, useEffect } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { Box, IconButton } from '@mui/material';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { get } from '../../../main';
import './style.css';

let unlisten = listen('tauri://blur', () => {
    if (appWindow.label == 'translator' || appWindow.label == 'popclip') {
        appWindow.close();
    }
});

export default function TopBar() {
    const [pined, setPined] = useState(get('default_pined') ?? true);
    const [ismacos, setIsmacos] = useState(false);

    useEffect(() => {
        invoke('is_macos').then((v) => {
            setIsmacos(v);
        });
        if (appWindow.label == 'persistent') {
            appWindow.setAlwaysOnTop(pined);
        }
        // 使划词翻译窗口置顶，但是pined图标显示为false
        // 这样一来pin在划词翻译窗口的作用相当于控制是否在失去焦点的时候关闭
        // 而且对于划词翻译窗口确实需要使其一直处于置顶状态
        if (appWindow.label == 'translator') {
            appWindow.setAlwaysOnTop(true);
            setPined(false);
        }
    }, []);

    return (
        <Box className={ismacos ? 'topbar-macos' : 'topbar'}>
            <Box>
                <IconButton
                    className='topbar-button'
                    onClick={() => {
                        appWindow.setAlwaysOnTop(!pined).then((_) => {
                            if (!pined) {
                                unlisten.then((f) => {
                                    f();
                                });
                            } else {
                                unlisten = listen('tauri://blur', () => {
                                    if (appWindow.label == 'translator' || appWindow.label == 'popclip') {
                                        appWindow.close();
                                    }
                                });
                            }
                            setPined(!pined);
                        });
                    }}
                >
                    <PushPinRoundedIcon color={pined ? 'primary' : ''} />
                </IconButton>
            </Box>
            {ismacos ? (
                <></>
            ) : (
                <IconButton
                    className='topbar-button'
                    onClick={() => {
                        appWindow.close();
                    }}
                >
                    <CancelRoundedIcon />
                </IconButton>
            )}
        </Box>
    );
}
