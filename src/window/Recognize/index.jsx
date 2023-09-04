import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { atom, useAtom } from 'jotai';
import React from 'react';

import WindowControl from '../../components/WindowControl';
import { osType } from '../../utils/env';
import ControlArea from './ControlArea';
import ImageArea from './ImageArea';
import TextArea from './TextArea';
export const pluginListAtom = atom();

export default function Recognize() {
    const [pluginList, setPluginList] = useAtom(pluginListAtom);

    const loadPluginList = async () => {
        if (await exists(`plugins/recognize`, { dir: BaseDirectory.AppConfig })) {
            let temp = {};
            const plugins = await readDir(`plugins/recognize`, { dir: BaseDirectory.AppConfig });
            for (const plugin of plugins) {
                const infoStr = await readTextFile(`plugins/recognize/${plugin.name}/info.json`, {
                    dir: BaseDirectory.AppConfig,
                });
                let pluginInfo = JSON.parse(infoStr);
                if ('icon' in pluginInfo) {
                    const appConfigDirPath = await appConfigDir();
                    const iconPath = await join(
                        appConfigDirPath,
                        `/plugins/recognize/${plugin.name}/${pluginInfo.icon}`
                    );
                    pluginInfo.icon = convertFileSrc(iconPath);
                }
                temp[plugin.name] = pluginInfo;
            }
            setPluginList({ ...temp });
        }
    };

    React.useEffect(() => {
        loadPluginList();
    }, []);

    return (
        pluginList && (
            <div
                className={`bg-background h-screen ${
                    osType === 'Linux' && 'rounded-[10px] border-1 border-default-100'
                }`}
            >
                <div
                    data-tauri-drag-region='true'
                    style={{
                        top: '5px',
                        left: '5px',
                        right: '5px',
                        height: '30px',
                        position: 'fixed',
                    }}
                />
                <div className='h-[35px] flex justify-end'>{osType !== 'Darwin' && <WindowControl />}</div>
                <div
                    className={`${
                        osType === 'Linux' ? 'h-[calc(100vh-87px)]' : 'h-[calc(100vh-85px)]'
                    } grid grid-cols-2`}
                >
                    <ImageArea />
                    <TextArea />
                </div>
                <div className='h-[50px]'>
                    <ControlArea />
                </div>
            </div>
        )
    );
}
