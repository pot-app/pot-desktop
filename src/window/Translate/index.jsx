import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
// 修改导入部分，添加PhysicalPosition
import { appWindow, currentMonitor, PhysicalSize, PhysicalPosition } from '@tauri-apps/api/window';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { Spacer, Button } from '@nextui-org/react';
import { AiFillCloseCircle, AiOutlineExpand, AiOutlineCompress } from 'react-icons/ai';
import React, { useState, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { BsPinFill, BsArrowUp } from 'react-icons/bs';

import LanguageArea from './components/LanguageArea';
import SourceArea from './components/SourceArea';
import TargetArea from './components/TargetArea';
import { osType } from '../../utils/env';
import { useConfig } from '../../hooks';
import { store } from '../../utils/store';
import { info } from 'tauri-plugin-log-api';
import { app } from '@tauri-apps/api';


let blurTimeout = null;
let resizeTimeout = null;
let moveTimeout = null;
let hideTimeout = null;

const listenBlur = () => {
    return listen('tauri://blur', () => {
        if (appWindow.label === 'translate') {
            if (blurTimeout) {
                clearTimeout(blurTimeout);
            }
            info('Blur');
            // 100ms后关闭窗口，因为在 windows 下拖动窗口时会先切换成 blur 再立即切换成 focus
            // 如果直接关闭将导致窗口无法拖动
            blurTimeout = setTimeout(async () => {
                info('Confirm Blur');
                await appWindow.close();
            }, 100);
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
    info('Focus');
    if (blurTimeout) {
        info('Cancel Close');
        clearTimeout(blurTimeout);
    }
});
// 监听 move 事件取消 blurTimeout 时间之内的关闭窗口
void listen('tauri://move', () => {
    info('Move');
    if (blurTimeout) {
        info('Cancel Close');
        clearTimeout(blurTimeout);
    }
});

export default function Translate() {
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
    const [maximized, setMaximized] = useState(false);
    const [pluginList, setPluginList] = useState(null);
    const [serviceInstanceConfigMap, setServiceInstanceConfigMap] = useState(null);
    
    // 新增：侧拉模式状态和展开状态
    const [isSidebarMode, setIsSidebarMode] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    // 保存原始窗口大小和位置
    const originalSize = useRef(null);
    const originalPosition = useRef(null);
    const isMouseNearTop = useRef(false);
    
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
    
    // 修改：增强错误处理和日志
    // 新增：进入侧拉模式
    // 修改：使用PhysicalSize构造函数创建大小对象
    // 修改enterSidebarMode函数中的窗口大小设置部分
    const enterSidebarMode = async () => {
        try {
            info('开始进入侧拉模式');
            // 保存原始窗口大小和位置
            originalSize.current = await appWindow.outerSize();
            originalPosition.current = await appWindow.outerPosition();
            info(`保存原始大小: ${JSON.stringify(originalSize.current)}, 位置: ${JSON.stringify(originalPosition.current)}`);
            
            // 获取当前显示器信息
            const monitor = await currentMonitor();
            const dpi = monitor.scaleFactor;
            const monitorPosition = monitor.position;
            
            // 设置窗口位置到左上角 - 使用PhysicalPosition
            await appWindow.setPosition(new PhysicalPosition(
                Math.floor(monitorPosition.x),
                Math.floor(monitorPosition.y)
            ));
            
            // 设置窗口为小条模式 - 适中宽度和固定高度
            const smallHeight = Math.floor(30 * dpi); // 更窄的高度
            const width = Math.floor(300 * dpi); // 适中宽度，不再撑满屏幕
            await appWindow.setSize(new PhysicalSize(width, smallHeight));
            
            // 设置窗口置顶
            await appWindow.setAlwaysOnTop(true);
            unlistenBlur(); // 取消失焦关闭
            setIsSidebarMode(true);
            setPined(true);
            info('侧拉模式设置成功');
        } catch (error) {
            info(`侧拉模式错误: ${error.message || error}`);
            console.error('侧拉模式错误:', error);
        }
    };
    
    // 新增：退出侧拉模式
    // 优化退出侧拉模式函数
    const exitSidebarMode = async () => {
        try {
            info('开始退出侧拉模式');
            
            // 先重置状态，确保UI立即响应
            setIsSidebarMode(false);
            setIsExpanded(false);
            
            // 恢复窗口置顶状态
            if (!alwaysOnTop) {
                setPined(false);
                await appWindow.setAlwaysOnTop(false);
                if (closeOnBlur) {
                    unlisten = listenBlur();
                }
            }
            
            // 恢复原始窗口大小和位置
            if (originalSize.current && originalPosition.current) {
                await appWindow.setSize(new PhysicalSize(
                    Math.floor(originalSize.current.width),
                    Math.floor(originalSize.current.height)
                ));
                // 使用PhysicalPosition设置位置
                await appWindow.setPosition(new PhysicalPosition(
                    Math.floor(originalPosition.current.x),
                    Math.floor(originalPosition.current.y)
                ));
            } else {
                // 添加默认窗口大小作为回退方案
                const monitor = await currentMonitor();
                const dpi = monitor.scaleFactor;
                await appWindow.setSize(new PhysicalSize(
                    Math.floor(400 * dpi), // 默认宽度
                    Math.floor(400 * dpi)  // 默认高度
                ));
            }
            
            // 清除保存的状态引用
            originalSize.current = null;
            originalPosition.current = null;
            info('侧拉模式退出成功');
        } catch (error) {
            info(`退出侧拉模式错误: ${error.message || error}`);
            console.error('退出侧拉模式错误:', error);
        }
    };
    
    // 新增：展开/收起侧拉模式内容
    const toggleExpanded = async () => {
        if (!isSidebarMode) return;
        
        try {
            const isNewExpanded = !isExpanded;
            setIsExpanded(isNewExpanded);
            
            // 获取当前显示器信息
            const monitor = await currentMonitor();
            const dpi = monitor.scaleFactor;
            
            if (isNewExpanded) {
                // 展开 - 使用原始高度或默认高度
                const height = originalSize.current ? 
                    Math.floor(originalSize.current.height) : 
                    Math.floor(400 * dpi);
                await appWindow.setSize(new PhysicalSize(
                    Math.floor(300 * dpi), // 保持宽度不变
                    height
                ));
            } else {
                // 收起 - 回到小条模式
                await appWindow.setSize(new PhysicalSize(
                    Math.floor(300 * dpi), // 保持宽度不变
                    Math.floor(30 * dpi)
                ));
            }
        } catch (error) {
            info(`展开/收起错误: ${error.message || error}`);
            console.error('展开/收起错误:', error);
        }
    };
    
    // 修改：简化鼠标事件处理，直接调用toggleExpanded
    const handleMouseEnter = async () => {
        if (isSidebarMode && !isExpanded) {
            await toggleExpanded();
        }
    };
    
    const handleMouseLeave = async () => {
        if (isSidebarMode && isExpanded) {
            await toggleExpanded();
        }
    };
    
    // 完全移除旧的handleMouseMove函数和相关ref
    // const handleMouseMove = async (e) => { ... }  // 移除这整个函数
    
    // 移除不需要的ref
    // const isMouseNearTop = useRef(false);  // 在状态定义部分移除
    
    // 修改：切换侧拉模式，确保正确清除定时器
    const toggleSidebarMode = async () => {
        info(`切换侧拉模式，当前状态: ${isSidebarMode}`);
        // 清除所有定时器，避免冲突
        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }
        
        if (isSidebarMode) {
            await exitSidebarMode();
        } else {
            await enterSidebarMode();
        }
    };
    
    
    // 是否自动关闭窗口
    useEffect(() => {
        if (closeOnBlur !== null && !closeOnBlur) {
            unlistenBlur();
        }
    }, [closeOnBlur]);
    
    // 是否默认置顶
    useEffect(() => {
        if (alwaysOnTop !== null && alwaysOnTop) {
            appWindow.setAlwaysOnTop(true);
            unlistenBlur();
            setPined(true);
        }
    }, [alwaysOnTop]);
    
    
    //设置默认窗口最大化
    useEffect(() => {
        const setDefaultMaximize = async () => {
            try {
                const isMaximized = await appWindow.isMaximized();
                if (!isMaximized) {
                    await appWindow.maximize();
                    setMaximized(true);
                }
            } catch (error) {
                console.error("Failed to maximize window:", error);
            }
        };
        
        // 延迟执行以确保窗口完全初始化
        const timeoutId = setTimeout(() => {
            setDefaultMaximize();
        }, 100);
        
        return () => clearTimeout(timeoutId);
    }, []);
    
    // 监听窗口最大化
    useEffect(() => {
        const unlistenResized = listen('tauri://resize', async () => {
            try {
                const isMaximized = await appWindow.isMaximized();
                setMaximized(isMaximized);
            } catch (error) {
                console.error("Failed to check window maximized state:", error);
            }
        });
        
        // 初始化时检查窗口状态
        const initWindowStatus = async () => {
            try {
                const isMaximized = await appWindow.isMaximized();
                setMaximized(isMaximized);
            } catch (error) {
                console.error("Failed to initialize window state:", error);
            }
        };
        
        // 延迟执行以确保窗口完全初始化
        const timeoutId = setTimeout(() => {
            initWindowStatus();
        }, 100);
        
        return () => {
            clearTimeout(timeoutId);
            unlistenResized.then((f) => f()).catch(console.error);
        };
    }, []);
    // 保存窗口位置
    useEffect(() => {
        if (windowPosition !== null && windowPosition === 'pre_state' && !isSidebarMode) {
            const unlistenMove = listen('tauri://move', async () => {
                if (moveTimeout) {
                    clearTimeout(moveTimeout);
                }
                moveTimeout = setTimeout(async () => {
                    if (appWindow.label === 'translate') {
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
    }, [windowPosition, isSidebarMode]);
    
    // 保存窗口大小
    useEffect(() => {
        if (rememberWindowSize !== null && rememberWindowSize && !isSidebarMode) {
            const unlistenResize = listen('tauri://resize', async () => {
                if (resizeTimeout) {
                    clearTimeout(resizeTimeout);
                }
                resizeTimeout = setTimeout(async () => {
                    if (appWindow.label === 'translate') {
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
    }, [rememberWindowSize, isSidebarMode]);

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

    return (
        pluginList && (
            <div
                className={`bg-background h-screen w-screen ${osType === 'Linux' && 'rounded-[10px] border-1 border-default-100'}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    className='fixed top-[5px] left-[5px] right-[5px] h-[30px]'
                    data-tauri-drag-region='true'
                />
                <div className={`h-[35px] w-full flex ${osType === 'Darwin' ? 'justify-end' : 'justify-end'}`}>
                    <div className="flex gap-2">
                        <div className="flex">
                        <Button
                                isIconOnly
                                size='sm'
                                variant='flat'
                                disableAnimation
                                className='my-auto bg-transparent'
                                onPress={() => {
                                    if (pined && !isSidebarMode) {
                                        if (closeOnBlur) {
                                            unlisten = listenBlur();
                                        }
                                        appWindow.setAlwaysOnTop(false);
                                    setPined(false);
                                    } else if (!isSidebarMode) {
                                        unlistenBlur();
                                        appWindow.setAlwaysOnTop(true);
                                    setPined(true);
                                    }
                                    }}
                            >
                                <BsPinFill className={`text-[20px] ${pined ? 'text-primary' : 'text-default-400'}`} />
                            </Button>
                        
                        {/* 新增：侧拉按钮 */}
                        <Button
                            isIconOnly
                            size='sm'
                            variant='flat'
                            disableAnimation
                            className='my-auto bg-transparent hover:bg-default-100'
                            onPress={() => {
                                info('点击了侧拉按钮');
                                void toggleSidebarMode();
                            }}
                        >
                            <BsArrowUp className={`text-[20px] ${isSidebarMode ? 'text-primary' : 'text-default-400'}`} />
                        </Button>
                    </div>
                    
                        {/* 最大化按钮 */}
                        <Button
                            isIconOnly
                            size='sm'
                            variant='flat'
                            disableAnimation
                            className={`my-auto ${osType === 'Darwin' && 'hidden'} bg-transparent`}
                            onPress={async () => {
                                if (maximized) {
                                    await appWindow.unmaximize();
                                } else {
                                    await appWindow.maximize();
                                }
                                setMaximized(!maximized);
                            }}
                        >
                            {maximized ? (
                                <AiOutlineCompress className='text-[20px] text-default-400' />
                            ) : (
                                <AiOutlineExpand className='text-[20px] text-default-400' />
                            )}
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
                </div>
                
                {/* 修改：移除条件渲染，改用CSS类控制可见性 */}
                <div className={`${osType === 'Linux' ? 'h-[calc(100vh-37px)]' : 'h-[calc(100vh-35px)]'} px-[8px] 
                    ${isSidebarMode && !isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'} 
                    transition-opacity duration-300`}>
                    <div className='h-full overflow-y-auto'>
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
                            <Droppable
                                droppableId='droppable'
                                direction='vertical'
                            >
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
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
                                                                    translateServiceInstanceList={
                                                                        translateServiceInstanceList
                                                                    }
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
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>
                
                {/* 新增：侧拉模式小条提示 */}
                {isSidebarMode && !isExpanded && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-background/90 text-default-600 text-xs px-2 py-1 rounded">
                            鼠标移入展开
                        </div>
                    </div>
                )}
            </div>
        )
    );
}