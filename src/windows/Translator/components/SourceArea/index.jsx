import { Card, Box, InputBase, IconButton, Button as MuiButton, Tooltip } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SmartButtonRoundedIcon from '@mui/icons-material/SmartButtonRounded';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import UnfoldLessRoundedIcon from '@mui/icons-material/UnfoldLessRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded';
import { readText, writeText } from '@tauri-apps/api/clipboard';
import React, { useState, useEffect } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import toast, { Toaster } from 'react-hot-toast';
import * as ocrs from '../../../../interfaces_ocr';
import { speak } from '../../../../global/speak';
import { useTheme } from '@mui/material/styles';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { useTranslation } from 'react-i18next';
import { atom, useSetAtom } from 'jotai';
import { get } from '../../../main';
import './style.css';
import { useGetState } from '../../../../hooks';

export const sourceTextAtom = atom('');

export default function SourceArea() {
    const [dynamicTranslate, _] = useState(get('dynamic_translate') ?? false);
    const setSourceText = useSetAtom(sourceTextAtom);
    const [expand, setExpand] = useState(true);
    const [text, setText, getText] = useGetState('');
    const [ocrSuccess, setOcrSuccess] = useState(false);
    const { t } = useTranslation();
    const theme = useTheme();

    function ocr() {
        setOcrSuccess(false);
        setText(t('translator.sourcearea.ocr'));
        invoke('get_base64').then((base64) => {
            let ocror = ocrs[get('screenshot_translate_interface') ?? 'system'];
            ocror.ocr(base64, get('ocr_language') ?? 'auto', setFormatText, 'translate').then(
                (_) => {
                    setOcrSuccess(true);
                },
                (e) => {
                    setOcrSuccess(false);
                    setText(e.toString());
                }
            );
        });
    }

    function setFormatSourceText(txt) {
        if (get('delete_newline') ?? false) {
            // /s匹配空格和换行符 /g表示全局匹配
            txt = txt.replace(/\s+/g, ' ');
        }
        setSourceText(txt);
    }
    function setFormatText(txt) {
        if (get('delete_newline') ?? false) {
            // /s匹配空格和换行符 /g表示全局匹配
            txt = txt.replace(/\s+/g, ' ');
        }
        setText(txt);
    }
    listen('new_selection', (event) => {
        let source = event.payload.trim();
        if (get('incremental_translation')) {
            source = (getText() + ' ' + source).trim();
        }
        setFormatSourceText(source);
        setFormatText(source);
    });
    useEffect(() => {
        if (ocrSuccess) {
            setFormatSourceText(text.trim());
        }
    }, [ocrSuccess, text]);
    useEffect(() => {
        if (appWindow.label !== 'persistent' && appWindow.label !== 'popclip_ocr') {
            // 获取选中文本
            invoke('get_translate_text').then(async (v) => {
                let source = v;
                if (source !== '') {
                    source = source.trim();
                } else {
                    source = (await readText()) ?? '';
                }
                setFormatSourceText(source);
                setFormatText(source);
            });
        }
        if (appWindow.label === 'popclip_ocr') {
            ocr();
        }
    }, []);
    if (appWindow.label === 'popclip_ocr') {
        listen('translate', (_) => {
            ocr();
        });
    }
    // 复制内容
    function copy(who) {
        writeText(who).then((_) => {
            toast.success(t('info.writeclipboard'), {
                duration: 500,
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
    let inputTimer = null;
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
                            if (inputTimer) {
                                clearTimeout();
                            }
                            inputTimer = setTimeout(() => {
                                setSourceText(e.target.value);
                            }, 2000);
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
                        <Tooltip title={t('translator.speak')}>
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
                        <Tooltip title={t('translator.copy')}>
                            <ContentCopyRoundedIcon />
                        </Tooltip>
                    </IconButton>
                    <IconButton
                        className='source-button'
                        onClick={() => {
                            setFormatSourceText(newText);
                        }}
                    >
                        <Tooltip title={t('translator.sourcearea.deletenewline')}>
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
                        <Tooltip title={t('translator.sourcearea.clear')}>
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
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                    {t('translator.sourcearea.translate')}
                </MuiButton>
            </Box>
        </Card>
    );
}
