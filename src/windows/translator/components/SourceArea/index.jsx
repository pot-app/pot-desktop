import { Card, Box, InputBase, IconButton, Button as MuiButton, Tooltip, Snackbar, Alert } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SmartButtonRoundedIcon from '@mui/icons-material/SmartButtonRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import React, { useState, useEffect } from 'react';
import { atom, useSetAtom } from 'jotai';
import { writeText } from '@tauri-apps/api/clipboard';
import { appWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/tauri';
import speak from '../../../../global/speakClient';
import { get } from '../../main';
import './style.css'

export const sourceTextAtom = atom('');

export default function SourceArea() {
    const [dynamicTranslate, _] = useState(get('dynamic_translate') ?? false);
    const setSourceText = useSetAtom(sourceTextAtom);
    const [copyed, setCopyed] = useState(false);
    const [text, setText] = useState('');

    useEffect(() => {
        if (appWindow.label != "persistent") {
            // 获取选中文本
            invoke('get_translate_text').then(
                text => {
                    if (text != "") {
                        setSourceText(text.trim());
                        setText(text.trim());
                    }
                }
            )
        }
    }, [])

    // 复制内容
    function copy(who) {
        writeText(who).then(
            _ => { setCopyed(true) }
        )
    }

    function keyDown(event) {
        if (event.key == "Enter") {
            setSourceText(event.target.value);
        }
    }

    return (
        <Card className='sourcearea'>
            <Snackbar
                open={copyed}
                autoHideDuration={2000}
                onClose={() => { setCopyed(false) }}
                anchorOrigin={{
                    vertical: 'bottom', horizontal: 'right'
                }}
            >
                <Alert onClose={() => { setCopyed(false) }} severity="success">
                    已写入剪切板
                </Alert>
            </Snackbar>
            <Box className='overflow-sourcearea'>
                <InputBase
                    autoFocus
                    multiline
                    fullWidth
                    value={text}
                    onKeyDown={keyDown}
                    onChange={(e) => {
                        setText(e.target.value);
                        console.log(dynamicTranslate);
                        if (dynamicTranslate) {
                            setSourceText(e.target.value)
                        }
                    }}
                />
            </Box>
            <Box className='source-buttonarea'>
                <Box>
                    <IconButton className='source-button'
                        onClick={() => { speak(text) }}
                    >
                        <div id='audio'></div>
                        <Tooltip title="朗读">
                            <GraphicEqRoundedIcon />
                        </Tooltip>
                    </IconButton>
                    <IconButton className='source-button'
                        onClick={() => { copy(text) }}
                    >
                        <Tooltip title="复制">
                            <ContentCopyRoundedIcon />
                        </Tooltip>
                    </IconButton>
                    <IconButton className='source-button'
                        onClick={() => {
                            // /s匹配空格和换行符 /g表示全局匹配
                            let newText = text.replace(/\s+/g, ' ');
                            setText(newText);
                            setSourceText(newText);
                        }}
                    >
                        <Tooltip title="删除多余空格及换行">
                            <SmartButtonRoundedIcon />
                        </Tooltip>
                    </IconButton>
                </Box>
                <MuiButton
                    variant="contained"
                    size='small'
                    onClick={() => { setSourceText(text) }}
                    startIcon={<TranslateRoundedIcon />}
                >
                    翻译
                </MuiButton>
            </Box>
        </Card>
    )
}
