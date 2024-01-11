import { Button, Card, CardBody, CardFooter, ButtonGroup, Chip, Tooltip } from '@nextui-org/react';
import { BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import React, { useEffect, useRef, useState } from 'react';
import { writeText } from '@tauri-apps/api/clipboard';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import { appWindow } from '@tauri-apps/api/window';
import toast, { Toaster } from 'react-hot-toast';
import { listen } from '@tauri-apps/api/event';
import { MdContentCopy } from 'react-icons/md';
import { MdSmartButton } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { HiTranslate } from 'react-icons/hi';
import { LuDelete } from 'react-icons/lu';
import { invoke } from '@tauri-apps/api';
import { atom, useAtom } from 'jotai';

import { useConfig, useSyncAtom, useVoice, useToastStyle } from '../../../../hooks';
import * as recognizeServices from '../../../../services/recognize';
import * as builtinTtsServices from '../../../../services/tts';
import detect from '../../../../utils/lang_detect';
import { store } from '../../../../utils/store';

export const sourceTextAtom = atom('');
export const detectLanguageAtom = atom('');

let unlisten = null;
let timer = null;

export default function SourceArea(props) {
    const { pluginList } = props;
    const [appFontSize] = useConfig('app_font_size', 16);
    const [sourceText, setSourceText, syncSourceText] = useSyncAtom(sourceTextAtom);
    const [detectLanguage, setDetectLanguage] = useAtom(detectLanguageAtom);
    const [incrementalTranslate] = useConfig('incremental_translate', false);
    const [dynamicTranslate] = useConfig('dynamic_translate', false);
    const [deleteNewline] = useConfig('translate_delete_newline', false);
    const [recognizeLanguage] = useConfig('recognize_language', 'auto');
    const [recognizeServiceList] = useConfig('recognize_service_list', ['system', 'tesseract']);
    const [ttsServiceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [hideWindow] = useConfig('translate_hide_window', false);
    const [ttsPluginInfo, setTtsPluginInfo] = useState();
    const toastStyle = useToastStyle();
    const { t } = useTranslation();
    const textAreaRef = useRef();
    const speak = useVoice();

    const handleNewText = async (text) => {
        text = text.trim();
        if (hideWindow) {
            appWindow.hide();
        } else {
            appWindow.show();
            appWindow.setFocus();
        }
        // 清空检测语言
        setDetectLanguage('');
        if (text === '[INPUT_TRANSLATE]') {
            appWindow.show();
            appWindow.setFocus();
            setSourceText('', true);
        } else if (text === '[IMAGE_TRANSLATE]') {
            const base64 = await invoke('get_base64');
            const serviceName = recognizeServiceList[0];
            if (serviceName.startsWith('[plugin]')) {
                if (recognizeLanguage in pluginList['recognize'][serviceName].language) {
                    const pluginConfig = (await store.get(serviceName)) ?? {};
                    invoke('invoke_plugin', {
                        name: serviceName,
                        pluginType: 'recognize',
                        source: base64,
                        lang: pluginList['recognize'][serviceName].language[recognizeLanguage],
                        needs: pluginConfig,
                    }).then(
                        (v) => {
                            let newText = v.trim();
                            if (deleteNewline) {
                                newText = v.replace(/\-\s+/g, '').replace(/\s+/g, ' ');
                            } else {
                                newText = v.trim();
                            }
                            if (incrementalTranslate) {
                                setSourceText((old) => {
                                    return old + ' ' + newText;
                                });
                            } else {
                                setSourceText(newText);
                            }
                            detect_language(newText).then(() => {
                                syncSourceText();
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
                if (recognizeLanguage in recognizeServices[serviceName].Language) {
                    recognizeServices[serviceName]
                        .recognize(base64, recognizeServices[serviceName].Language[recognizeLanguage])
                        .then(
                            (v) => {
                                let newText = v.trim();
                                if (deleteNewline) {
                                    newText = v.replace(/\-\s+/g, '').replace(/\s+/g, ' ');
                                } else {
                                    newText = v.trim();
                                }
                                if (incrementalTranslate) {
                                    setSourceText((old) => {
                                        return old + ' ' + newText;
                                    });
                                } else {
                                    setSourceText(newText);
                                }
                                detect_language(newText).then(() => {
                                    syncSourceText();
                                });
                            },
                            (e) => {
                                setSourceText(e.toString());
                            }
                        );
                } else {
                    setSourceText('Language not supported');
                }
            }
        } else {
            let newText = text.trim();
            if (deleteNewline) {
                newText = text.replace(/\-\s+/g, '').replace(/\s+/g, ' ');
            } else {
                newText = text.trim();
            }
            if (incrementalTranslate) {
                setSourceText((old) => {
                    return old + ' ' + newText;
                });
            } else {
                setSourceText(newText);
            }
            detect_language(newText).then(() => {
                syncSourceText();
            });
        }
    };

    const keyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            detect_language(sourceText).then(() => {
                syncSourceText();
            });
        }
        if (event.key === 'Escape') {
            appWindow.close();
        }
    };

    const handleSpeak = async () => {
        const serviceName = ttsServiceList[0];
        let detected = detectLanguage;
        if (detected === '') {
            detected = await detect(sourceText);
            setDetectLanguage(detected);
        }
        if (serviceName.startsWith('[plugin]')) {
            if (!(detected in ttsPluginInfo.language)) {
                throw new Error('Language not supported');
            }
            const config = (await store.get(serviceName)) ?? {};
            const data = await invoke('invoke_plugin', {
                name: serviceName,
                pluginType: 'tts',
                source: sourceText,
                lang: ttsPluginInfo.language[detected],
                needs: config,
            });
            speak(data);
        } else {
            if (!(detected in builtinTtsServices[serviceName].Language)) {
                throw new Error('Language not supported');
            }
            let data = await builtinTtsServices[serviceName].tts(
                sourceText,
                builtinTtsServices[serviceName].Language[detected]
            );
            speak(data);
        }
    };

    useEffect(() => {
        if (hideWindow !== null) {
            if (unlisten) {
                unlisten.then((f) => {
                    f();
                });
            }
            unlisten = listen('new_text', (event) => {
                appWindow.setFocus();
                handleNewText(event.payload);
            });
        }
    }, [hideWindow]);

    useEffect(() => {
        if (ttsServiceList && ttsServiceList[0].startsWith('[plugin]')) {
            readTextFile(`plugins/tts/${ttsServiceList[0]}/info.json`, {
                dir: BaseDirectory.AppConfig,
            }).then((infoStr) => {
                setTtsPluginInfo(JSON.parse(infoStr));
            });
        }
    }, [ttsServiceList]);

    useEffect(() => {
        if (
            deleteNewline !== null &&
            incrementalTranslate !== null &&
            recognizeLanguage !== null &&
            recognizeServiceList !== null &&
            hideWindow !== null
        ) {
            invoke('get_text').then((v) => {
                handleNewText(v);
            });
        }
    }, [deleteNewline, incrementalTranslate, recognizeLanguage, recognizeServiceList, hideWindow]);

    useEffect(() => {
        textAreaRef.current.style.height = '50px';
        textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }, [sourceText]);

    const detect_language = async (text) => {
        setDetectLanguage(await detect(text));
    };

    return (
        <Card
            shadow='none'
            className='bg-content1 rounded-[10px] mt-[1px] pb-0'
        >
            <Toaster />
            <CardBody className='bg-content1 p-[12px] pb-0 max-h-[40vh] overflow-y-auto'>
                <textarea
                    autoFocus
                    ref={textAreaRef}
                    className={`text-[${appFontSize}px] bg-content1 h-full resize-none outline-none`}
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
                                    syncSourceText();
                                });
                            }, 1000);
                        }
                    }}
                />
            </CardBody>

            <CardFooter className='bg-content1 rounded-none rounded-b-[10px] flex justify-between px-[12px] p-[5px]'>
                <div className='flex justify-start'>
                    <ButtonGroup className='mr-[5px]'>
                        <Tooltip content={t('translate.speak')}>
                            <Button
                                isIconOnly
                                variant='light'
                                size='sm'
                                onPress={() => {
                                    handleSpeak().catch((e) => {
                                        toast.error(e.toString(), { style: toastStyle });
                                    });
                                }}
                            >
                                <HiOutlineVolumeUp className='text-[16px]' />
                            </Button>
                        </Tooltip>
                        <Tooltip content={t('translate.copy')}>
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
                        </Tooltip>
                        <Tooltip content={t('translate.delete_newline')}>
                            <Button
                                isIconOnly
                                variant='light'
                                size='sm'
                                onPress={() => {
                                    const newText = sourceText.replace(/\-\s+/g, '').replace(/\s+/g, ' ');
                                    setSourceText(newText);
                                    detect_language(newText).then(() => {
                                        syncSourceText();
                                    });
                                }}
                            >
                                <MdSmartButton className='text-[16px]' />
                            </Button>
                        </Tooltip>
                        <Tooltip content={t('common.clear')}>
                            <Button
                                variant='light'
                                size='sm'
                                isIconOnly
                                isDisabled={sourceText === ''}
                                onPress={() => {
                                    setSourceText('');
                                }}
                            >
                                <LuDelete className='text-[16px]' />
                            </Button>
                        </Tooltip>
                    </ButtonGroup>
                    {detectLanguage !== '' && (
                        <Chip
                            size='sm'
                            color='secondary'
                            variant='dot'
                            className='my-auto'
                        >
                            {t(`languages.${detectLanguage}`)}
                        </Chip>
                    )}
                </div>
                <Tooltip content={t('translate.translate')}>
                    <Button
                        size='sm'
                        color='primary'
                        variant='light'
                        isIconOnly
                        className='text-[14px] font-bold'
                        startContent={<HiTranslate className='text-[16px]' />}
                        onPress={() => {
                            detect_language(sourceText).then(() => {
                                syncSourceText();
                            });
                        }}
                    />
                </Tooltip>
            </CardFooter>
        </Card>
    );
}
