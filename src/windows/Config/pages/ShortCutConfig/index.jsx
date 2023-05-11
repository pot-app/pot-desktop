import { TextField, Button, InputAdornment } from '@mui/material';
import { useAtom } from 'jotai';
import React from 'react';
import { shortcutTranslateAtom, shortcutPersistentAtom, shortcutOcrAtom } from '../..';
import ConfigItem from '../../components/ConfigItem';
import ConfigList from '../../components/ConfigList';
import { set } from '../../../../global/config';

export default function ShortCutConfig() {
    const [shortcutTranslate, setShortcutTranslate] = useAtom(shortcutTranslateAtom);
    const [shortcutPersistent, setShortcutPersistent] = useAtom(shortcutPersistentAtom);
    const [shortcutOcr, setShortcutOcr] = useAtom(shortcutOcrAtom);

    const supportKey = ['Control', 'Shift', 'Alt', 'Command', 'Meta', 'Option'];

    function keyDown(e, value, setKey) {
        if (e.key.length == 1) {
            if (value) {
                let values = value.toUpperCase().split('+');
                let key = e.key.toUpperCase();
                if (!value.startsWith('F') && !values.includes(key)) {
                    setKey(value + '+' + key);
                }
            }
        } else {
            if (supportKey.includes(e.key)) {
                if (value) {
                    let values = value.split('+');
                    if (!value.startsWith('F') && !values.includes(e.key)) {
                        setKey(value + '+' + e.key);
                    } else {
                        setKey(e.key);
                    }
                } else {
                    setKey(e.key);
                }
            } else if (e.key.startsWith('F')) {
                setKey(e.key);
            } else {
                if (e.keyCode == 8) {
                    setKey('');
                }
            }
        }
    }

    return (
        <ConfigList label='快捷键'>
            <ConfigItem label='划词翻译'>
                <TextField
                    fullWidth
                    value={shortcutTranslate}
                    placeholder='可直接按下组合键设置，也可逐个按下按键设置'
                    onKeyDown={(e) => {
                        keyDown(e, shortcutTranslate, setShortcutTranslate);
                    }}
                    onFocus={() => {
                        setShortcutTranslate('');
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position='end'>
                                <Button
                                    variant='outlined'
                                    onClick={() => {
                                        set('shortcut_translate', shortcutTranslate);
                                    }}
                                >
                                    确认
                                </Button>
                            </InputAdornment>
                        ),
                    }}
                />
            </ConfigItem>
            <ConfigItem label='独立翻译窗口'>
                <TextField
                    fullWidth
                    placeholder='可直接按下组合键设置，也可逐个按下按键设置'
                    value={shortcutPersistent}
                    onKeyDown={(e) => {
                        keyDown(e, shortcutPersistent, setShortcutPersistent);
                    }}
                    onFocus={() => {
                        setShortcutPersistent('');
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position='end'>
                                <Button
                                    variant='outlined'
                                    onClick={() => {
                                        set('shortcut_persistent', shortcutPersistent);
                                    }}
                                >
                                    确认
                                </Button>
                            </InputAdornment>
                        ),
                    }}
                />
            </ConfigItem>
            {/* <ConfigItem label="OCR">
                <TextField
                    fullWidth
                    placeholder='可直接按下组合键设置，也可逐个按下按键设置'
                    value={shortcutOcr}
                    onKeyDown={(e) => { keyDown(e, shortcutOcr, setShortcutOcr) }}
                    onFocus={() => { setShortcutOcr('') }}
                />
            </ConfigItem> */}
        </ConfigList>
    );
}
