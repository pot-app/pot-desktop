import React, { useState } from 'react'
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import { Card, Select, MenuItem } from '@mui/material';
import language from '../../../../global/language'
import { get } from '../../../../global/config'
import PubSub from 'pubsub-js'
import { nanoid } from 'nanoid'
import './style.css'

export default function LanguageSelector() {
    const [sourceLanguage, setSourceLanguage] = useState('auto');
    const [targetLanguage, setTargetLanguage] = useState(get('target_language', 'zh-cn'));

    return (
        <Card className="language-selector-area">
            <Select
                sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 } }}
                className='language-selector'
                value={sourceLanguage}
                onChange={(e) => {
                    setSourceLanguage(e.target.value);
                    PubSub.publish('SourceLanguage', e.target.value);
                }}
            >
                <MenuItem value={'auto'}>自动检测</MenuItem>
                {language.map(x => {
                    return <MenuItem value={x.value} key={nanoid()}>{x.label}</MenuItem>
                })}
            </Select>
            <KeyboardDoubleArrowRightRoundedIcon fontSize='large' className='arrow-icon' />
            <Select
                sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 } }}
                className='language-selector'
                value={targetLanguage}
                onChange={(e) => {
                    setTargetLanguage(e.target.value);
                    PubSub.publish('TargetLanguage', e.target.value);
                }}
            >
                {language.map(x => {
                    return <MenuItem value={x.value} key={nanoid()}>{x.label}</MenuItem>
                })}
            </Select>
        </Card>
    )
}
