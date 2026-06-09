import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardBody, Input } from '@nextui-org/react';
import { invoke } from '@tauri-apps/api';
import React, { useRef } from 'react';

import { useConfig } from '../../../../hooks/useConfig';
import { useToastStyle } from '../../../../hooks';
import { osType } from '../../../../utils/env';

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

function keyboardShortcut(e) {
    if (e.keyCode === 8) {
        return '';
    }

    const keys = [];
    e.ctrlKey && keys.push('Ctrl');
    e.shiftKey && keys.push('Shift');
    e.metaKey && keys.push(osType === 'Darwin' ? 'Command' : 'Super');
    e.altKey && keys.push('Alt');

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
        // Keep function-key names unchanged.
    } else {
        code = keyMap[code] ?? '';
    }

    code && keys.push(code);
    return keys.join('+');
}

function HotkeyInput({ name, label, value, setValue }) {
    const { t } = useTranslation();
    const toastStyle = useToastStyle();
    const previousValue = useRef('');
    const editing = useRef(false);
    const unregisterPromise = useRef(Promise.resolve());

    async function restorePrevious() {
        await unregisterPromise.current;
        if (previousValue.current) {
            try {
                await invoke('register_shortcut_by_frontend', {
                    name,
                    shortcut: previousValue.current,
                });
            } catch (error) {
                toast.error(String(error), { style: toastStyle });
            }
        }
        setValue(previousValue.current);
        editing.current = false;
    }

    function beginEditing() {
        if (editing.current) {
            return;
        }
        editing.current = true;
        previousValue.current = value;
        unregisterPromise.current = invoke('unregister_shortcut', { shortcut: value }).catch((error) => {
            toast.error(String(error), { style: toastStyle });
        });
        setValue('');
    }

    async function registerShortcut() {
        try {
            await unregisterPromise.current;
            if (await invoke('is_shortcut_registered', { shortcut: value })) {
                toast.error(t('config.hotkey.is_register'), { style: toastStyle });
                await restorePrevious();
                return;
            }
            await invoke('register_shortcut_by_frontend', { name, shortcut: value });
            setValue(value, true);
            previousValue.current = value;
            editing.current = false;
            toast.success(t('config.hotkey.success'), { style: toastStyle });
        } catch (error) {
            toast.error(String(error), { style: toastStyle });
            await restorePrevious();
        }
    }

    return (
        <div className='config-item'>
            <h3 className='my-auto'>{label}</h3>
            {value !== null && (
                <Input
                    type='hotkey'
                    variant='bordered'
                    value={value}
                    label={t('config.hotkey.set_hotkey')}
                    className='max-w-[50%]'
                    onKeyDown={(e) => {
                        e.preventDefault();
                        setValue(keyboardShortcut(e));
                    }}
                    onMouseDown={(e) => {
                        if (osType !== 'Windows_NT' || ![3, 4].includes(e.button)) {
                            return;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        beginEditing();
                        setValue(e.button === 3 ? 'Mouse4' : 'Mouse5');
                    }}
                    onMouseUp={(e) => {
                        if ([3, 4].includes(e.button)) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }}
                    onAuxClick={(e) => {
                        if ([3, 4].includes(e.button)) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }}
                    onFocus={beginEditing}
                    onBlur={() => {
                        if (editing.current) {
                            restorePrevious().catch((error) => {
                                toast.error(String(error), { style: toastStyle });
                            });
                        }
                    }}
                    endContent={
                        <Button
                            size='sm'
                            variant='flat'
                            onMouseDown={(e) => e.preventDefault()}
                            onPress={registerShortcut}
                        >
                            {t('common.ok')}
                        </Button>
                    }
                />
            )}
        </div>
    );
}

export default function Hotkey() {
    const [selectionTranslate, setSelectionTranslate] = useConfig('hotkey_selection_translate', '', { sync: false });
    const [inputTranslate, setInputTranslate] = useConfig('hotkey_input_translate', '', { sync: false });
    const [ocrRecognize, setOcrRecognize] = useConfig('hotkey_ocr_recognize', '', { sync: false });
    const [ocrTranslate, setOcrTranslate] = useConfig('hotkey_ocr_translate', '', { sync: false });
    const { t } = useTranslation();

    return (
        <Card>
            <Toaster />
            <CardBody>
                <HotkeyInput
                    name='hotkey_selection_translate'
                    label={t('config.hotkey.selection_translate')}
                    value={selectionTranslate}
                    setValue={setSelectionTranslate}
                />
                <HotkeyInput
                    name='hotkey_input_translate'
                    label={t('config.hotkey.input_translate')}
                    value={inputTranslate}
                    setValue={setInputTranslate}
                />
                <HotkeyInput
                    name='hotkey_ocr_recognize'
                    label={t('config.hotkey.ocr_recognize')}
                    value={ocrRecognize}
                    setValue={setOcrRecognize}
                />
                <HotkeyInput
                    name='hotkey_ocr_translate'
                    label={t('config.hotkey.ocr_translate')}
                    value={ocrTranslate}
                    setValue={setOcrTranslate}
                />
            </CardBody>
        </Card>
    );
}
