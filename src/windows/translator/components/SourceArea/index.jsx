import { Card, Box, InputBase, IconButton, Button as MuiButton, Tooltip } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SmartButtonRoundedIcon from '@mui/icons-material/SmartButtonRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import React, { useEffect } from 'react';
import { useAtom, atom } from 'jotai';
import { writeText } from '@tauri-apps/api/clipboard';
import { appWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/tauri';
import speak from '../../../../global/speakClient';
import './style.css'

export const sourceTextAtom = atom('');

export default function SourceArea() {
    const [sourceText, setSourceText] = useAtom(sourceTextAtom);

    useEffect(() => {
        if (appWindow.label != "persistent") {
            // 获取选中文本
            invoke('get_translate_text').then(
                text => {
                    if (text != "") {
                        setSourceText(text.trim());
                    }
                }
            )
        }
    }, [])

    // 重新翻译
    function reTranslate() {
        setSourceText(sourceText + " ");
    }

    // 复制内容
    function copy(who) {
        writeText(who).then(
            _ => { console.log('success') }
        )
    }

    return (
        <Card className='sourcearea'>
            <Box className='overflow-sourcearea'>
                <InputBase
                    autoFocus
                    multiline
                    fullWidth
                    value={sourceText}
                    onChange={(e) => { setSourceText(e.target.value) }}
                />
            </Box>
            <Box className='source-buttonarea'>
                <Box>
                    <IconButton className='source-button'
                        onClick={() => { speak(sourceText) }}
                    >
                        <div id='audio'></div>
                        <Tooltip title="朗读">
                            <GraphicEqRoundedIcon />
                        </Tooltip>
                    </IconButton>
                    <IconButton className='source-button'
                        onClick={() => { copy(sourceText) }}
                    >
                        <Tooltip title="复制">
                            <ContentCopyRoundedIcon />
                        </Tooltip>
                    </IconButton>
                    <IconButton className='source-button'
                        onClick={() => {
                            // /s匹配空格和换行符 /g表示全局匹配
                            setSourceText(sourceText.replace(/\s+/g, ' '));
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
                    onClick={reTranslate}
                    startIcon={<TranslateRoundedIcon />}
                >
                    翻译
                </MuiButton>
            </Box>
        </Card>
    )
}
