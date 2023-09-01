import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Spacer, Button } from '@nextui-org/react';
import { AiFillCloseCircle } from 'react-icons/ai';
import { appWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { BsPinFill } from 'react-icons/bs';
import React, { useState } from 'react';

import LanguageArea from './components/LanguageArea';
import SourceArea from './components/SourceArea';
import TargetArea from './components/TargetArea';
import { osType } from '../../utils/env';
import { useConfig } from '../../hooks';

let blurTimeout = null;

const listenBlur = () => {
    return listen('tauri://blur', () => {
        if (appWindow.label === 'translate') {
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

export default function Translate() {
    const [translateServiceList, setTranslateServiceList] = useConfig('translate_service_list', ['deepl', 'bing']);
    const [hideSource] = useConfig('hide_source', false);
    const [hideLanguage] = useConfig('hide_language', false);
    const [pined, setPined] = useState(false);

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

    return (
        <div
            className={`bg-background h-screen w-screen ${
                osType === 'Linux' && 'rounded-[10px] border-1 border-default-100'
            }`}
        >
            <div
                className='fixed top-[5px] left-[5px] right-[5px] h-[30px]'
                data-tauri-drag-region='true'
            />
            <div className={`px-[8px] h-[35px] w-full flex ${osType === 'Darwin' ? 'justify-end' : 'justify-between'}`}>
                <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    className='my-auto'
                    onPress={() => {
                        appWindow.setAlwaysOnTop(!pined);
                        if (pined) {
                            unlisten = listenBlur();
                        } else {
                            unlistenBlur();
                        }
                        setPined(!pined);
                    }}
                >
                    <BsPinFill className={`text-[20px] ${pined ? 'text-primary' : 'text-default-400'}`} />
                </Button>
                <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    className={`my-auto ${osType === 'Darwin' && 'hidden'}`}
                    onPress={() => {
                        void appWindow.close();
                    }}
                >
                    <AiFillCloseCircle className='text-[20px] text-default-400' />
                </Button>
            </div>
            <div className={`${osType === 'Linux' ? 'h-[calc(100vh-37px)]' : 'h-[calc(100vh-35px)]'} px-[8px]`}>
                <div className='h-full overflow-y-auto'>
                    <div className={`${hideSource && 'hidden'}`}>
                        <SourceArea />
                        <Spacer y={2} />
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
                                    {translateServiceList !== null &&
                                        translateServiceList.map((service, index) => {
                                            return (
                                                <Draggable
                                                    key={service}
                                                    draggableId={service}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                        >
                                                            <TargetArea
                                                                {...provided.dragHandleProps}
                                                                name={service}
                                                                index={index}
                                                            />
                                                            <Spacer y={2} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>
        </div>
    );
}
