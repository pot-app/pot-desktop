import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { Box, IconButton, Tooltip } from '@mui/material';
import { appWindow } from '@tauri-apps/api/window';
import React, { useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { listen } from '@tauri-apps/api/event';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/tauri';
import { atom, useAtom } from 'jotai';
import { get } from '../../../main';
import './style.css';

export const base64Atom = atom('');

export default function ImageArea() {
    const [base64, setBase64] = useAtom(base64Atom);
    const { t } = useTranslation();
    const theme = useTheme();
    const imgRef = useRef();

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
            <Toaster />
            <Box className='image-content'>
                {base64 ? (
                    <img
                        className='image'
                        ref={imgRef}
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
            <Box className='image-control'>
                <IconButton
                    className='control-button'
                    onClick={() => {
                        invoke('copy_img', {
                            width: imgRef.current.naturalWidth,
                            height: imgRef.current.naturalHeight,
                        }).then(() => {
                            toast.success(t('info.writeclipboard'), {
                                duration: 500,
                                style: {
                                    background: theme.palette.background.default,
                                    color: theme.palette.text.primary,
                                },
                            });
                        });
                    }}
                >
                    <Tooltip title={t('translator.copy')}>
                        <ContentCopyRoundedIcon />
                    </Tooltip>
                </IconButton>
            </Box>
        </>
    );
}
