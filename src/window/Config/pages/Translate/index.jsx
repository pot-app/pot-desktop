import { DropdownTrigger } from '@nextui-org/react';
import { DropdownMenu } from '@nextui-org/react';
import { DropdownItem } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { CardBody } from '@nextui-org/react';
import { Dropdown } from '@nextui-org/react';
import { Switch } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { Card } from '@nextui-org/react';
import React from 'react';

import { languageList } from '../../../../utils/language';
import { useConfig } from '../../../../hooks/useConfig';
import { invoke } from '@tauri-apps/api';

export default function Translate() {
    const [sourceLanguage, setSourceLanguage] = useConfig('translate_source_language', 'auto');
    const [targetLanguage, setTargetLanguage] = useConfig('translate_target_language', 'zh_cn');
    const [secondLanguage, setSecondLanguage] = useConfig('translate_second_language', 'en');
    const [detectEngine, setDetectEngine] = useConfig('translate_detect_engine', 'baidu');
    const [autoCopy, setAutoCopy] = useConfig('translate_auto_copy', 'disable');
    const [incrementalTranslate, setIncrementalTranslate] = useConfig('incremental_translate', false);
    const [historyDisable, setHistoryDisable] = useConfig('history_disable', false);
    const [dynamicTranslate, setDynamicTranslate] = useConfig('dynamic_translate', false);
    const [deleteNewline, setDeleteNewline] = useConfig('translate_delete_newline', false);
    const [rememberLanguage, setRememberLanguage] = useConfig('translate_remember_language', false);
    // const [translateFontSize, setTranslateFontSize] = useConfig('translate_font_size', 16);
    const [windowPosition, setWindowPosition] = useConfig('translate_window_position', 'mouse');
    const [rememberWindowSize, setRememberWindowSize] = useConfig('translate_remember_window_size', false);
    const [hideSource, setHideSource] = useConfig('hide_source', false);
    const [hideLanguage, setHideLanguage] = useConfig('hide_language', false);
    const [hideWindow, setHideWindow] = useConfig('translate_hide_window', false);
    const [closeOnBlur, setCloseOnBlur] = useConfig('translate_close_on_blur', true);
    const [alwaysOnTop, setAlwaysOnTop] = useConfig('translate_always_on_top', false);
    const { t } = useTranslation();

    return (
        <>
            <Card className='mb-[10px]'>
                <CardBody>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.source_language')}</h3>
                        {sourceLanguage !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{t(`languages.${sourceLanguage}`)}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='source language'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setSourceLanguage(key);
                                    }}
                                >
                                    <DropdownItem key='auto'>{t('languages.auto')}</DropdownItem>
                                    {languageList.map((item) => {
                                        return <DropdownItem key={item}>{t(`languages.${item}`)}</DropdownItem>;
                                    })}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.target_language')}</h3>
                        {targetLanguage !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{t(`languages.${targetLanguage}`)}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='target language'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setTargetLanguage(key);
                                    }}
                                >
                                    {languageList.map((item) => {
                                        return <DropdownItem key={item}>{t(`languages.${item}`)}</DropdownItem>;
                                    })}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.second_language')}</h3>
                        {secondLanguage !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{t(`languages.${secondLanguage}`)}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='second language'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setSecondLanguage(key);
                                    }}
                                >
                                    {languageList.map((item) => {
                                        return <DropdownItem key={item}>{t(`languages.${item}`)}</DropdownItem>;
                                    })}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.detect_engine')}</h3>
                        {detectEngine !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{t(`config.translate.${detectEngine}`)}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='detect engine'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setDetectEngine(key);
                                    }}
                                >
                                    <DropdownItem key='baidu'>{t(`config.translate.baidu`)}</DropdownItem>
                                    <DropdownItem key='tencent'>{t(`config.translate.tencent`)}</DropdownItem>
                                    <DropdownItem key='niutrans'>{t(`config.translate.niutrans`)}</DropdownItem>
                                    <DropdownItem key='google'>{t(`config.translate.google`)}</DropdownItem>
                                    <DropdownItem key='bing'>{t(`config.translate.bing`)}</DropdownItem>
                                    <DropdownItem key='yandex'>{t(`config.translate.yandex`)}</DropdownItem>
                                    <DropdownItem key='local'>{t(`config.translate.local`)}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                </CardBody>
            </Card>
            <Card className='mb-[10px]'>
                <CardBody>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.auto_copy')}</h3>
                        {autoCopy !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{t(`config.translate.${autoCopy}`)}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='auto copy'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setAutoCopy(key);
                                        invoke('update_tray', { language: '', copyMode: key });
                                    }}
                                >
                                    <DropdownItem key='source'>{t('config.translate.source')}</DropdownItem>
                                    <DropdownItem key='target'>{t('config.translate.target')}</DropdownItem>
                                    <DropdownItem key='source_target'>
                                        {t('config.translate.source_target')}
                                    </DropdownItem>
                                    <DropdownItem key='disable'>{t('config.translate.disable')}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3>{t('config.translate.history_disable')}</h3>
                        {historyDisable !== null && (
                            <Switch
                                isSelected={historyDisable}
                                onValueChange={(v) => {
                                    setHistoryDisable(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.incremental_translate')}</h3>
                        {incrementalTranslate !== null && (
                            <Switch
                                isSelected={incrementalTranslate}
                                onValueChange={(v) => {
                                    setIncrementalTranslate(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.dynamic_translate')}</h3>
                        {dynamicTranslate !== null && (
                            <Switch
                                isSelected={dynamicTranslate}
                                onValueChange={(v) => {
                                    setDynamicTranslate(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.delete_newline')}</h3>
                        {deleteNewline !== null && (
                            <Switch
                                isSelected={deleteNewline}
                                onValueChange={(v) => {
                                    setDeleteNewline(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.remember_language')}</h3>
                        {rememberLanguage !== null && (
                            <Switch
                                isSelected={rememberLanguage}
                                onValueChange={(v) => {
                                    setRememberLanguage(v);
                                }}
                            />
                        )}
                    </div>
                </CardBody>
            </Card>
            <Card>
                <CardBody>
                    {/* <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.font_size.title')}</h3>
                        {translateFontSize !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>
                                        {t(`config.translate.font_size.${translateFontSize}`)}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='window position'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setTranslateFontSize(key);
                                    }}
                                >
                                    <DropdownItem key={10}>{t(`config.translate.font_size.10`)}</DropdownItem>
                                    <DropdownItem key={12}>{t(`config.translate.font_size.12`)}</DropdownItem>
                                    <DropdownItem key={14}>{t(`config.translate.font_size.14`)}</DropdownItem>
                                    <DropdownItem key={16}>{t(`config.translate.font_size.16`)}</DropdownItem>
                                    <DropdownItem key={18}>{t(`config.translate.font_size.18`)}</DropdownItem>
                                    <DropdownItem key={20}>{t(`config.translate.font_size.20`)}</DropdownItem>
                                    <DropdownItem key={24}>{t(`config.translate.font_size.24`)}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div> */}
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.window_position')}</h3>
                        {windowPosition !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{t(`config.translate.${windowPosition}`)}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='window position'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setWindowPosition(key);
                                    }}
                                >
                                    <DropdownItem key='mouse'>{t('config.translate.mouse')}</DropdownItem>
                                    <DropdownItem key='pre_state'>{t('config.translate.pre_state')}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.remember_window_size')}</h3>
                        {rememberWindowSize !== null && (
                            <Switch
                                isSelected={rememberWindowSize}
                                onValueChange={(v) => {
                                    setRememberWindowSize(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.close_on_blur')}</h3>
                        {closeOnBlur !== null && (
                            <Switch
                                isSelected={closeOnBlur}
                                onValueChange={(v) => {
                                    setCloseOnBlur(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.always_on_top')}</h3>
                        {alwaysOnTop !== null && (
                            <Switch
                                isSelected={alwaysOnTop}
                                onValueChange={(v) => {
                                    setAlwaysOnTop(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.hide_source')}</h3>
                        {hideSource !== null && (
                            <Switch
                                isSelected={hideSource}
                                onValueChange={(v) => {
                                    setHideSource(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.hide_language')}</h3>
                        {hideLanguage !== null && (
                            <Switch
                                isSelected={hideLanguage}
                                onValueChange={(v) => {
                                    setHideLanguage(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.hide_window')}</h3>
                        {hideWindow !== null && (
                            <Switch
                                isSelected={hideWindow}
                                onValueChange={(v) => {
                                    setHideWindow(v);
                                }}
                            />
                        )}
                    </div>
                </CardBody>
            </Card>
        </>
    );
}
