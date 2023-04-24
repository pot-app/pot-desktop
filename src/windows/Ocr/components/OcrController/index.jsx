import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import { Select, Button, MenuItem } from '@mui/material';
import "flag-icons/css/flag-icons.min.css";
import { nanoid } from 'nanoid';
import React from 'react'
import language from '../../../../global/language'


export default function OcrController() {
    return (
        <>
            <Select defaultValue='default' sx={{ width: 160 }}>
                <MenuItem value='default'>默认引擎</MenuItem>
            </Select>
            <Select defaultValue='auto' sx={{ width: 160 }}>
                <MenuItem value={'auto'}>🌏 自动检测</MenuItem>
                {language.map(x => {
                    return <MenuItem value={x.value} key={nanoid()}>
                        <span className={`fi fi-${x.code}`} /><span>{x.label}</span>
                    </MenuItem>
                })}
            </Select>
            <Button variant='outlined' sx={{ width: 160 }} startIcon={<SyncRoundedIcon />}>重新识别</Button>
            <Button variant='contained' sx={{ width: 160 }} startIcon={<TranslateRoundedIcon />}>翻译</Button>
        </>
    )
}
