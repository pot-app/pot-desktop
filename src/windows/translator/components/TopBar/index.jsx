import React, { useState, useEffect } from 'react'
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { Box, IconButton } from '@mui/material';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window'
import './style.css'

export default function TopBar() {
    const [pined, setPined] = useState(true);
    const [ismacos, setIsmacos] = useState(false);

    useEffect(() => {
        invoke('is_macos').then(
            v => {
                setIsmacos(v)
            }
        )
    }, [])

    return (
        ismacos ?
            <Box className='topbar-macos'>
                <IconButton
                    className='topbar-button'
                    onClick={() => {
                        appWindow.setAlwaysOnTop(!pined).then(
                            _ => { setPined(!pined); }
                        )
                    }}>
                    <PushPinRoundedIcon color={pined ? 'primary' : ''} />
                </IconButton>
            </Box>
            : <Box className='topbar'>
                <IconButton
                    className='topbar-button'
                    onClick={() => {
                        appWindow.setAlwaysOnTop(!pined).then(
                            _ => { setPined(!pined); }
                        )
                    }}>
                    <PushPinRoundedIcon color={pined ? 'primary' : ''} />
                </IconButton>
                <IconButton className='topbar-button' onClick={() => { appWindow.close() }}>
                    <CancelRoundedIcon />
                </IconButton>
            </Box>
    )
}
