import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { atom, useAtom } from 'jotai';
import { Box } from '@mui/material';
import React, { useEffect } from 'react';
import { get } from '../../../main';
import './style.css';

export const base64Atom = atom('');

export default function ImageArea() {
    const [base64, setBase64] = useAtom(base64Atom);

    function load_img() {
        invoke('get_base64').then((v) => {
            setBase64(v);
            if (get('hide_ocr_window') ?? false) {
                appWindow.hide();
            } else {
                appWindow.show();
                appWindow.setFocus(true);
            }
        });
    }

    listen('ocr', (_) => {
        load_img();
    });

    useEffect(() => {
        load_img();
    }, []);

    return (
        <>
            <Box className='image-content'>
                {base64 ? (
                    <img
                        className='image'
                        draggable={false}
                        src={'data:image/png;base64,' + base64}
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
