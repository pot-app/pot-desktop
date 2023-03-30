import React, { useEffect } from 'react';
import { useAtom, atom } from 'jotai';
import { Card, Box, InputBase, IconButton, Button as MuiButton } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import speak from '../../../../global/speakClient';
import { writeText } from '@tauri-apps/api/clipboard';
import { appWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/tauri';
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
                    onKeyDown={(e) => { keyDown(e) }}
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
                        <GraphicEqRoundedIcon />
                    </IconButton>
                    <IconButton className='source-button'
                        onClick={() => { copy(sourceText) }}
                    >
                        <ContentCopyRoundedIcon />
                    </IconButton>
                </Box>
                <MuiButton
                    variant="contained"
                    size='small'
                    onClick={reTranslate}
                >
                    翻译
                </MuiButton>
            </Box>
        </Card>
    )
}
