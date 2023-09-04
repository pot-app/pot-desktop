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
        if (!unlisten) {
            unlisten = listen('reload_plugin_list', loadPluginList);
        }
    }, []);
    return (
        pluginList !== null && (
            <Tabs
                // disabledKeys={['collection']}
                className='flex justify-center max-h-[calc(100%-40px)] overflow-y-auto'
            >
                <Tab
                    key='translate'
                    title={t(`config.service.translate`)}
                >
                    <Translate pluginList={pluginList['translate']} />
                </Tab>
                <Tab
                    key='recognize'
                    title={t(`config.service.recognize`)}
                >
                    <Recognize pluginList={pluginList['recognize']} />
                </Tab>
                <Tab
                    key='tts'
                    title={t(`config.service.tts`)}
                >
                    <Tts pluginList={pluginList['tts']} />
                </Tab>
                <Tab
                    key='collection'
                    title={t(`config.service.collection`)}
                >
                    <Collection pluginList={pluginList['collection']} />
                </Tab>
            </Tabs>
        )
    );
}
