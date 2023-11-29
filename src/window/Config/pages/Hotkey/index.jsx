import { unregister, isRegistered } from '@tauri-apps/api/globalShortcut';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { CardBody } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { Input } from '@nextui-org/react';
import { Card } from '@nextui-org/react';
import React from 'react';

import { useConfig } from '../../../../hooks/useConfig';
import { useToastStyle } from '../../../../hooks';
import { osType } from '../../../../utils/env';
import { invoke } from '@tauri-apps/api';

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

export default function Hotkey() {
    const [selectionTranslate, setSelectionTranslate] = useConfig('hotkey_selection_translate', '');
    const [inputTranslate, setInputTranslate] = useConfig('hotkey_input_translate', '');
    const [ocrRecognize, setOcrRecognize] = useConfig('hotkey_ocr_recognize', '');
    const [ocrTranslate, setOcrTranslate] = useConfig('hotkey_ocr_translate', '');

    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    function keyDown(e, setKey) {
        e.preventDefault();
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
                newValue = `${newValue}${newValue.length > 0 ? '+' : ''}${osType === 'Darwin' ? 'Command' : 'Super'}`;
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
            } else if (keyMap[code] !== undefined) {
                code = keyMap[code];
            } else {
                code = '';
            }
            setKey(`${newValue}${newValue.length > 0 && code.length > 0 ? '+' : ''}${code}`);
        }
    }

    function registerHandler(name, key) {
        isRegistered(key).then((res) => {
            if (res) {
                toast.error(t('config.hotkey.is_register'), { style: toastStyle });
            } else {
                invoke('register_shortcut_by_frontend', {
                    name: name,
                    shortcut: key,
                }).then(
                    () => {
                        toast.success(t('config.hotkey.success'), { style: toastStyle });
                    },
                    (e) => {
                        toast.error(e, { style: toastStyle });
                    }
                );
            }
        });
    }

    return (
        <Card>
            <Toaster />
            <CardBody>
                <div className='config-item'>
                    <h3 className='my-auto'>{t('config.hotkey.selection_translate')}</h3>
                    {selectionTranslate !== null && (
                        <Input
                            type='hotkey'
                            variant='bordered'
                            value={selectionTranslate}
                            label={t('config.hotkey.set_hotkey')}
                            className='max-w-[50%]'
                            onKeyDown={(e) => {
                                keyDown(e, setSelectionTranslate);
                            }}
                            onFocus={() => {
                                unregister(selectionTranslate);
                                setSelectionTranslate('');
                            }}
                            endContent={
                                <Button
                                    size='sm'
                                    variant='flat'
                                    className={`${selectionTranslate === '' && 'hidden'}`}
                                    onPress={() => {
                                        registerHandler('hotkey_selection_translate', selectionTranslate);
                                    }}
                                >
                                    {t('common.ok')}
                                </Button>
                            }
                        />
                    )}
                </div>
                <div className='config-item'>
                    <h3 className='my-auto'>{t('config.hotkey.input_translate')}</h3>
                    {inputTranslate !== null && (
                        <Input
                            type='hotkey'
                            variant='bordered'
                            value={inputTranslate}
                            label={t('config.hotkey.set_hotkey')}
                            className='max-w-[50%]'
                            onKeyDown={(e) => {
                                keyDown(e, setInputTranslate);
                            }}
                            onFocus={() => {
                                unregister(inputTranslate);
                                setInputTranslate('');
                            }}
                            endContent={
                                <Button
                                    size='sm'
                                    variant='flat'
                                    className={`${inputTranslate === '' && 'hidden'}`}
                                    onPress={() => {
                                        registerHandler('hotkey_input_translate', inputTranslate);
                                    }}
                                >
                                    {t('common.ok')}
                                </Button>
                            }
                        />
                    )}
                </div>
                <div className='config-item'>
                    <h3 className='my-auto'>{t('config.hotkey.ocr_recognize')}</h3>
                    {ocrRecognize !== null && (
                        <Input
                            type='hotkey'
                            variant='bordered'
                            value={ocrRecognize}
                            label={t('config.hotkey.set_hotkey')}
                            className='max-w-[50%]'
                            onKeyDown={(e) => {
                                keyDown(e, setOcrRecognize);
                            }}
                            onFocus={() => {
                                unregister(ocrRecognize);
                                setOcrRecognize('');
                            }}
                            endContent={
                                <Button
                                    size='sm'
                                    variant='flat'
                                    className={`${ocrRecognize === '' && 'hidden'}`}
                                    onPress={() => {
                                        registerHandler('hotkey_ocr_recognize', ocrRecognize);
                                    }}
                                >
                                    {t('common.ok')}
                                </Button>
                            }
                        />
                    )}
                </div>
                <div className='config-item'>
                    <h3 className='my-auto'>{t('config.hotkey.ocr_translate')}</h3>
                    {ocrTranslate !== null && (
                        <Input
                            type='hotkey'
                            variant='bordered'
                            value={ocrTranslate}
                            label={t('config.hotkey.set_hotkey')}
                            className='max-w-[50%]'
                            onKeyDown={(e) => {
                                keyDown(e, setOcrTranslate);
                            }}
                            onFocus={() => {
                                unregister(ocrTranslate);
                                setOcrTranslate('');
                            }}
                            endContent={
                                <Button
                                    size='sm'
                                    variant='flat'
                                    className={`${ocrTranslate === '' && 'hidden'}`}
                                    onPress={() => {
                                        registerHandler('hotkey_ocr_translate', ocrTranslate);
                                    }}
                                >
                                    {t('common.ok')}
                                </Button>
                            }
                        />
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
