import { TextField, Button, InputAdornment } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useAtom } from 'jotai';
import { shortcutTranslateAtom, shortcutPersistentAtom, shortcutOcrAtom } from '../..';
import ConfigItem from '../../components/ConfigItem';
import ConfigList from '../../components/ConfigList';
import { set } from '../../../../global/config';

export default function ShortCutConfig() {
    const [shortcutTranslate, setShortcutTranslate] = useAtom(shortcutTranslateAtom);
    const [shortcutPersistent, setShortcutPersistent] = useAtom(shortcutPersistentAtom);
    const [shortcutOcr, setShortcutOcr] = useAtom(shortcutOcrAtom);
    const [isMacos, setIsMacos] = useState(false);
    const [isWayland, setIsWayland] = useState(false);

    const supportKey = ['Control', 'Shift', 'Alt', 'Meta'];

    useEffect(() => {
        invoke('is_macos').then((v) => {
            setIsMacos(v);
        });
        invoke('is_wayland').then((v) => {
            setIsWayland(v);
        });
    });

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
                if (e.key == 'Meta' && !isMacos) {
                    if (isMacos) {
                        e.key = 'Command';
                    } else {
                        e.key = 'Super';
                    }
                }
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
            } else if (e.key.startsWith('F') && !isMacos) {
                setKey(e.key);
            } else {
                if (e.keyCode == 8) {
                    setKey('');
                }
            }
        }
    }

    return (
        <ConfigList label='翻译快捷键'>
            <ConfigItem
                label='划词翻译'
                help={isWayland && 'Wayland无法使用应用内快捷键，请通过系统快捷键设置，详细见官网文档'}
            >
                <TextField
                    disabled={isWayland}
                    size='small'
                    sx={{ width: '300px' }}
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
                                    size='small'
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
            <ConfigItem
                label='独立翻译窗口'
                help={isWayland && 'Wayland无法使用应用内快捷键，请通过系统快捷键设置，详细见官网文档'}
            >
                <TextField
                    size='small'
                    disabled={isWayland}
                    sx={{ width: '300px' }}
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
                                    size='small'
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
            <p>
                想要更流畅的翻译体验，请查阅
                <a
                    href='https://pot.pylogmon.com/docs/tutorial/config/plugin_config'
                    target='_blank'
                >
                    插件调用
                </a>
                文档
            </p>

            <img
                src='plugin.gif'
                style={{ width: '100%' }}
            ></img>
        </ConfigList>
    );
}
