import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { Box, IconButton, InputBase } from '@mui/material';
import { writeText } from '@tauri-apps/api/clipboard';
import React, { useState } from 'react';
import './style.css';

// 复制内容
function copy(who) {
    writeText(who).then((_) => {
        console.log('success');
    });
}

export default function TextArea() {
    const [resultText, setResultText] = useState('文字区');

    return (
        <>
            <Box className='text-content'>
                <InputBase
                    multiline
                    fullWidth
                    value={resultText}
                    onChange={(e) => {
                        setResultText(e.target.value);
                    }}
                />
            </Box>
            <Box className='text-control'>
                <IconButton
                    className='control-button'
                    onClick={() => {
                        copy(resultText);
                    }}
                >
                    <ContentCopyRoundedIcon />
                </IconButton>
            </Box>
        </>
    );
}
