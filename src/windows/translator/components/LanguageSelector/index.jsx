import React, { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import { Card, Select, MenuItem } from '@mui/material';
import "/node_modules/flag-icons/css/flag-icons.min.css";
import language from '../../../../global/language'
import { nanoid } from 'nanoid';
import { get } from '../../main';
import './style.css';

export const sourceLanguageAtom = atom('auto');
export const targetLanguageAtom = atom('zh-cn');

export default function LanguageSelector() {
    const [sourceLanguage, setSourceLanguage] = useAtom(sourceLanguageAtom);
    const [targetLanguage, setTargetLanguage] = useAtom(targetLanguageAtom);

    useEffect(() => {
        setTargetLanguage(get('target_language') || 'zh-cn');
    }, [])

    return (
        <Card className="language-selector-area">
            <Select
                sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 } }}
                className='language-selector'
                value={sourceLanguage}
                onChange={(e) => {
                    setSourceLanguage(e.target.value);
                }}
            >
                <MenuItem value={'auto'}>🌏 自动检测</MenuItem>
                {language.map(x => {
                    return <MenuItem value={x.value} key={nanoid()}>
                        <span className={`fi fi-${x.code}`} /><span>{x.label}</span>
                    </MenuItem>
                })}
            </Select>
            <KeyboardDoubleArrowRightRoundedIcon fontSize='large' className='arrow-icon' />
            <Select
                sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 } }}
                className='language-selector'
                value={targetLanguage}
                onChange={(e) => {
                    setTargetLanguage(e.target.value);
                }}
            >
                {language.map(x => {
                    return <MenuItem value={x.value} key={nanoid()}>
                        <span className={`fi fi-${x.code}`} /><span>{x.label}</span>
                    </MenuItem>
                })}
            </Select>
        </Card>
    )
}
