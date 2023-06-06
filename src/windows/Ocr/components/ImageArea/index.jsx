import { appCacheDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import { atom, useAtom } from 'jotai';
import { Box } from '@mui/material';
import React, { useEffect } from 'react';
import './style.css';

export const imgUrlAtom = atom('');

export default function ImageArea() {
    const [imgUrl, setImgUrl] = useAtom(imgUrlAtom);

    useEffect(() => {
        appCacheDir().then((appCacheDirPath) => {
            join(appCacheDirPath, 'pot_screenshot_cut.png').then((filePath) => {
                setImgUrl(convertFileSrc(filePath));
                if (appWindow.label === 'ocr') {
                    void appWindow.show();
                    void appWindow.setFocus();
                }
            });
        });
    }, []);

    return (
        <>
            <Box className='image-content'>
                {imgUrl ? (
                    <img
                        className='image'
                        src={imgUrl}
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
