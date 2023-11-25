import { Button, Card, CardBody, CardFooter, ButtonGroup, Chip, Tooltip } from '@nextui-org/react';
import { BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import { readText, writeText } from '@tauri-apps/api/clipboard';
import React, { useEffect, useRef, useState } from 'react';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
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
import { Body, fetch } from '@tauri-apps/api/http';

export const sourceTextAtom = atom('');
export const detectLanguageAtom = atom('');
import SelectPrompt from '../SelectPrompt';
import ChatArea from '../ChatArea';

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
    const ref = useRef(null);

    const [sKey, setSKey] = useState('');
    const setSelectKey = (key_) => {
        setSKey(key_);
    };
    const [userInput, setUserInput] = useState('');

    const handleNewText = async (text) => {
        text = text.trim();
        if (hideWindow) {
            appWindow.hide();
        } else {
            appWindow.show();
            appWindow.setFocus();
        }
        setUserInput(text);
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

    const rezise = () => {
        appWindow.setSize(new LogicalSize(ref.current.clientWidth, ref.current.clientHeight));
    }
    useEffect(() => {
        rezise()
    });

    //     useEffect(() => {
    //         textAreaRef.current.style.height = '50px';
    //         textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    //     }, [sourceText]);

    const detect_language = async (text) => {
        setDetectLanguage(await detect(text));
    };
    const showList = false;

    return (
        // <Card
        //     shadow='none'
        //     className='bg-content1 rounded-[10px] mt-[1px] pb-0'
        //     style={{position:"relative",height:"400px",backgroundColor:"transparent"}}
        // >
        //     <Toaster />
        <div
            ref={ref}
            style={{
                width: 'auto',
                height: 'auto',
                minWidth: '300px',
                overflow: 'hidden',
            }}
        >
            {sKey == '' ? (
                <SelectPrompt setSKey={setSelectKey} />
            ) : (
                <ChatArea
                    key_={sKey}
                    userInput={userInput}
                />
            )}
        </div>

        // </Card>
    );
}
