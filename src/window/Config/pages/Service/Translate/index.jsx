import { Card, Spacer, Button, useDisclosure, Tooltip } from '@nextui-org/react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import { useToastStyle } from '../../../../../hooks';
import { useConfig } from '../../../../../hooks';
import ServiceItem from './ServiceItem';
import SelectModal from './SelectModal';
import ConfigModal from './ConfigModal';

export default function Translate() {
    const { isOpen: isSelectOpen, onOpen: onSelectOpen, onOpenChange: onSelectOpenChange } = useDisclosure();
    const { isOpen: isConfigOpen, onOpen: onConfigOpen, onOpenChange: onConfigOpenChange } = useDisclosure();
    const [openConfigName, setOpenConfigName] = useState('deepl');
    const [translateServiceList, setTranslateServiceList] = useConfig('translate_service_list', [
        'deepl',
        'bing',
        'yandex',
        'google',
    ]);
    const { t } = useTranslation();
    const toastStyle = useToastStyle();

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

    const deleteService = (name) => {
        if (translateServiceList.length === 1) {
            toast.error(t('config.service.least'), { style: toastStyle });
            return;
        } else {
            setTranslateServiceList(translateServiceList.filter((x) => x !== name));
        }
    };
    const updateServiceList = (name) => {
        if (translateServiceList.includes(name)) {
            return;
        } else {
            const newList = [...translateServiceList, name];
            setTranslateServiceList(newList);
        }
    };
    return (
        <>
            <Toaster />
            <Card className='h-[calc(100vh-120px)] overflow-y-auto p-5 flex justify-between'>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable
                        droppableId='droppable'
                        direction='vertical'
                    >
                        {(provided) => (
                            <div
                                className='overflow-y-auto h-full'
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {translateServiceList !== null &&
                                    translateServiceList.map((x, i) => {
                                        return (
                                            <Draggable
                                                key={x}
                                                draggableId={x}
                                                index={i}
                                            >
                                                {(provided) => {
                                                    return (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                        >
                                                            <ServiceItem
                                                                {...provided.dragHandleProps}
                                                                name={x}
                                                                key={x}
                                                                deleteService={deleteService}
                                                                setConfigName={setOpenConfigName}
                                                                onConfigOpen={onConfigOpen}
                                                            />
                                                            <Spacer y={2} />
                                                        </div>
                                                    );
                                                }}
                                            </Draggable>
                                        );
                                    })}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                <Spacer y={2} />
                <div className='flex'>
                    <Button
                        fullWidth
                        onPress={onSelectOpen}
                    >
                        {t('config.service.add_buildin_service')}
                    </Button>
                    <Spacer x={2} />
                    <Tooltip content='敬请期待'>
                        <Button
                            fullWidth
                            variant='light'
                        >
                            {t('config.service.add_external_service')}
                        </Button>
                    </Tooltip>
                </div>
            </Card>
            <SelectModal
                isOpen={isSelectOpen}
                onOpenChange={onSelectOpenChange}
                setConfigName={setOpenConfigName}
                onConfigOpen={onConfigOpen}
            />
            <ConfigModal
                name={openConfigName}
                isOpen={isConfigOpen}
                onOpenChange={onConfigOpenChange}
                updateServiceList={updateServiceList}
            />
        </>
    );
}
