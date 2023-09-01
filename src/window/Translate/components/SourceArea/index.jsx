import { Button, Card, CardBody, CardFooter, ButtonGroup, Chip } from '@nextui-org/react';
import { readText, writeText } from '@tauri-apps/api/clipboard';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import { appWindow } from '@tauri-apps/api/window';
import React, { useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { MdContentCopy } from 'react-icons/md';
import { MdSmartButton } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { HiTranslate } from 'react-icons/hi';
import { invoke } from '@tauri-apps/api';
import { atom, useAtom } from 'jotai';

import { local_detect, google_detect, baidu_detect } from '../../../../services/translate/utils/lang_detect';
import * as recognizeServices from '../../../../services/recognize';
import { useConfig, useSyncAtom } from '../../../../hooks';

export const sourceTextAtom = atom('');
export const detectLanguageAtom = atom('');

let unlisten = null;
let timer = null;

export default function SourceArea() {
    const [sourceText, setSourceText] = useSyncAtom(sourceTextAtom);
    const [detectLanguage, setDetectLanguage] = useAtom(detectLanguageAtom);
    const [incrementalTranslate] = useConfig('incremental_translate', false);
    const [dynamicTranslate] = useConfig('dynamic_translate', false);
    const [deleteNewline] = useConfig('translate_delete_newline', false);
    const [recognizeLanguage] = useConfig('recognize_language', 'auto');
    const [recognizeServiceList] = useConfig('recognize_service_list', ['system', 'tesseract', 'paddle']);
    const [langDetectEngine] = useConfig('translate_detect_engine', 'local');

    const { t } = useTranslation();
    const textAreaRef = useRef();

    const handleNewText = async (text) => {
        setDetectLanguage('');
        if (text === '') {
            text = (await readText()) ?? '';
        }
        if (text === '[INPUT_TRANSLATE]') {
            setSourceText('', true);
        } else if (text === '[IMAGE_TRANSLATE]') {
            setSourceText('Recognizing...');
            if (recognizeLanguage in recognizeServices[recognizeServiceList[0]].Language) {
                const base64 = await invoke('get_base64');
                recognizeServices[recognizeServiceList[0]]
                    .recognize(base64, recognizeServices[recognizeServiceList[0]].Language[recognizeLanguage])
                    .then(
                        (v) => {
                            setSourceText(v);
                            detect_language(v).then(() => {
                                if (incrementalTranslate) {
                                    setSourceText((old) => {
                                        return old + ' ' + v;
                                    }, true);
                                } else {
                                    setSourceText(v, true);
                                }
                            });
                        },
                        (e) => {
                            setSourceText(e.toString());
                        }
                    );
            } else {
                setSourceText('Language not supported');
            }
        } else {
            let newText = text;
            if (deleteNewline) {
                newText = text.replace(/\s+/g, ' ');
            } else {
                newText = text;
            }
            setSourceText(newText);
            detect_language(newText).then(() => {
                if (incrementalTranslate) {
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
    }, []);

    useEffect(() => {
        if (
            deleteNewline !== null &&
            incrementalTranslate !== null &&
            recognizeLanguage !== null &&
            recognizeServiceList !== null
        ) {
            invoke('get_text').then((v) => {
                handleNewText(v);
            });
        }
    }, [deleteNewline, incrementalTranslate, recognizeLanguage, recognizeServiceList]);

    useEffect(() => {
        textAreaRef.current.style.height = '50px';
        textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }, [sourceText]);

    const detect_language = async (text) => {
        switch (langDetectEngine) {
            case 'baidu':
                setDetectLanguage(await baidu_detect(text));
                break;
            case 'google':
                setDetectLanguage(await google_detect(text));
                break;
            case 'local':
                setDetectLanguage(await local_detect(text));
                break;
            default:
                setDetectLanguage(await local_detect(text));
        }
    };

    return (
        <Card
            shadow='none'
            className='bg-content1 rounded-[10px] mt-[1px] pb-0'
        >
            <CardBody className='bg-content1 p-[12px] pb-0 max-h-[40vh] overflow-y-auto'>
                <textarea
                    autoFocus
                    ref={textAreaRef}
                    className='bg-content1 h-full resize-none focus:outline-none'
                    value={sourceText}
                    onKeyDown={keyDown}
                    onChange={(e) => {
                        const v = e.target.value;
                        setDetectLanguage('');
                        setSourceText(v);
                        if (dynamicTranslate) {
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
