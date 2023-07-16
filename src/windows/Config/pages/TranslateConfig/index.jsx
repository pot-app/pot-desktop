import { Select, MenuItem, Box, Chip, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import 'flag-icons/css/flag-icons.min.css';
import { useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import React, { useState } from 'react';
import * as interfaces from '../../../../interfaces';
import ConfigList from '../../components/ConfigList';
import ConfigItem from '../../components/ConfigItem';
import language from '../../../../global/language';
import { set } from '../../../../global/config';
import {
    autoCopyAtom,
    dynamicTranslateAtom,
    deleteNewlineAtom,
    openaiStreamAtom,
    targetLanguageAtom,
    secondLanguageAtom,
    defaultInterfaceListAtom,
    rememberTargetLanguageAtom,
    incrementalTranslationAtom,
    hideWindowAtom,
} from '../..';
import './style.css';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

const NO_EXIT_NAME = 'interface-no-exit';

export default function TranslateConfig() {
    const [dynamicTranslate, setDynamicTranslate] = useAtom(dynamicTranslateAtom);
    const [incrementalTranslation, setIncrementalTranslation] = useAtom(incrementalTranslationAtom);
    const [deleteNewline, setDeleteNewline] = useAtom(deleteNewlineAtom);
    const [openaiStream, setOpenaiStream] = useAtom(openaiStreamAtom);
    const [autoCopy, setAutoCopy] = useAtom(autoCopyAtom);
    const [targetLanguage, setTargetLanguage] = useAtom(targetLanguageAtom);
    const [secondLanguage, setSecondLanguage] = useAtom(secondLanguageAtom);
    const [defaultInterfaceList, setDefaultInterfaceList] = useAtom(defaultInterfaceListAtom);
    const [rememberTargetLanguage, setRememberTargetLanguage] = useAtom(rememberTargetLanguageAtom);
    const [hideWindow, setHideWindow] = useAtom(hideWindowAtom);

    const { t } = useTranslation();

    const [isOpen, setIsOpen] = useState(false);
    const [isDrag, setIsDrag] = useState(false);

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const onDragStart = () => {
        setIsDrag(true);
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const items = reorder(defaultInterfaceList, result.source.index, result.destination.index);
        setDefaultInterfaceList(items);
        await set('default_interface_list', items);
        setIsDrag(false);
    };

    return (
        <ConfigList label={t('config.translate.title')}>
            <ConfigItem
                label={t('config.translate.incremental')}
                help={t('config.translate.incrementalhelp')}
            >
                <Switch
                    checked={incrementalTranslation}
                    onChange={async (e) => {
                        setIncrementalTranslation(e.target.checked);
                        await set('incremental_translation', e.target.checked);
                    }}
                />
            </ConfigItem>
            <ConfigItem
                label={t('config.translate.dynamic')}
                help={t('config.translate.dynamichelp')}
            >
                <Switch
                    checked={dynamicTranslate}
                    onChange={async (e) => {
                        setDynamicTranslate(e.target.checked);
                        await set('dynamic_translate', e.target.checked);
                    }}
                />
            </ConfigItem>
            <ConfigItem
                label={t('config.translate.deletenewline')}
                help={t('config.translate.deletenewlinehelp')}
            >
                <Switch
                    checked={deleteNewline}
                    onChange={async (e) => {
                        setDeleteNewline(e.target.checked);
                        await set('delete_newline', e.target.checked);
                    }}
                />
            </ConfigItem>
            <ConfigItem label={t('config.translate.remembertarget')}>
                <Switch
                    checked={rememberTargetLanguage}
                    onChange={async (e) => {
                        setRememberTargetLanguage(e.target.checked);
                        await set('remember_target_language', e.target.checked);
                    }}
                />
            </ConfigItem>
            <ConfigItem
                label={t('config.translate.openaistream')}
                help={t('config.translate.openaistreamhelp')}
            >
                <Switch
                    checked={openaiStream}
                    onChange={async (e) => {
                        setOpenaiStream(e.target.checked);
                        await set('openai_stream', e.target.checked);
                    }}
                />
            </ConfigItem>
            <ConfigItem
                label={t('config.translate.hidewindow')}
                help={t('config.translate.hidewindowhelp')}
            >
                <Switch
                    checked={hideWindow}
                    onChange={async (e) => {
                        setHideWindow(e.target.checked);
                        await set('hide_window', e.target.checked);
                    }}
                />
            </ConfigItem>
            <ConfigItem label={t('config.translate.defaultinterface')}>
                <Select
                    multiple
                    size='small'
                    sx={{ width: '300px' }}
                    value={defaultInterfaceList}
                    onChange={async (e) => {
                        setDefaultInterfaceList(e.target.value);
                        await set('default_interface_list', e.target.value);
                    }}
                    open={isOpen}
                    onClick={(e) => {
                        const { className } = e.target;
                        const noOperation = [
                            'MuiChip-filled',
                            'MuiChip-label',
                            'MuiButtonBase-root',
                            'interface-no-exit',
                        ];

                        if (noOperation.some((n) => className.includes(n)) || isDrag) return;

                        if (isOpen) {
                            return setIsOpen(false);
                        }

                        setIsOpen(true);
                    }}
                    renderValue={(selected) => (
                        <DragDropContext
                            onDragEnd={onDragEnd}
                            onDragStart={onDragStart}
                        >
                            <Droppable
                                droppableId='droppable'
                                direction='horizontal'
                            >
                                {(provided) => (
                                    <Box
                                        sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {selected.map((value, index) => (
                                            <Draggable
                                                key={value}
                                                draggableId={value}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <Chip
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        key={value}
                                                        label={t(
                                                            `config.interface.${interfaces[value]['info']['name']}`
                                                        )}
                                                    />
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </Box>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}
                >
                    {Object.keys(interfaces).map((x) => {
                        return (
                            <MenuItem
                                className={NO_EXIT_NAME}
                                value={x}
                                key={nanoid()}
                            >
                                <Box className={NO_EXIT_NAME}>
                                    <img
                                        src={`/${x}.svg`}
                                        className={`interface-icon ${NO_EXIT_NAME}`}
                                        alt='interface icon'
                                    />
                                    <span className={`interface-name ${NO_EXIT_NAME}`}>
                                        {t(`config.interface.${interfaces[x]['info']['name']}`)}
                                    </span>
                                </Box>
                            </MenuItem>
                        );
                    })}
                </Select>
            </ConfigItem>
            <ConfigItem label={t('config.translate.targetlanguage')}>
                <Select
                    size='small'
                    sx={{ width: '300px' }}
                    value={targetLanguage}
                    onChange={async (e) => {
                        setTargetLanguage(e.target.value);
                        await set('target_language', e.target.value);
                    }}
                >
                    {language.map((x) => {
                        return (
                            <MenuItem
                                value={x.value}
                                key={nanoid()}
                            >
                                <span className={`fi fi-${x.code}`} />
                                <span>{t(`language.${x.value}`)}</span>
                            </MenuItem>
                        );
                    })}
                </Select>
            </ConfigItem>

            <ConfigItem
                label={t('config.translate.secondlanguage')}
                help={t('config.translate.secondlanguagehelp')}
            >
                <Select
                    size='small'
                    sx={{ width: '300px' }}
                    value={secondLanguage}
                    onChange={async (e) => {
                        setSecondLanguage(e.target.value);
                        await set('second_language', e.target.value);
                    }}
                >
                    {language.map((x) => {
                        return (
                            <MenuItem
                                value={x.value}
                                key={nanoid()}
                            >
                                <span className={`fi fi-${x.code}`} />
                                <span>{t(`language.${x.value}`)}</span>
                            </MenuItem>
                        );
                    })}
                </Select>
            </ConfigItem>
            <ConfigItem label={t('config.translate.autocopy')}>
                <Select
                    size='small'
                    sx={{ width: '300px' }}
                    value={autoCopy}
                    onChange={async (e) => {
                        setAutoCopy(e.target.value);
                        await set('auto_copy', e.target.value);
                    }}
                >
                    <MenuItem value={1}>{t('config.translate.input')}</MenuItem>
                    <MenuItem value={2}>{t('config.translate.output')}</MenuItem>
                    <MenuItem value={3}>{t('config.translate.inputoutput')}</MenuItem>
                    <MenuItem value={4}>{t('config.translate.close')}</MenuItem>
                </Select>
            </ConfigItem>
        </ConfigList>
    );
}
