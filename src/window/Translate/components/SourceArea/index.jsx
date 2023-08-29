import { Button, Card, CardBody, CardFooter, Textarea, ButtonGroup, Chip } from '@nextui-org/react';
import { readText, writeText } from '@tauri-apps/api/clipboard';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import { appWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { MdContentCopy } from 'react-icons/md';
import { MdSmartButton } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { HiTranslate } from 'react-icons/hi';
import React, { useEffect } from 'react';
import { invoke } from '@tauri-apps/api';
import { atom, useAtom } from 'jotai';

import { local_detect, google_detect, baidu_detect } from '../../../../services/translate/utils/lang_detect';
import { useConfig, useSyncAtom } from '../../../../hooks';
import { store } from '../../../../utils/store';

export const sourceTextAtom = atom('');
export const detectLanguageAtom = atom('');

let unlisten = null;
let timer = null;

export default function SourceArea() {
    const [sourceText, setSourceText] = useSyncAtom(sourceTextAtom);
    const [detectLanguage, setDetectLanguage] = useAtom(detectLanguageAtom);
    const [, , getIncrementalTranslate] = useConfig('incremental_translate');
    const [, , getDynamicTranslate] = useConfig('dynamic_translate');

    const { t } = useTranslation();

    const handleNewText = async (text) => {
        setDetectLanguage('');
        if (text === '') {
            text = (await readText()) ?? '';
        }
        if (text === '[INPUT_TRANSLATE]') {
            setSourceText('', true);
        } else if (text === '[IMAGE_TRANSLATE]') {
            // image translate
        } else {
            let newText = text;
            const deleteNewline = await store.get('translate_delete_newline');
            if (deleteNewline) {
                newText = text.replace(/\s+/g, ' ');
            } else {
                newText = text;
            }
            setSourceText(newText);
            detect_language(newText).then(() => {
                if (getIncrementalTranslate()) {
                    setSourceText((old) => {
                        return old + ' ' + newText;
                    }, true);
                } else {
                    setSourceText(newText, true);
                }
            });
        }
    };

    const keyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            detect_language(sourceText).then(() => {
                setSourceText(event.target.value, true);
            });
        }
        if (event.key === 'Escape') {
            appWindow.close();
        }
    };

    useEffect(() => {
        if (appWindow.label === 'translate') {
            appWindow.show();
            appWindow.setFocus();
        }
        if (unlisten) {
            unlisten.then((f) => {
                f();
            });
        }
        unlisten = listen('new_text', (event) => {
            appWindow.setFocus();
            handleNewText(event.payload);
        });
        invoke('get_text').then((v) => {
            handleNewText(v);
        });
    }, []);

    const detect_language = async (text) => {
        const engine = await store.get('translate_detect_engine');
        if (engine === 'baidu') {
            setDetectLanguage(await baidu_detect(text));
        } else if (engine === 'google') {
            setDetectLanguage(await google_detect(text));
        } else {
            setDetectLanguage(await local_detect(text));
        }
    };

    return (
        <Card className='bg-content1 rounded-[10px] mt-[1px] pb-0'>
            <CardBody className='bg-content1 p-0'>
                <Textarea
                    autoFocus
                    variant='bordered'
                    minRows={1}
                    value={sourceText}
                    classNames={{
                        inputWrapper: 'border-0',
                        label: 'hidden',
                    }}
                    onKeyDown={keyDown}
                    onValueChange={(v) => {
                        setDetectLanguage('');
                        setSourceText(v);
                        if (getDynamicTranslate()) {
                            if (timer) {
                                clearTimeout(timer);
                            }
                            timer = setTimeout(() => {
                                detect_language(v).then(() => {
                                    setSourceText(v, true);
                                });
                            }, 1000);
                        }
                    }}
                />
            </CardBody>

            <CardFooter className='bg-content1 rounded-none rounded-b-[10px] flex justify-between px-[12px] p-[5px]'>
                <ButtonGroup>
                    <Button
                        isIconOnly
                        variant='light'
                        size='sm'
                    >
                        <HiOutlineVolumeUp className='text-[16px]' />
                    </Button>
                    <Button
                        isIconOnly
                        variant='light'
                        size='sm'
                        onPress={() => {
                            writeText(sourceText);
                        }}
                    >
                        <MdContentCopy className='text-[16px]' />
                    </Button>
                    <Button
                        isIconOnly
                        variant='light'
                        size='sm'
                        onPress={() => {
                            const newText = sourceText.replace(/\s+/g, ' ');
                            detect_language(newText).then(() => {
                                setSourceText(newText, true);
                            });
                        }}
                    >
                        <MdSmartButton className='text-[16px]' />
                    </Button>
                    {detectLanguage !== '' && (
                        <Button
                            variant='flat'
                            size='sm'
                            className='bg-transparent'
                        >
                            <Chip
                                size='sm'
                                color='secondary'
                                variant='dot'
                                className='my-auto'
                            >
                                {t(`languages.${detectLanguage}`)}
                            </Chip>
                        </Button>
                    )}
                </ButtonGroup>
                <Button
                    size='sm'
                    color='primary'
                    variant='solid'
                    className='text-[14px] font-bold'
                    startContent={<HiTranslate className='text-[16px]' />}
                    onPress={() => {
                        detect_language(sourceText).then(() => {
                            setSourceText(sourceText, true);
                        });
                    }}
                >
                    {t('translate.translate')}
                </Button>
            </CardFooter>
        </Card>
    );
}
