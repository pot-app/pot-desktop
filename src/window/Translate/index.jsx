import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { appWindow } from '@tauri-apps/api/window';
import { Spacer, Button } from '@nextui-org/react';
import React, { useEffect } from 'react';
import { AiFillCloseCircle } from 'react-icons/ai';
import { BsPinFill } from 'react-icons/bs';

import LanguageArea from './components/LanguageArea';
import SourceArea from './components/SourceArea';
import TranslateCard from './components/TranslateCard';
import { osType } from '../../utils/env';
import { useConfig } from '../../hooks';
import { store } from '../../utils/store';
import useTranslateWindow from './useTranslateWindow';
import usePluginList from './usePluginList';

export default function Translate() {
    const [closeOnBlur] = useConfig('translate_close_on_blur', true);
    const [alwaysOnTop] = useConfig('translate_always_on_top', false);
    const [windowPosition] = useConfig('translate_window_position', 'mouse');
    const [rememberWindowSize] = useConfig('translate_remember_window_size', false);
    const [translateServiceInstanceList, setTranslateServiceInstanceList] = useConfig('translate_service_list', [
        'deepl', 'bing', 'lingva', 'yandex', 'google', 'ecdict',
    ]);
    const [recognizeServiceInstanceList] = useConfig('recognize_service_list', ['system', 'tesseract']);
    const [ttsServiceInstanceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [collectionServiceInstanceList] = useConfig('collection_service_list', []);
    const [hideLanguage] = useConfig('hide_language', false);

    const { pinned, togglePin } = useTranslateWindow(closeOnBlur, alwaysOnTop, windowPosition, rememberWindowSize);
    const pluginList = usePluginList();

    // ── Service instance config map ───────────────────────────────────────

    const [serviceInstanceConfigMap, setServiceInstanceConfigMap] = React.useState(null);

    useEffect(() => {
        if (
            translateServiceInstanceList !== null &&
            recognizeServiceInstanceList !== null &&
            ttsServiceInstanceList !== null &&
            collectionServiceInstanceList !== null
        ) {
            loadServiceInstanceConfigMap();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translateServiceInstanceList, recognizeServiceInstanceList, ttsServiceInstanceList, collectionServiceInstanceList]);

    const loadServiceInstanceConfigMap = async () => {
        const allKeys = [
            ...translateServiceInstanceList,
            ...recognizeServiceInstanceList,
            ...ttsServiceInstanceList,
            ...collectionServiceInstanceList,
        ];
        const entries = await Promise.all(allKeys.map((k) => store.get(k).then((v) => [k, v ?? {}])));
        setServiceInstanceConfigMap(Object.fromEntries(entries));
    };

    // ── Drag-to-reorder ───────────────────────────────────────────────────

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(translateServiceInstanceList);
        const [removed] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, removed);
        setTranslateServiceInstanceList(items);
    };

    // ── Render ────────────────────────────────────────────────────────────

    return (
        pluginList && (
            <div className={`bg-background h-screen w-screen ${
                osType === 'Linux' && 'rounded-[10px] border-1 border-default-100'
            }`}>
                <div className='fixed top-[5px] left-[5px] right-[5px] h-[30px]' data-tauri-drag-region='true' />
                <div className={`h-[35px] w-full flex ${osType === 'Darwin' ? 'justify-end' : 'justify-between'}`}>
                    <Button isIconOnly size='sm' variant='flat' disableAnimation
                        className='my-auto bg-transparent'
                        onPress={togglePin}
                    >
                        <BsPinFill className={`text-[20px] ${pinned ? 'text-primary' : 'text-default-400'}`} />
                    </Button>
                    <Button isIconOnly size='sm' variant='flat' disableAnimation
                        className={`my-auto ${osType === 'Darwin' && 'hidden'} bg-transparent`}
                        onPress={() => appWindow.close()}
                    >
                        <AiFillCloseCircle className='text-[20px] text-default-400' />
                    </Button>
                </div>
                <div className={`${osType === 'Linux' ? 'h-[calc(100vh-37px)]' : 'h-[calc(100vh-35px)]'} px-[8px]`}>
                    <div className='h-full overflow-y-auto'>
                        {serviceInstanceConfigMap !== null && (
                            <SourceArea pluginList={pluginList} serviceInstanceConfigMap={serviceInstanceConfigMap} />
                        )}
                        <div className={`${hideLanguage && 'hidden'}`}>
                            <LanguageArea />
                            <Spacer y={2} />
                        </div>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId='droppable' direction='vertical'>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps}>
                                        {translateServiceInstanceList !== null &&
                                            serviceInstanceConfigMap !== null &&
                                            translateServiceInstanceList.map((serviceInstanceKey, index) => {
                                                const enable = (serviceInstanceConfigMap[serviceInstanceKey] ?? {}).enable ?? true;
                                                return enable ? (
                                                    <Draggable key={serviceInstanceKey} draggableId={serviceInstanceKey} index={index}>
                                                        {(provided) => (
                                                            <div ref={provided.innerRef} {...provided.draggableProps}>
                                                                <TranslateCard
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
                                                ) : null;
                                            })}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>
            </div>
        )
    );
}
