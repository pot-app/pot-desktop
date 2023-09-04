import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
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

    React.useEffect(() => {
        exists(`plugins/recognize`, { dir: BaseDirectory.AppConfig }).then((isExist) => {
            if (!isExist) {
                return;
            }
            readDir(`plugins/recognize`, { dir: BaseDirectory.AppConfig }).then((plugins) => {
                let temp = {};
                for (const plugin of plugins) {
                    readTextFile(`plugins/recognize/${plugin.name}/info.json`, {
                        dir: BaseDirectory.AppConfig,
                    }).then((infoStr) => {
                        temp[plugin.name] = JSON.parse(infoStr);
                    });
                }
                setPluginList(temp);
            });
        });
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
