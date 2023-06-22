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

export default function Translator() {
    const theme = get('theme') ?? 'auto';
    const interfaceList = get('default_interface_list') ?? ['deepl', 'bing'];
    const { i18n } = useTranslation();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const onDragStart = () => {
        // TODO: implement
        // setIsDrag(true);
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        // TODO: implement
        // const items = reorder(defaultInterfaceList, result.source.index, result.destination.index);
        // setDefaultInterfaceList(items);
        // await set('default_interface_list', items);
        // setIsDrag(false);
    };

    useEffect(() => {
        if (appWindow.label !== 'util') {
            void appWindow.show();
            void appWindow.setFocus();
        }
        i18n.changeLanguage(get('app_language') ?? 'zh_cn');
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
                        display: appWindow.label !== 'persistent' && (get('hide_source') ?? false) ? 'none' : '',
                    }}
                >
                    <LanguageSelector />
                </Grid>
                {/* TODO: drag item */}
                <DragDropContext
                    onDragEnd={onDragEnd}
                    onDragStart={onDragStart}
                >
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
                                                    {...provided.dragHandleProps}
                                                >
                                                    <TargetArea
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
