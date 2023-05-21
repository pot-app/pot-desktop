import { Box } from '@mui/material';
import React from 'react';
import './style.css';

export default function ConfigItem(props) {
    const { label, children } = props;
    return (
        <>
            <Box className='label-bar'>
                <h3 className='item-label'>{label}</h3>
            </Box>
            {children}
        </>
    );
}
