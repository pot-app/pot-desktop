import { Card, Box, InputBase, IconButton, Button as MuiButton, Tooltip } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SmartButtonRoundedIcon from '@mui/icons-material/SmartButtonRounded';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import UnfoldLessRoundedIcon from '@mui/icons-material/UnfoldLessRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded';
import { writeText } from '@tauri-apps/api/clipboard';
import React, { useState, useEffect } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import toast, { Toaster } from 'react-hot-toast';
import { speak } from '../../../../global/speak';
import { useTheme } from '@mui/material/styles';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { atom, useSetAtom } from 'jotai';
import { get } from '../../../main';
import './style.css';

export const sourceTextAtom = atom('');

export default function SourceArea() {
    const [dynamicTranslate, _] = useState(get('dynamic_translate') ?? false);
    const setSourceText = useSetAtom(sourceTextAtom);
    const [expand, setExpand] = useState(true);
    const [text, setText] = useState('');
    const theme = useTheme();

    listen('new_selection', (event) => {
        let source = event.payload.trim();
        if (get('delete_newline') ?? false) {
            // /s匹配空格和换行符 /g表示全局匹配
            source = source.replace(/\s+/g, ' ');
        }
        setSourceText(source);
        setText(source);
    });

    useEffect(() => {
        if (appWindow.label !== 'persistent') {
            // 获取选中文本
            invoke('get_translate_text').then((v) => {
                if (v !== '') {
                    let source = v.trim();
                    if (get('delete_newline') ?? false) {
                        // /s匹配空格和换行符 /g表示全局匹配
                        source = source.replace(/\s+/g, ' ');
                    }
                    setSourceText(source);
                    setText(source);
                }
            });
        }
    }, []);

    // 复制内容
    function copy(who) {
        writeText(who).then((_) => {
            toast.success('已写入剪切板', {
                style: {
                    background: theme.palette.background.default,
                    color: theme.palette.text.primary,
                },
            });
        });
    }

    function keyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            setSourceText(event.target.value);
        }
    }

    return (
        <Card className='sourcearea'>
            <Toaster />
            <Box
                className='overflow-sourcearea'
                sx={{ display: !expand && 'none' }}
            >
                <InputBase
                    autoFocus
                    multiline
                    fullWidth
                    value={text}
                    onKeyDown={keyDown}
                    sx={{ fontSize: get('font_size') ?? '1rem' }}
                    onChange={(e) => {
                        setText(e.target.value);
                        if (dynamicTranslate) {
                            setSourceText(e.target.value);
                        }
                    }}
                />
            </Box>
            <Box className='source-buttonarea'>
                <Box sx={{ display: 'inline-flex' }}>
                    <IconButton
                        className='source-button'
                        onClick={async () => {
                            await speak(text);
                        }}
                    >
                        <Tooltip title='朗读'>
                            <GraphicEqRoundedIcon />
                        </Tooltip>
                    </IconButton>
                    <IconButton
                        className='source-button'
                        onClick={() => {
                            if (text !== '') {
                                copy(text);
                            }
                        }}
                    >
                        <Tooltip title='复制'>
                            <ContentCopyRoundedIcon />
                        </Tooltip>
                    </IconButton>
                    <IconButton
                        className='source-button'
                        onClick={() => {
                            // /s匹配空格和换行符 /g表示全局匹配
                            let newText = text.replace(/\s+/g, ' ');
                            setText(newText);
                            setSourceText(newText);
                        }}
                    >
                        <Tooltip title='删除多余空格及换行'>
                            <SmartButtonRoundedIcon />
                        </Tooltip>
                    </IconButton>
                    <IconButton
                        className='source-button'
                        onClick={() => {
                            setExpand(!expand);
                        }}
                    >
                        {expand ? <UnfoldLessRoundedIcon /> : <UnfoldMoreRoundedIcon />}
                    </IconButton>
                    <IconButton
                        className='source-button'
                        sx={{
                            visibility: text === '' && 'hidden',
                        }}
                        onClick={() => {
                            setSourceText('');
                            setText('');
                        }}
                    >
                        <Tooltip title='清空'>
                            <ClearAllRoundedIcon />
                        </Tooltip>
                    </IconButton>
                </Box>
                <MuiButton
                    variant='contained'
                    size='small'
                    onClick={() => {
                        setSourceText(text);
                    }}
                    startIcon={<TranslateRoundedIcon />}
                >
                    翻译
                </MuiButton>
            </Box>
        </Card>
    );
}
