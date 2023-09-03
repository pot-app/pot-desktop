import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Card, Spacer, Button, useDisclosure } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { atom, useSetAtom } from 'jotai';

import { useToastStyle } from '../../../../../hooks';
import SelectPluginModal from './SelectPluginModal';
import { useConfig } from '../../../../../hooks';
import ServiceItem from './ServiceItem';
import SelectModal from './SelectModal';
import ConfigModal from './ConfigModal';

export const pluginListAtom = atom({});

export default function Tts() {
    const setPluginList = useSetAtom(pluginListAtom);
    const {
        isOpen: isSelectPluginOpen,
        onOpen: onSelectPluginOpen,
        onOpenChange: onSelectPluginOpenChange,
    } = useDisclosure();
    const { isOpen: isSelectOpen, onOpen: onSelectOpen, onOpenChange: onSelectOpenChange } = useDisclosure();
    const { isOpen: isConfigOpen, onOpen: onConfigOpen, onOpenChange: onConfigOpenChange } = useDisclosure();
    const [openConfigName, setOpenConfigName] = useState('lingva_tts');
    const [ttsServiceList, setTtsServiceList] = useConfig('tts_service_list', ['lingva_tts']);

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
        const items = reorder(ttsServiceList, result.source.index, result.destination.index);
        setTtsServiceList(items);
    };

    const deleteService = (name) => {
        if (ttsServiceList.length === 1) {
            toast.error(t('config.service.least'), { style: toastStyle });
            return;
        } else {
            setTtsServiceList(ttsServiceList.filter((x) => x !== name));
        }
    };
    const updateServiceList = (name) => {
        if (ttsServiceList.includes(name)) {
            return;
        } else {
            const newList = [...ttsServiceList, name];
            setTtsServiceList(newList);
        }
    };

    const getPluginList = () => {
        exists('plugins/tts', { dir: BaseDirectory.AppConfig }).then((isExist) => {
            if (!isExist) {
                return;
            }
            readDir('plugins/tts', { dir: BaseDirectory.AppConfig }).then((plugins) => {
                let temp = {};
                for (const plugin of plugins) {
                    readTextFile(`plugins/tts/${plugin.name}/info.json`, {
                        dir: BaseDirectory.AppConfig,
                    }).then((infoStr) => {
                        temp[plugin.name] = JSON.parse(infoStr);
                    });
                }
                setPluginList(temp);
            });
        });
    };

    useEffect(() => {
        getPluginList();
    }, []);

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
                                {ttsServiceList !== null &&
                                    ttsServiceList.map((x, i) => {
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
                    <Button
                        fullWidth
                        onPress={onSelectPluginOpen}
                    >
                        {t('config.service.add_external_service')}
                    </Button>
                </div>
            </Card>
            <SelectPluginModal
                isOpen={isSelectPluginOpen}
                onOpenChange={onSelectPluginOpenChange}
                setConfigName={setOpenConfigName}
                onConfigOpen={onConfigOpen}
                getPluginList={getPluginList}
            />
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
