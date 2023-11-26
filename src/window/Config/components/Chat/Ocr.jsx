import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api';
import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
import { useConfig, useSyncAtom } from '../../../../hooks';
import { atom, useAtom } from 'jotai';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';



const Ocr = async() => {
    const [pluginList, setPluginList] = useState(null);
    const [recognizeLanguage] = useConfig('recognize_language', 'auto');
    const [recognizeServiceList] = useConfig('recognize_service_list', ['system', 'tesseract']);

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
                        newText = v.replace(/\s+/g, ' ');
                    } else {
                        newText = v.trim();
                    }
                    return newText;
                },
                (e) => {
                    return e.toString();
                }
            );
        } else {
            return 'Language not supported';
        }
    }
    // return 1
}

export default Ocr;