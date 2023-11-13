import { Button, Card, CardBody, CardFooter, ButtonGroup, Chip, Tooltip } from '@nextui-org/react';
import { BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import { readText, writeText } from '@tauri-apps/api/clipboard';
import React, { useEffect, useRef, useState } from 'react';
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
import {Body, fetch} from "@tauri-apps/api/http"

export const sourceTextAtom = atom('');
export const detectLanguageAtom = atom('');

let unlisten = null;
let timer = null;

export default function SourceArea(props) {
    const { pluginList } = props;
    const [sourceText, setSourceText, syncSourceText] = useSyncAtom(sourceTextAtom);
    const [detectLanguage, setDetectLanguage] = useAtom(detectLanguageAtom);
    const [incrementalTranslate] = useConfig('incremental_translate', false);
    const [dynamicTranslate] = useConfig('dynamic_translate', false);
    const [deleteNewline] = useConfig('translate_delete_newline', false);
    const [recognizeLanguage] = useConfig('recognize_language', 'auto');
    const [recognizeServiceList] = useConfig('recognize_service_list', ['system', 'tesseract']);
    const [ttsServiceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [langDetectEngine] = useConfig('translate_detect_engine', 'baidu');
    const [hideWindow] = useConfig('translate_hide_window', false);
    const [ttsPluginInfo, setTtsPluginInfo] = useState();
    const toastStyle = useToastStyle();
    const { t } = useTranslation();
    const textAreaRef = useRef();
    const speak = useVoice();
    const [showCard, setShowCard] = useState(false)

    const handleNewText = async (text) => {
        text = text.trim();
        if (hideWindow) {
            appWindow.hide();
        } else {
            appWindow.show();
            appWindow.setFocus();
        }
        setDetectLanguage('');
        if (text === '') {
            text = (await readText()) ?? '';
        }
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
                            let newText = v;
                            if (deleteNewline) {
                                newText = v.replace(/\s+/g, ' ');
                            } else {
                                newText = v;
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
                                let newText = v;
                                if (deleteNewline) {
                                    newText = v.replace(/\s+/g, ' ');
                                } else {
                                    newText = v;
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
            let newText = text;
            if (deleteNewline) {
                newText = text.replace(/\s+/g, ' ');
            } else {
                newText = text;
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
        if (serviceName.startsWith('[plugin]')) {
            if (!(detectLanguage in ttsPluginInfo.language)) {
                throw new Error('Language not supported');
            }
            const config = (await store.get(serviceName)) ?? {};
            const data = await invoke('invoke_plugin', {
                name: serviceName,
                pluginType: 'tts',
                source: sourceText,
                lang: ttsPluginInfo.language[detectLanguage],
                needs: config,
            });
            speak(data);
        } else {
            if (!(detectLanguage in builtinTtsServices[serviceName].Language)) {
                throw new Error('Language not supported');
            }
            let data = await builtinTtsServices[serviceName].tts(
                sourceText,
                builtinTtsServices[serviceName].Language[detectLanguage]
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

//     useEffect(() => {
//         textAreaRef.current.style.height = '50px';
//         textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
//     }, [sourceText]);

    const detect_language = async (text) => {
        setDetectLanguage(await detect(text));
    };
    const showList = false;

  return (
    
    <Card
        shadow='none'
        className='bg-content1 rounded-[10px] mt-[1px] pb-0'
        // style={{height:"40px"}}
        style={{position:"relative",height:"300px",backgroundColor:"transparent"}}
    >
        <Toaster />
{/* 编辑：点击之后可以重命名div中的文字内容
置顶：点击后改变status
 */}
 {/* 当数据status=1的时候渲染到cardfooter中，反之渲染到下面定位列表中 */}
        <CardFooter className='bg-content1 rounded-[10px] flex justify-between px-[12px] p-[5px]' >
            <div className='flex justify-start' style={{background:"orange",height:"40px"}}>
                <ButtonGroup style={{display:"flex"}} className='mr-[5px]'>
                    <Tooltip content={t('translate.explain')} offset={15}>
                        <Button
                        // 目前宽度写死80px，后续要改成自适应内部宽度
                            style={{width:"80px",display:"flex",alignItems:"center"}}
                            isIconOnly
                            variant='light'
                            size='sm'
                            content={t('translate.explain')}
                            onPress={() => {
                                appWindow.hide();
                                fetch('http://127.0.0.1:60828/config');
                                appWindow.setFocus();
                            }}
                        >
                            <HiOutlineVolumeUp className='text-[20px]' />
                            <div style={{marginLeft:"4px",textAlign:"center"}}>123</div>
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('translate.summarize')} offset={15}>
                        <Button
                            style={{width:"80px"}}
                            isIconOnly
                            variant='light'
                            size='sm'
                            onPress={() => {
                                writeText(sourceText);
                            }}
                        >
                            <MdContentCopy className='text-[20px]' />
                            <div style={{marginLeft:"4px",textAlign:"center"}}>..............</div>
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('more list')} offset={15}>
                    <Button
                            style={{width:"40px",backgroundColor:showList?"#fff":"orange"}}
                            isIconOnly
                            variant='light'
                            size='sm'
                            onPress={() => {
                                showList = !showList
                            }}
                        >
                            <MdSmartButton className='text-[20px]' />
                        </Button>
                    </Tooltip>
                    {/* <Tooltip content={t('translate.translate')} offset={15}>
                        <Button
                            style={{width:"40px"}}
                            variant='light'
                            size='sm'
                            isIconOnly
                            isDisabled={sourceText === ''}
                            onPress={() => {
                                setSourceText('');
                            }}
                        >
                            <LuDelete className='text-[20px]' />
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('translate.analog_continuation')} offset={15}>
                        <Button
                            style={{width:"40px"}}
                            variant='light'
                            size='sm'
                            isIconOnly
                            isDisabled={sourceText === ''}
                            onPress={() => {
                                setSourceText('');
                            }}
                        >
                            <LuDelete className='text-[20px]' />
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('translate.analog_rewrite')} offset={15}>
                        <Button
                            style={{width:"40px"}}
                            variant='light'
                            size='sm'
                            isIconOnly
                            isDisabled={sourceText === ''}
                            onPress={() => {
                                setSourceText('');
                            }}
                        >
                            <LuDelete className='text-[20px]' />
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('translate.ask')} offset={15}>
                        <Button
                            style={{width:"40px"}}
                            // style={{width:"40px"}}
                            variant='light'
                            size='sm'
                            isIconOnly
                            isDisabled={sourceText === ''}
                            onPress={() => {
                                setSourceText('');
                            }}
                        >
                            <LuDelete className='text-[20px]' />
                        </Button>
                    </Tooltip> */}
                </ButtonGroup>
            </div>
        </CardFooter>
        <div style={{position:"absolute",top:"50px",right:"140px",display:"flex",flexDirection:"column",background:"#f2f2f2",height:"160px",width:"120px",opacity:showList?"0":"1",transition:"all .3s ease-in-out"}}>
            <Tooltip content={t('translate.rewrite')} offset={15}>
                        <Button
                            style={{width:"120px",display:"flex",alignItems:"center"}}
                            isIconOnly
                            variant='light'
                            size='sm'
                            onPress={() => {
                                const newText = sourceText.replace(/\s+/g, ' ');
                                setSourceText(newText);
                                detect_language(newText).then(() => {
                                    syncSourceText();
                                });
                            }}
                        >
                            <MdSmartButton className='text-[20px]' />
                            <div style={{marginLeft:"4px",textAlign:"center"}}>Summarize</div>
                            {/* <div>文字内容</div> */}
                            {/* <MdSmartButton className='text-[20px]' /> */}
                            {/* <MdSmartButton className='text-[20px]' /> */}
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('translate.translate')} offset={15}>
                        <Button
                            style={{width:"120px",display:"flex",alignItems:"center"}}
                            variant='light'
                            size='sm'
                            isIconOnly
                            isDisabled={sourceText === ''}
                            onPress={() => {
                                setSourceText('');
                            }}
                        >
                            <LuDelete className='text-[20px]' />
                            <div style={{marginLeft:"4px",textAlign:"center"}}>Summarize</div>
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('translate.analog_continuation')} offset={15}>
                        <Button
                            style={{width:"120px",display:"flex",alignItems:"center"}}
                            variant='light'
                            size='sm'
                            isIconOnly
                            isDisabled={sourceText === ''}
                            onPress={() => {
                                setSourceText('');
                            }}
                        >
                            <LuDelete className='text-[20px]' />
                            <div style={{marginLeft:"4px",textAlign:"center"}}>Summarize</div>
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('translate.analog_rewrite')} offset={15}>
                        <Button
                            style={{width:"120px",display:"flex",alignItems:"center"}}
                            variant='light'
                            size='sm'
                            isIconOnly
                            isDisabled={sourceText === ''}
                            onPress={() => {
                                setSourceText('');
                            }}
                        >
                            <LuDelete className='text-[20px]' />
                            <div style={{marginLeft:"4px",textAlign:"center"}}>Summarize</div>
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('translate.ask')} offset={15}>
                        <Button
                            style={{width:"120px",display:"flex",alignItems:"center"}}
                            // style={{width:"40px"}}
                            variant='light'
                            size='sm'
                            isIconOnly
                            isDisabled={sourceText === ''}
                            onPress={() => {
                                setSourceText('');
                            }}
                        >
                            <LuDelete className='text-[20px]' />
                            <div style={{marginLeft:"4px",textAlign:"center"}}>Summarize</div>
                        </Button>
                    </Tooltip>
                </div>
    </Card>
  );
}
