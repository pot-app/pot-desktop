import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { appWindow } from '@tauri-apps/api/window';
import { Box, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import './style.css';

export default function TopBar() {
    const [isMacos, setIsMacos] = useState(false);
    useEffect(() => {
        invoke('is_macos').then((v) => {
            setIsMacos(v);
        });
    }, []);
    return (
        <Box className='topbar-config'>
            {isMacos ? (
                <></>
            ) : (
                <IconButton
                    className='topbar-button'
                    onClick={async () => {
                        await appWindow.close();
                    }}
                >
                    <CancelRoundedIcon />
                </IconButton>
            )}
        </Box>
    );
}
