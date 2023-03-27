import React, { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles';
import { Card, Box, InputBase, Select, MenuItem, IconButton } from '@mui/material'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import PulseLoader from "react-spinners/PulseLoader";
import { invoke } from '@tauri-apps/api/tauri';
import PubSub from 'pubsub-js';
import { nanoid } from 'nanoid';
import { writeText } from '@tauri-apps/api/clipboard';
import * as interfaces from '../../../../interfaces';
import { get } from '../../../../global/config';
import './style.css'

export default function TargetArea() {
    const [translateInterface, setTranslateInterface] = useState(get('interface', 'youdao_free'));
    const [loading, setLoading] = useState(false);
    const [sourceText, setSourceText] = useState("");
    const [targetText, setTargetText] = useState("");
    const [sourceLanguage, setSourceLanguage] = useState('auto');
    const [targetLanguage, setTargetLanguage] = useState(get('target_language', 'zh-cn'));
    const theme = useTheme();

    useEffect(() => {
        if (sourceText != "") {
            translate(sourceText, sourceLanguage, targetLanguage);
        }
    }, [sourceText, translateInterface, targetLanguage, sourceLanguage])
    // 订阅源文本改变事件
    PubSub.subscribe('SourceText', (_, v) => {
        setSourceText(v)
    })
    // 订阅源语言改变事件
    PubSub.subscribe('SourceLanguage', (_, v) => {
        setSourceLanguage(v)
    })
    // 订阅目标语言改变事件
    PubSub.subscribe('TargetLanguage', (_, v) => {
        setTargetLanguage(v)
    })
    // 开始翻译的回调
    function translate(text, from, to) {
        setTargetText('');
        setLoading(true);
        let translator = interfaces[translateInterface];
        translator.translate(text, from, to).then(
            v => {
                setTargetText(v);
                setLoading(false);
            },
            e => {
                setTargetText(e);
                setLoading(false);
            }
        )
    }
    // 复制文本的回调
    function copy(who) {
        writeText(who).then(
            _ => { console.log('success') }
        )
    }
    // TTS
    function speak(text, lang) {
        invoke('speak', { text, lang }).then(_ => { });
    }

    return (
        <Card className='targetarea'>
            <Box className='interface-selector-area'>
                <Select
                    sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 } }}
                    className='interface-selector'
                    value={translateInterface}
                    onChange={(e) => { setTranslateInterface(e.target.value) }}
                >
                    {
                        Object.keys(interfaces).map(
                            x => {
                                return <MenuItem value={x} key={nanoid()}>{interfaces[x]['info']['name']}</MenuItem>
                            }
                        )
                    }
                </Select>
                <PulseLoader
                    loading={loading}
                    color={theme.palette.text.primary}
                    size={10}
                    cssOverride={{
                        display: 'inline-block',
                        margin: 'auto',
                        marginLeft: '20px'
                    }} />
            </Box>
            <Box className="overflow-textarea">
                <InputBase
                    multiline
                    fullWidth
                    value={targetText}
                    onChange={(e) => { setTargetText(e.target.value) }}
                />
            </Box>
            <Box className='target-buttonarea'>
                <IconButton className='target-button'
                    onClick={() => { speak(targetText, targetLanguage) }}
                >
                    <GraphicEqRoundedIcon />
                </IconButton>
                <IconButton className='target-button'
                    onClick={() => { copy(targetText) }}
                >
                    <ContentCopyRoundedIcon />
                </IconButton>
            </Box>
        </Card>
    )
}
