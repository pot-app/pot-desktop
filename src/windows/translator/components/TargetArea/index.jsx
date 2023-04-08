import React, { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { useTheme } from '@mui/material/styles';
import { Card, Box, InputBase, Select, MenuItem, IconButton, Tooltip } from '@mui/material'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import PulseLoader from "react-spinners/PulseLoader";
import speak from '../../../../global/speakClient';
import { nanoid } from 'nanoid';
import { writeText } from '@tauri-apps/api/clipboard';
import * as interfaces from '../../../../interfaces';
import { sourceLanguageAtom, targetLanguageAtom } from '../LanguageSelector';
import { sourceTextAtom } from '../SourceArea';
import { get } from '../../main';
import './style.css'

export default function TargetArea() {
    const sourceText = useAtomValue(sourceTextAtom);
    const sourceLanguage = useAtomValue(sourceLanguageAtom);
    const targetLanguage = useAtomValue(targetLanguageAtom);

    const [translateInterface, setTranslateInterface] = useState(get('interface') ?? 'deepl');
    const [loading, setLoading] = useState(false);
    const [targetText, setTargetText] = useState("");
    const theme = useTheme();

    useEffect(() => {
        if (sourceText != "") {
            translate(sourceText.trim(), sourceLanguage, targetLanguage);
        }
    }, [sourceText, translateInterface, targetLanguage, sourceLanguage])

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
                                if (get(`${x}_enable`) && true) {
                                    return <MenuItem value={x} key={nanoid()}>
                                        <Box>
                                            <img src={`/${x}.svg`} className='interface-icon' />
                                            <span className='interface-name'>{interfaces[x]['info']['name']}</span>
                                        </Box>
                                    </MenuItem>
                                }
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
                    onClick={() => { speak(targetText) }}
                >
                    <div id="audio"></div>
                    <Tooltip title="朗读">
                        <GraphicEqRoundedIcon />
                    </Tooltip>
                </IconButton>
                <IconButton className='target-button'
                    onClick={() => { copy(targetText) }}
                >
                    <Tooltip title="复制">
                        <ContentCopyRoundedIcon />
                    </Tooltip>
                </IconButton>
            </Box>
        </Card>
    )
}
