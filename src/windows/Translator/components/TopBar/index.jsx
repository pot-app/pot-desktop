import React, { useState, useEffect } from 'react';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { appWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { Box, IconButton } from '@mui/material';
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
        if (appWindow.label == 'translator') {
            appWindow.setAlwaysOnTop(true);
        }
    }, []);

    return ismacos ? (
        <Box className='topbar-macos'>
            <IconButton
                className='topbar-button'
                onClick={() => {
                    appWindow.setAlwaysOnTop(!pined).then((_) => {
                        setPined(!pined);
                    });
                }}
            >
                <PushPinRoundedIcon color={pined ? 'primary' : ''} />
            </IconButton>
        </Box>
    ) : (
        <Box className='topbar'>
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
            <IconButton
                className='topbar-button'
                onClick={() => {
                    appWindow.close();
                }}
            >
                <CancelRoundedIcon />
            </IconButton>
        </Box>
    );
}
