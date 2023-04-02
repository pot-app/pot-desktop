import React, { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { TextField } from '@mui/material';
import ConfigItem from '../ConfigItem';
import ConfigList from '../ConfigList';
import { get } from '../../main';

export const shortcutTranslateAtom = atom('');
export const shortcutPersistentAtom = atom('');

export default function ShortCutConfig() {
    const [shortcutTranslate, setShortcutTranslate] = useAtom(shortcutTranslateAtom);
    const [shortcutPersistent, setShortcutPersistent] = useAtom(shortcutPersistentAtom);
    const supportKey = ["Control", 'Shift', 'Alt', 'Command', 'Meta', 'Option'];
    useEffect(() => {
        setShortcutTranslate(get('shortcut_translate') ?? '');
        setShortcutPersistent(get('shortcut_persistent') ?? '')
    }, []);

    function keyDown(e, value, set) {
        if (e.key.length == 1 || supportKey.includes(e.key)) {
            if (value) {
                set(value + '+' + e.key);
            } else {
                if (e.key.length != 1) {
                    set(e.key);
                }
            }
        }
        if (e.keyCode == 8) {
            set('');
        }
    }

    return (
        <ConfigList label="⌨快捷键⌨">
            <ConfigItem label="划词翻译">
                <TextField
                    fullWidth
                    value={shortcutTranslate}
                    placeholder='eg: CommandOrControl+D'
                    onKeyDown={(e) => { keyDown(e, shortcutTranslate, setShortcutTranslate) }}
                    onFocus={() => { setShortcutTranslate('') }}
                />
            </ConfigItem>
            <ConfigItem label="独立翻译窗口">
                <TextField
                    fullWidth
                    placeholder='eg: CommandOrControl+Shift+D'
                    value={shortcutPersistent}
                    onKeyDown={(e) => { keyDown(e, shortcutPersistent, setShortcutPersistent) }}
                    onFocus={() => { setShortcutPersistent('') }}
                />
            </ConfigItem>
        </ConfigList>
    )
}
