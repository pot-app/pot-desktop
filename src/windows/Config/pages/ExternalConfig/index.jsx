import { TextField, FormControlLabel, Checkbox, Switch } from '@mui/material';
import 'flag-icons/css/flag-icons.min.css';
import { useAtom } from 'jotai';
import React from 'react';
import { ankiEnableAtom, eudicEnableAtom, eudicCategoryNameAtom, eudicTokenAtom } from '../..';
import ConfigList from '../../components/ConfigList';
import ConfigItem from '../../components/ConfigItem';
import { set } from '../../../../global/config';

export default function ExternalConfig() {
    const [ankiEnable, setAnkiEnable] = useAtom(ankiEnableAtom);
    const [eudicEnable, setEudicEnable] = useAtom(eudicEnableAtom);
    const [eudicCategoryName, setEudicCategoryName] = useAtom(eudicCategoryNameAtom);
    const [eudicToken, setEudicToken] = useAtom(eudicTokenAtom);

    return (
        <ConfigList label='生词本'>
            <ConfigItem label='启用Anki支持'>
                <Switch
                    checked={ankiEnable}
                    onChange={async (e) => {
                        setAnkiEnable(e.target.checked);
                        await set('anki_enable', e.target.checked);
                    }}
                />
            </ConfigItem>
            <ConfigItem label='启用欧路词典生词本'>
                <Switch
                    checked={eudicEnable}
                    onChange={async (e) => {
                        setEudicEnable(e.target.checked);
                        await set('eudic_enable', e.target.checked);
                    }}
                />
            </ConfigItem>
            <ConfigItem label='欧路词典生词本名称'>
                <TextField
                    size='small'
                    sx={{ width: '300px' }}
                    value={eudicCategoryName}
                    placeholder='pot'
                    onChange={async (e) => {
                        setEudicCategoryName(e.target.value);
                        await set('eudic_category_name', e.target.value);
                    }}
                />
            </ConfigItem>
            <ConfigItem label='欧路词典Token'>
                <TextField
                    size='small'
                    sx={{ width: '300px' }}
                    placeholder='请前往pot官网查看获取Token教程'
                    value={eudicToken}
                    onChange={async (e) => {
                        setEudicToken(e.target.value);
                        await set('eudic_token', e.target.value);
                    }}
                />
            </ConfigItem>
        </ConfigList>
    );
}
