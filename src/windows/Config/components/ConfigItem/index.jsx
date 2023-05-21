import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import { Box, Tooltip } from '@mui/material';
import React from 'react';
import './style.css';

export default function ConfigItem(props) {
    const { label, children, help } = props;
    return (
        <Box className='label-bar'>
            <span className='item-label'>
                {label}
                {help && (
                    <Tooltip title={help}>
                        <HelpRoundedIcon
                            fontSize='small'
                            sx={{ margin: 'auto', marginLeft: '8px' }}
                        />
                    </Tooltip>
                )}
            </span>
            {children}
        </Box>
    );
}
