import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Spacer } from '@nextui-org/react';
import React from 'react';

import LanguageArea from './components/LanguageArea';
import SourceArea from './components/SourceArea';
import TargetArea from './components/TargetArea';
import { osType } from '../../utils/env';
import { useConfig } from '../../hooks';

export default function Translate() {
    const [translateServiceList, setTranslateServiceList] = useConfig('translate_service_list', ['deepl', 'bing']);

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
        <div className={`h-screen w-screen bg-background ${osType === 'Linux' && 'rounded-[10px]'}`}>
            <div className='p-[5px] h-[35px] w-full'>
                <div
                    className='flex h-full'
                    data-tauri-drag-region='true'
                />
            </div>
            <div className='h-[calc(100vh-35px)] overflow-y-auto px-[8px]'>
                <div>
                    <SourceArea />
                    <Spacer y={2} />
                </div>
                <div>
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
    );
}
