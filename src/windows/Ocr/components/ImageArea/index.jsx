import { appCacheDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import { Box } from '@mui/material';
import React, { useState, useEffect } from 'react';
import './style.css';

export default function ImageArea() {
    const [imageUrl, setImageUrl] = useState();

    useEffect(() => {
        void appWindow.show();
        void appWindow.setFocus();
        appCacheDir().then((appCacheDirPath) => {
            join(appCacheDirPath, 'pot_screenshot_cut.png').then((filePath) => {
                setImageUrl(convertFileSrc(filePath));
                if (appWindow.label === 'ocr') {
                }
            });
        });
    }, []);

    return (
        <>
            <Box className='image-content'>
                {imageUrl ? (
                    <img
                        className='image'
                        src={imageUrl}
                    />
                ) : (
                    <img
                        className='image'
                        src='/empty.svg'
                    ></img>
                )}
            </Box>
        </>
    );
}
