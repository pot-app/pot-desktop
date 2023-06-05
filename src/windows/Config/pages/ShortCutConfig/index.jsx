import { TextField, Button, InputAdornment } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { shortcutTranslateAtom, shortcutPersistentAtom, shortcutScreenshotAtom } from '../..';
import ConfigItem from '../../components/ConfigItem';
import ConfigList from '../../components/ConfigList';
import { set } from '../../../../global/config';

const keyMap = {
    Backquote: '`',
    Backslash: '\\',
    BracketLeft: '[',
    BracketRight: ']',
    Comma: ',',
    Equal: '=',
    Minus: '-',
    Plus: 'PLUS',
    Period: '.',
    Quote: "'",
    Semicolon: ';',
    Slash: '/',
    Backspace: 'Backspace',
    CapsLock: 'Capslock',
    ContextMenu: 'Contextmenu',
    Space: 'Space',
    Tab: 'Tab',
    Convert: 'Convert',
    Delete: 'Delete',
    End: 'End',
    Help: 'Help',
    Home: 'Home',
    PageDown: 'Pagedown',
    PageUp: 'Pageup',
    Escape: 'Esc',
    PrintScreen: 'Printscreen',
    ScrollLock: 'Scrolllock',
    Pause: 'Pause',
    Insert: 'Insert',
    Suspend: 'Suspend',
};

export default function ShortCutConfig() {
    const [shortcutTranslate, setShortcutTranslate] = useAtom(shortcutTranslateAtom);
    const [shortcutPersistent, setShortcutPersistent] = useAtom(shortcutPersistentAtom);
    const [shortcutScreenshot, setShortcutScreenshot] = useAtom(shortcutScreenshotAtom);
    const [isMacos, setIsMacos] = useState(false);
    const [isWayland, setIsWayland] = useState(false);

    const { t } = useTranslation();

    useEffect(() => {
        invoke('is_macos').then((v) => {
            setIsMacos(v);
        });
        invoke('is_wayland').then((v) => {
            setIsWayland(v);
        });
    });

    function keyDown(e, setKey) {
        if (e.keyCode === 8) {
            setKey('');
        } else {
            let newValue = '';
            if (e.ctrlKey) {
                newValue = 'Ctrl';
            }
            if (e.shiftKey) {
                newValue = `${newValue}${newValue.length > 0 ? '+' : ''}Shift`;
            }
            if (e.metaKey) {
                newValue = `${newValue}${newValue.length > 0 ? '+' : ''}${isMacos ? 'Command' : 'Super'}`;
            }
            if (e.altKey) {
                newValue = `${newValue}${newValue.length > 0 ? '+' : ''}Alt`;
            }
            let code = e.code;
            if (code.startsWith('Key')) {
                code = code.substring(3);
            } else if (code.startsWith('Digit')) {
                code = code.substring(5);
            } else if (code.startsWith('Numpad')) {
                code = 'Num' + code.substring(6);
            } else if (code.startsWith('Arrow')) {
                code = code.substring(5);
            } else if (code.startsWith('Intl')) {
                code = code.substring(4);
            } else if (/F\d+/.test(code)) {
                // F1-F12 不处理
            } else if (keyMap[code] !== undefined) {
                code = keyMap[code];
            } else {
                code = '';
            }
            setKey(`${newValue}${newValue.length > 0 && code.length > 0 ? '+' : ''}${code}`);
        }
    }

    return (
        <ConfigList label={t('config.shortcut.title')}>
            <ConfigItem
                label={t('config.shortcut.translate')}
                help={isWayland && t('config.shortcut.wayland')}
            >
                <TextField
                    disabled={isWayland}
                    size='small'
                    sx={{ width: '300px' }}
                    value={shortcutTranslate}
                    onKeyDown={(e) => {
                        keyDown(e, setShortcutTranslate);
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
                                    onClick={async () => {
                                        await set('shortcut_translate', shortcutTranslate);
                                    }}
                                >
                                    {t('common.ok')}
                                </Button>
                            </InputAdornment>
                        ),
                    }}
                />
            </ConfigItem>
            <ConfigItem
                label={t('config.shortcut.persistent')}
                help={isWayland && t('config.shortcut.wayland')}
            >
                <TextField
                    size='small'
                    disabled={isWayland}
                    sx={{ width: '300px' }}
                    value={shortcutPersistent}
                    onKeyDown={(e) => {
                        keyDown(e, setShortcutPersistent);
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
                                    onClick={async () => {
                                        await set('shortcut_persistent', shortcutPersistent);
                                    }}
                                >
                                    {t('common.ok')}
                                </Button>
                            </InputAdornment>
                        ),
                    }}
                />
            </ConfigItem>
            <ConfigItem
                label={t('config.shortcut.screenshot')}
                help={isWayland && t('config.shortcut.wayland')}
            >
                <TextField
                    size='small'
                    disabled={isWayland}
                    sx={{ width: '300px' }}
                    value={shortcutScreenshot}
                    onKeyDown={(e) => {
                        keyDown(e, setShortcutScreenshot);
                    }}
                    onFocus={() => {
                        setShortcutScreenshot('');
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position='end'>
                                <Button
                                    size='small'
                                    variant='outlined'
                                    onClick={async () => {
                                        await set('shortcut_screenshot', shortcutScreenshot);
                                    }}
                                >
                                    {t('common.ok')}
                                </Button>
                            </InputAdornment>
                        ),
                    }}
                />
            </ConfigItem>
            <p>
                {t('config.shortcut.pluginmsg')}
                <a
                    href='https://pot.pylogmon.com/docs/tutorial/config/plugin_config'
                    target='_blank'
                >
                    {t('config.shortcut.plugin')}
                </a>
            </p>

            <img
                src='plugin.gif'
                style={{ width: '100%' }}
                alt='plugin example'
            ></img>
        </ConfigList>
    );
}
