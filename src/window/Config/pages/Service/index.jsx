import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
import { listen } from '@tauri-apps/api/event';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab } from '@nextui-org/react';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import React, { useEffect, useState } from 'react';
import Translate from './Translate';
import Recognize from './Recognize';
import Collection from './Collection';
import Tts from './Tts';
import { ServiceType } from '../../../../utils/service_instance';

let unlisten = null;

export default function Service() {
    const [pluginList, setPluginList] = useState(null);
    const { t } = useTranslation();

    const loadPluginList = async () => {
        const serviceTypeList = ['translate', 'tts', 'recognize', 'collection'];
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
        if (unlisten) {
            unlisten.then((f) => {
                f();
            });
        }
        unlisten = listen('reload_plugin_list', loadPluginList);
        return () => {
            if (unlisten) {
                unlisten.then((f) => {
                    f();
                });
            }
        };
    }, []);
    return (
        pluginList !== null && (
            <Tabs className='flex justify-center max-h-[calc(100%-40px)] overflow-y-auto'>
                <Tab
                    key='translate'
                    title={t(`config.service.translate`)}
                >
                    <Translate pluginList={pluginList[ServiceType.TRANSLATE]} />
                </Tab>
                <Tab
                    key='recognize'
                    title={t(`config.service.recognize`)}
                >
                    <Recognize pluginList={pluginList[ServiceType.RECOGNIZE]} />
                </Tab>
                <Tab
                    key='tts'
                    title={t(`config.service.tts`)}
                >
                    <Tts pluginList={pluginList[ServiceType.TTS]} />
                </Tab>
                <Tab
                    key='collection'
                    title={t(`config.service.collection`)}
                >
                    <Collection pluginList={pluginList[ServiceType.COLLECTION]} />
                </Tab>
            </Tabs>
        )
    );
}
