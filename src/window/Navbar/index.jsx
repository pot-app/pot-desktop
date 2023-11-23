import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { appWindow, currentMonitor } from '@tauri-apps/api/window';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { Spacer, Button } from '@nextui-org/react';
import { AiFillCloseCircle } from 'react-icons/ai';
import React, { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { BsPinFill } from 'react-icons/bs';

import SourceArea from './components/SourceArea';
import { osType } from '../../utils/env';
import { useConfig } from '../../hooks';
import { store } from '../../utils/store';
import { info } from 'tauri-plugin-log-api';
import "./index.css";

let blurTimeout = null;
let resizeTimeout = null;
let moveTimeout = null;

const listenBlur = () => {
    return listen('tauri://blur', () => {
        if (appWindow.label === 'navbar') {
            if (blurTimeout) {
                clearTimeout(blurTimeout);
            }
            // 50ms后关闭窗口，因为在 windows 下拖动窗口时会先切换成 blur 再立即切换成 focus
            // 如果直接关闭将导致窗口无法拖动
            blurTimeout = setTimeout(async () => {
                await appWindow.close();
            }, 50);
        }
    });
};

let unlisten = listenBlur();
// 取消 blur 监听
const unlistenBlur = () => {
    unlisten.then((f) => {
        f();
    });
};

// 监听 focus 事件取消 blurTimeout 时间之内的关闭窗口
void listen('tauri://focus', () => {
    if (blurTimeout) {
        clearTimeout(blurTimeout);
    }
});

export default function Navbar() {
    console.log(appWindow)
    appWindow.setDecorations(false);
    const [closeOnBlur] = useConfig('translate_close_on_blur', true);
    const [windowPosition] = useConfig('translate_window_position', 'mouse');
    const [rememberWindowSize] = useConfig('translate_remember_window_size', false);
    const [translateServiceList, setTranslateServiceList] = useConfig('translate_service_list', [
        'deepl',
        'bing',
        'yandex',
        'google',
    ]);
    const [hideSource] = useConfig('hide_source', false);
    const [hideLanguage] = useConfig('hide_language', false);
    const [pined, setPined] = useState(false);
    const [pluginList, setPluginList] = useState(null);
    const [serviceConfig, setServiceConfig] = useState(null);
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const items = reorder(translateServiceList, result.source.index, result.destination.index);
        setTranslateServiceList(items);
    };
    useEffect(() => {
        if (windowPosition !== null && windowPosition === 'pre_state') {
            const unlistenMove = listen('tauri://move', async () => {
                if (moveTimeout) {
                    clearTimeout(moveTimeout);
                }
                moveTimeout = setTimeout(async () => {
                    if (appWindow.label === 'navbar') {
                        let position = await appWindow.outerPosition();
                        const monitor = await currentMonitor();
                        const factor = monitor.scaleFactor;
                        position = position.toLogical(factor);
                        await store.set('translate_window_position_x', parseInt(position.x));
                        await store.set('translate_window_position_y', parseInt(position.y));
                        await store.save();
                    }
                }, 100);
            });
            return () => {
                unlistenMove.then((f) => {
                    f();
                });
            };
        }
    }, [windowPosition]);
    useEffect(() => {
        if (rememberWindowSize !== null && rememberWindowSize) {
            const unlistenResize = listen('tauri://resize', async () => {
                if (resizeTimeout) {
                    clearTimeout(resizeTimeout);
                }
                resizeTimeout = setTimeout(async () => {
                    if (appWindow.label === 'navbar') {
                        let size = await appWindow.outerSize();
                        const monitor = await currentMonitor();
                        const factor = monitor.scaleFactor;
                        size = size.toLogical(factor);
                        await store.set('translate_window_height', parseInt(size.height));
                        await store.set('translate_window_width', parseInt(size.width));
                        await store.save();
                    }
                }, 100);
            });
            return () => {
                unlistenResize.then((f) => {
                    f();
                });
            };
        }
    }, [rememberWindowSize]);

    // const loadPluginList = async () => {
    //     const serviceTypeList = ['translate', 'tts', 'recognize', 'collection'];
    //     let temp = {};
    //     for (const serviceType of serviceTypeList) {
    //         temp[serviceType] = {};
    //         if (await exists(`plugins/${serviceType}`, { dir: BaseDirectory.AppConfig })) {
    //             const plugins = await readDir(`plugins/${serviceType}`, { dir: BaseDirectory.AppConfig });
    //             for (const plugin of plugins) {
    //                 const infoStr = await readTextFile(`plugins/${serviceType}/${plugin.name}/info.json`, {
    //                     dir: BaseDirectory.AppConfig,
    //                 });
    //                 let pluginInfo = JSON.parse(infoStr);
    //                 if ('icon' in pluginInfo) {
    //                     const appConfigDirPath = await appConfigDir();
    //                     const iconPath = await join(
    //                         appConfigDirPath,
    //                         `/plugins/${serviceType}/${plugin.name}/${pluginInfo.icon}`
    //                     );
    //                     pluginInfo.icon = convertFileSrc(iconPath);
    //                 }
    //                 temp[serviceType][plugin.name] = pluginInfo;
    //             }
    //         }
    //     }
    //     setPluginList({ ...temp });
    // };

    // useEffect(() => {
    //     loadPluginList();
    //     if (!unlisten) {
    //         unlisten = listen('reload_plugin_list', loadPluginList);
    //     }
    // }, []);

    const getServiceConfig = async () => {
        let config = {};
        for (const service of translateServiceList) {
            config[service] = (await store.get(service)) ?? {};
        }
        setServiceConfig({ ...config });
    };
    useEffect(() => {
        if (translateServiceList !== null) {
            getServiceConfig();
        }
    }, [translateServiceList]);

    // console.log(selectKey);

    return (
        <div
        // id='target1'
        // className={`bg-background h-screen w-screen ${
        //     osType === 'Linux' && 'rounded-[10px] border-1 border-default-100'
        // }`}
        >
            <div
                className='fixed top-[5px] left-[5px] right-[5px] h-[30px]'
                data-tauri-drag-region='true'
            />
            <div
                className={`h-[35px] w-full flex ${osType === 'Darwin' ? 'justify-end' : 'justify-between'}`}
                style={{ backgroundColor: 'white' }}
            >
                <Button
                    isIconOnly
                    size='sm'
                    variant='flat'
                    disableAnimation
                    className='my-auto bg-transparent'
                    onPress={() => {
                        if (pined) {
                            if (closeOnBlur) {
                                unlisten = listenBlur();
                            }
                            appWindow.setAlwaysOnTop(false);
                        } else {
                            unlistenBlur();
                            appWindow.setAlwaysOnTop(true);
                        }
                        setPined(!pined);
                    }}
                >
                    <BsPinFill className={`text-[20px] ${pined ? 'text-primary' : 'text-default-400'}`} />
                </Button>
                <Button
                    isIconOnly
                    size='sm'
                    variant='flat'
                    disableAnimation
                    className={`my-auto ${osType === 'Darwin' && 'hidden'} bg-transparent`}
                    onPress={() => {
                        void appWindow.close();
                    }}
                >
                    <AiFillCloseCircle className='text-[20px] text-default-400' />
                </Button>
            </div>

            <SourceArea pluginList={pluginList} />
        </div>
    );
}
