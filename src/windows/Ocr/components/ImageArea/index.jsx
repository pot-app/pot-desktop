import WallpaperRoundedIcon from '@mui/icons-material/WallpaperRounded';
import { readBinaryFile } from '@tauri-apps/api/fs';
import { Box, Skeleton, IconButton } from '@mui/material';
import { open } from '@tauri-apps/api/dialog';
import React, { useState, useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import './style.css';

export const imageFileAtom = atom('');

export default function ImageArea() {
    const [imageFile, setImageFile] = useAtom(imageFileAtom);
    const [imageUrl, setImageUrl] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        readBinaryFile(imageFile).then(
            (v) => {
                let binary_data_arr = new Uint8Array(v);
                let p = new Blob([binary_data_arr], { type: 'image/png' });
                setImageUrl(URL.createObjectURL(p));
                setLoading(false);
            },
            (_) => {
                setLoading(false);
            }
        );
    }, [imageFile]);

    async function selectFile() {
        setImageFile(await open());
    }

    return (
        <>
            <Box className='image-content'>
                {imageUrl ? (
                    loading ? (
                        <>
                            <Skeleton
                                variant='text'
                                sx={{ fontSize: '1rem' }}
                            />
                            <Skeleton
                                variant='circular'
                                width={40}
                                height={40}
                            />
                            <Skeleton
                                variant='text'
                                sx={{ fontSize: '1rem' }}
                            />
                            <Skeleton
                                variant='rectangular'
                                width='100%'
                                height='30%'
                            />
                            <Skeleton
                                variant='text'
                                sx={{ fontSize: '1rem' }}
                            />
                            <Skeleton
                                variant='rectangular'
                                width='100%'
                                height='30%'
                            />
                        </>
                    ) : (
                        <img
                            className='image'
                            src={imageUrl}
                        />
                    )
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
                    onClick={selectFile}
                >
                    <WallpaperRoundedIcon />
                </IconButton>
            </Box>
        </>
    );
}
