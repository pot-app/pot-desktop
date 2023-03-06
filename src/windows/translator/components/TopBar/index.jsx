import React, { useState } from 'react'
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { Box, IconButton } from '@mui/material';
import { appWindow } from '@tauri-apps/api/window'
import './style.css'

export default function TopBar() {
    const [pined, setPined] = useState(true);
    return (
        <Box className='topbar'>
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
