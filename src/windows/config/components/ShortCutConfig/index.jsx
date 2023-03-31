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

    useEffect(() => {
        setShortcutTranslate(get('shortcut_translate') || '');
        setShortcutPersistent(get('shortcut_persistent') || '')
    }, []);

    return (
        <ConfigList label="⌨快捷键⌨">
            <ConfigItem label="划词翻译">
                <TextField
                    fullWidth
                    value={shortcutTranslate}
                    placeholder='eg: CommandOrControl+D'
                    onChange={(e) => { setShortcutTranslate(e.target.value) }}
                />
            </ConfigItem>
            <ConfigItem label="独立翻译窗口">
                <TextField
                    fullWidth
                    placeholder='eg: CommandOrControl+Shift+D'
                    value={shortcutPersistent}
                    onChange={(e) => { setShortcutPersistent(e.target.value) }}
                />
            </ConfigItem>
        </ConfigList>
    )
}
