import WallpaperRoundedIcon from '@mui/icons-material/WallpaperRounded';
import { Box, IconButton } from '@mui/material';
import React from 'react';
import './style.css';

export default function ImageArea() {
    return (
        <>
            <Box className='image-content'>
                图片区
            </Box>
            <Box className='image-control'>
                <IconButton className='control-button'>
                    <WallpaperRoundedIcon />
                </IconButton>
            </Box>
        </>

    )
}
