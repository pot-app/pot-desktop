import { TextField, FormControlLabel, Checkbox } from '@mui/material';
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
            <ConfigItem>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={ankiEnable}
                            onChange={(e) => {
                                setAnkiEnable(e.target.checked);
                                set('anki_enable', e.target.checked);
                            }}
                        />
                    }
                    label='启用Anki支持'
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={eudicEnable}
                            onChange={(e) => {
                                setEudicEnable(e.target.checked);
                                set('eudic_enable', e.target.checked);
                            }}
                        />
                    }
                    label='启用欧路词典生词本'
                />
            </ConfigItem>
            <ConfigItem label='欧路词典生词本名称'>
                <TextField
                    fullWidth
                    value={eudicCategoryName}
                    placeholder='pot'
                    onChange={(e) => {
                        setEudicCategoryName(e.target.value);
                        set('eudic_category_name', e.target.value);
                    }}
                />
            </ConfigItem>
            <ConfigItem label='欧路词典Token'>
                <TextField
                    fullWidth
                    placeholder='请前往pot官网查看获取Token教程'
                    value={eudicToken}
                    onChange={(e) => {
                        setEudicToken(e.target.value);
                        set('eudic_token', e.target.value);
                    }}
                />
            </ConfigItem>
        </ConfigList>
    );
}
