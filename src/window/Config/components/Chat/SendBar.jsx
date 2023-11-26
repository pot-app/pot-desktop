import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api';
import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
import { AiOutlineClear, AiOutlineSend } from 'react-icons/ai';
import { TbCut } from 'react-icons/tb';
import Show from './Show';
import * as recognizeServices from '../../../../services/recognize';

import { useConfig, useSyncAtom } from '../../../../hooks';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';

const SendBar = (props) => {
    const { loading, disabled, onSend, onClear, onStop } = props;

    const [pluginList, setPluginList] = useState(null);
    // const [recognizeLanguage] = useConfig('recognize_language', 'auto');
    // const [recognizeServiceList] = useConfig('recognize_service_list', ['system', 'tesseract']);

    const loadPluginList = async () => {
        const serviceTypeList = ['recognize'];
        let temp = {};
        for (const serviceType of serviceTypeList) {
            temp[serviceType] = {};
            if (await exists(`plugins/${serviceType}`, { dir: BaseDirectory.AppConfig })) {
                const plugins = await readDir(`plugins/${serviceType}`, { dir: BaseDirectory.AppConfig });
                for (const plugin of plugins) {
                    const infoStr = await readTextFile(`plugins/${serviceType}/${plugin.name}/info.json`, {
                        dir: BaseDirectory.AppConfig,
                    });
                    let pluginInfo = JSON.parse(infoStr);
                    if ('icon' in pluginInfo) {
                        const appConfigDirPath = await appConfigDir();
                        const iconPath = await join(
                            appConfigDirPath,
                            `/plugins/${serviceType}/${plugin.name}/${pluginInfo.icon}`
                        );
                        pluginInfo.icon = convertFileSrc(iconPath);
                    }
                    temp[serviceType][plugin.name] = pluginInfo;
                }
            }
        }
        setPluginList({ ...temp });
    };

    useEffect(() => {
        loadPluginList();
        // if (!unlisten) {
        //     unlisten = listen('reload_plugin_list', loadPluginList);
        // }
    }, []);

    const ocrRes = async () => {
        const base64 = await invoke('get_base64');
        const serviceName = 'system';
        const v = await recognizeServices[serviceName].recognize(
            base64,
            recognizeServices[serviceName].Language['auto']
        );
        let newText = v.trim();
        newText = v.trim();
        console.log('内部：' + newText);
        return newText;
        // return '????';
    };

    const inputRef = useRef(null);
    const [n, setN] = useState(0);

    const onInputAutoSize = () => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
        }
    };

    const handleClear = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.style.height = 'auto';
            onClear();
        }
    };

    const handleSend = () => {
        const content = inputRef.current.value;
        if (content) {
            onSend({
                content,
                role: 'user',
            });
        }
    };

    const handleOcr = async () => {
        setN(0);
        invoke('ocr_chat').then(() => {
            listen('ocr_chat', async (event) => {
                // console.log(event.payload);
                ocrRes().then((res) => {
                    if (!(res === undefined)) {
                        if (n > 0) return
                        console.log(res);
                        inputRef.current.value += res;
                        setN(n+1);
                    }
                });
            });
        });
        console.log('aaaa');

        // console.log(ocrText)
    };

    const onKeydown = (e) => {
        if (e.shiftKey) {
            return;
        }

        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            handleSend();
        }
    };

    return (
        <div style={{ height: '10%' }}>
            <Show
                fallback={
                    <div className='thinking'>
                        <span>Please wait ...</span>
                        <div
                            className='stop'
                            onClick={onStop}
                        >
                            Stop
                        </div>
                    </div>
                }
                loading={loading}
            >
                <div className='send-bar'>
                    <textarea
                        ref={inputRef}
                        className='input'
                        disabled={disabled}
                        placeholder='Shift + Enter for new line'
                        autoComplete='off'
                        rows={1}
                        onKeyDown={onKeydown}
                        onInput={onInputAutoSize}
                    />
                    <button
                        className='button'
                        title='Ocr'
                        disabled={disabled}
                        onClick={handleOcr}
                    >
                        <TbCut />
                    </button>
                    <button
                        className='button'
                        title='Send'
                        disabled={disabled}
                        onClick={handleSend}
                    >
                        <AiOutlineSend />
                    </button>
                    <button
                        className='button'
                        title='Clear'
                        disabled={disabled}
                        onClick={handleClear}
                    >
                        <AiOutlineClear />
                    </button>
                </div>
            </Show>
        </div>
    );
};

export default SendBar;
