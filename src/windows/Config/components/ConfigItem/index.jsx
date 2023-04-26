import React from 'react';
import { Box } from '@mui/material';
import './style.css';

export default function ConfigItem(props) {
    const { label, children, labelItem } = props;
    return (
        <>
            <Box className='label-bar'>
                <h3 className='item-label'>{label}</h3>
                {labelItem}
            </Box>
            {children}
        </>
    );
}
