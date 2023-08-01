import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { appWindow } from '@tauri-apps/api/window';
import { useMediaQuery, Grid } from '@mui/material';
import React, { useEffect } from 'react';
import LanguageSelector from './components/LanguageSelector';
import TargetArea from './components/TargetArea';
import SourceArea from './components/SourceArea';
import { useTranslation } from 'react-i18next';
import TopBar from './components/TopBar';
import { light, dark } from '../themes';
import { get } from '../main';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { set } from '../../global/config.js';
import { useAtom } from 'jotai';
import { defaultInterfaceListAtom } from '../Config/index.jsx';

export default function Translator() {
    const theme = get('theme') ?? 'auto';
    const { i18n } = useTranslation();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [interfaceList, setInterfaceList] = useAtom(defaultInterfaceListAtom);

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const items = reorder(interfaceList, result.source.index, result.destination.index);
        setInterfaceList(items);
        await set('default_interface_list', items);
    };

    useEffect(() => {
        if (appWindow.label !== 'util') {
            if ((get('hide_window') ?? false) && appWindow.label !== 'persistent') {
                void appWindow.hide();
            } else {
                void appWindow.show();
                void appWindow.setFocus();
            }
        }
        setInterfaceList(get('default_interface_list') ?? ['deepl', 'bing']);
        i18n.changeLanguage(get('app_language') ?? 'en');
    }, []);
    return (
        <ThemeProvider theme={theme === 'auto' ? (prefersDarkMode ? dark : light) : theme === 'dark' ? dark : light}>
            <CssBaseline />
            <div
                data-tauri-drag-region='true'
                className='titlebar'
            />
            <TopBar />
            <Grid
                container
                direction='column'
                height='calc(100vh - 50px)'
                style={{ overflow: 'hidden' }}
            >
                <Grid
                    style={{
                        width: '100%',
                        display: appWindow.label !== 'persistent' && (get('hide_source') ?? false) ? 'none' : '',
                    }}
                >
                    <SourceArea />
                </Grid>
                <Grid
                    style={{
                        width: '100%',
                        display: appWindow.label !== 'persistent' && (get('hide_language') ?? false) ? 'none' : '',
                    }}
                >
                    <LanguageSelector />
                </Grid>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable
                        droppableId='droppable'
                        direction='vertical'
                    >
                        {(provided) => (
                            <Grid
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                item
                                style={{
                                    width: '100%',
                                    overflow: 'auto',
                                    marginTop: '8px',
                                }}
                                xs
                            >
                                {interfaceList.map((x, index) => {
                                    return (
                                        <Draggable
                                            key={x}
                                            draggableId={x}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    style={{ height: interfaceList.length === 1 && '100%' }}
                                                >
                                                    <TargetArea
                                                        {...provided.dragHandleProps}
                                                        i={x}
                                                        q={index}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </Grid>
                        )}
                    </Droppable>
                </DragDropContext>
            </Grid>
        </ThemeProvider>
    );
}
