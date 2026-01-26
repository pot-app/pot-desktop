import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { appWindow, PhysicalSize, currentMonitor } from "@tauri-apps/api/window";
import { appConfigDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { Spacer, Button } from '@nextui-org/react';
import { AiFillCloseCircle } from 'react-icons/ai';
import React, { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { BsPinFill,BsTranslate  } from 'react-icons/bs';

import LanguageArea from '../Translate/components/LanguageArea';
import SourceArea from '../Translate/components/SourceArea';
import TargetArea from '../Translate/components/TargetArea';
import { osType } from '../../utils/env';
import { useConfig } from '../../hooks';
import { store } from '../../utils/store';
import { info } from 'tauri-plugin-log-api';
import { useSpring, animated, config } from '@react-spring/web';
let blurTimeout = null;
let resizeTimeout = null;
let moveTimeout = null;

const listenBlur = () => {
    return listen('tauri://blur', () => {
        if (appWindow.label === 'translateicon') {
            if (blurTimeout) {
                clearTimeout(blurTimeout);
            }
            info('Blur');
            blurTimeout = setTimeout(async () => {
                info('Confirm Blur');
                await appWindow.close();
            }, 100);
        }
    });
};

let unlisten = listenBlur();
const unlistenBlur = () => {
    unlisten.then((f) => {
        f();
    });
};

void listen('tauri://focus', () => {
    info('Focus');
    if (blurTimeout) {
        info('Cancel Close');
        clearTimeout(blurTimeout);
    }
});
void listen('tauri://move', () => {
    info('Move');
    if (blurTimeout) {
        info('Cancel Close');
        clearTimeout(blurTimeout);
    }
});

export default function TranslateIcon() {
    const [iconView, setIconView] = useState(true);
    const [closeOnBlur] = useConfig('translate_close_on_blur', true);
    const [alwaysOnTop] = useConfig('translate_always_on_top', false);
    const [windowPosition] = useConfig('translate_window_position', 'mouse');
    const [rememberWindowSize] = useConfig('translate_remember_window_size', false);
    const [translateServiceInstanceList, setTranslateServiceInstanceList] = useConfig('translate_service_list', [
        'deepl',
        'bing',
        'lingva',
        'yandex',
        'google',
        'ecdict',
    ]);
    const [recognizeServiceInstanceList] = useConfig('recognize_service_list', ['system', 'tesseract']);
    const [ttsServiceInstanceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [collectionServiceInstanceList] = useConfig('collection_service_list', []);
    const [hideLanguage] = useConfig('hide_language', false);
    const [pined, setPined] = useState(false);
    const [pluginList, setPluginList] = useState(null);
    const [serviceInstanceConfigMap, setServiceInstanceConfigMap] = useState(null);
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const items = reorder(translateServiceInstanceList, result.source.index, result.destination.index);
        setTranslateServiceInstanceList(items);
    };

    useEffect(() => {
        if (closeOnBlur !== null && !closeOnBlur) {
            unlistenBlur();
        }
    }, [closeOnBlur]);

    useEffect(() => {
        if (alwaysOnTop !== null && alwaysOnTop) {
            appWindow.setAlwaysOnTop(true);
            unlistenBlur();
            setPined(true);
        }
    }, [alwaysOnTop]);

    useEffect(() => {
        if (windowPosition !== null && windowPosition === 'pre_state') {
            const unlistenMove = listen('tauri://move', async () => {
                if (moveTimeout) {
                    clearTimeout(moveTimeout);
                }
                moveTimeout = setTimeout(async () => {
                    if (appWindow.label === 'translateicon') {
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
                    if (appWindow.label === 'translateicon') {
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

    const loadServiceInstanceConfigMap = async () => {
        const config = {};
        for (const serviceInstanceKey of translateServiceInstanceList) {
            config[serviceInstanceKey] = (await store.get(serviceInstanceKey)) ?? {};
        }
        for (const serviceInstanceKey of recognizeServiceInstanceList) {
            config[serviceInstanceKey] = (await store.get(serviceInstanceKey)) ?? {};
        }
        for (const serviceInstanceKey of ttsServiceInstanceList) {
            config[serviceInstanceKey] = (await store.get(serviceInstanceKey)) ?? {};
        }
        for (const serviceInstanceKey of collectionServiceInstanceList) {
            config[serviceInstanceKey] = (await store.get(serviceInstanceKey)) ?? {};
        }
        setServiceInstanceConfigMap({ ...config });
    };
    useEffect(() => {
        if (
            translateServiceInstanceList !== null &&
            recognizeServiceInstanceList !== null &&
            ttsServiceInstanceList !== null &&
            collectionServiceInstanceList !== null
        ) {
            loadServiceInstanceConfigMap();
        }
    }, [
        translateServiceInstanceList,
        recognizeServiceInstanceList,
        ttsServiceInstanceList,
        collectionServiceInstanceList,
    ]);

    const expandWindow = async () => {
        const monitor = await currentMonitor();
        const dpi = monitor?.scaleFactor ?? 1;
     
        const fullWidth = (await store.get("translate_window_width")) ?? 350;
        const fullHeight = (await store.get("translate_window_height")) ?? 420;
        // 整数 !!!
        await appWindow.setSize(new PhysicalSize(Math.round(fullWidth * dpi), Math.round(fullHeight * dpi)));
      };

    const animation = useSpring({
        loop: true,
        to: [
          { transform: 'rotate(-15deg) scale(1.05)' },
          { transform: 'rotate(15deg) scale(1)' },
        ],
        config: { tension: 120, friction: 20 },
      });
    // Here is the return part of the whole component, based on the iconView state switching
    return iconView ? (
        <div
            className="w-screen h-screen bg-background flex items-center justify-center"
            onMouseEnter={() => {
                setIconView(false);
                expandWindow();
              }}
        >
      <animated.div
        style={animation}
      >
        <BsTranslate className="text-4xl text-primary cursor-pointer" />
      </animated.div>
        </div>
    ) : (
        <div
            style={{ height: '100vh', width: '100vw' }}
        >
            {pluginList && (
                <div
                    className={`bg-background h-screen w-screen ${
                        osType === 'Linux' ? 'rounded-[10px] border-1 border-default-100' : ''
                    }`}
                >
                    <div
                        className="fixed top-[5px] left-[5px] right-[5px] h-[30px]"
                        data-tauri-drag-region="true"
                    />
                    <div className={`h-[35px] w-full flex ${osType === 'Darwin' ? 'justify-end' : 'justify-between'}`}>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            disableAnimation
                            className="my-auto bg-transparent"
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
                            <BsPinFill
                                className={`text-[20px] ${
                                    pined ? 'text-primary' : 'text-default-400'
                                }`}
                            />
                        </Button>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            disableAnimation
                            className={`my-auto ${osType === 'Darwin' && 'hidden'} bg-transparent`}
                            onPress={() => {
                                void appWindow.close();
                            }}
                        >
                            <AiFillCloseCircle className="text-[20px] text-default-400" />
                        </Button>
                    </div>
                    <div
                        className={`${
                            osType === 'Linux' ? 'h-[calc(100vh-37px)]' : 'h-[calc(100vh-35px)]'
                        } px-[8px]`}
                    >
                        <div className="h-full overflow-y-auto">
                            <div>
                                {serviceInstanceConfigMap !== null && (
                                    <SourceArea
                                        pluginList={pluginList}
                                        serviceInstanceConfigMap={serviceInstanceConfigMap}
                                    />
                                )}
                            </div>
                            <div className={`${hideLanguage && 'hidden'}`}>
                                <LanguageArea />
                                <Spacer y={2} />
                            </div>
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="droppable" direction="vertical">
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps}>
                                            {translateServiceInstanceList !== null &&
                                            serviceInstanceConfigMap !== null &&
                                            translateServiceInstanceList.map((serviceInstanceKey, index) => {
                                                const config = serviceInstanceConfigMap[serviceInstanceKey] ?? {};
                                                const enable = config['enable'] ?? true;

                                                return enable ? (
                                                    <Draggable
                                                        key={serviceInstanceKey}
                                                        draggableId={serviceInstanceKey}
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                            >
                                                                <TargetArea
                                                                    {...provided.dragHandleProps}
                                                                    index={index}
                                                                    name={serviceInstanceKey}
                                                                    translateServiceInstanceList={translateServiceInstanceList}
                                                                    pluginList={pluginList}
                                                                    serviceInstanceConfigMap={serviceInstanceConfigMap}
                                                                />
                                                                <Spacer y={2} />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ) : (
                                                    <></>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
