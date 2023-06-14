import { TextField, Select, MenuItem, Box, InputAdornment, Button, Switch } from '@mui/material';
import { enable, isEnabled, disable } from 'tauri-plugin-autostart-api';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import 'flag-icons/css/flag-icons.min.css';
import { useAtom } from 'jotai';
// import { nanoid } from 'nanoid';
import React, { useState, useEffect } from 'react';
import ConfigList from '../../components/ConfigList';
import ConfigItem from '../../components/ConfigItem';
// import language from '../../../../global/language';
import { set } from '../../../../global/config';
import {
    autoStartAtom,
    autoCheckAtom,
    defaultPinedAtom,
    proxyAtom,
    appLanguageAtom,
    defaultWindowAtom,
    windowHeightAtom,
    windowWidthAtom,
    themeAtom,
    hideSourceAtom,
    hideLanguageAtom,
    rememberWindowSizeAtom,
    fontSizeAtom,
} from '../..';
import { invoke } from '@tauri-apps/api/tauri';

export default function AppConfig() {
    const [isLinux, setIsLinux] = useState(false);
    const [autoStart, setAutoStart] = useAtom(autoStartAtom);
    const [autoCheck, setAutoCheck] = useAtom(autoCheckAtom);
    const [defaultPined, setDefaultPined] = useAtom(defaultPinedAtom);
    const [proxy, setProxy] = useAtom(proxyAtom);
    const [appLanguage, setAppLanguage] = useAtom(appLanguageAtom);
    const [defaultWindow, setDefaultWindow] = useAtom(defaultWindowAtom);
    const [windowWidth, setWindowWidth] = useAtom(windowWidthAtom);
    const [windowHeight, setWindowHeight] = useAtom(windowHeightAtom);
    const [hideSource, setHideSource] = useAtom(hideSourceAtom);
    const [hideLanguage, setHideLanguage] = useAtom(hideLanguageAtom);
    const [rememberWindowSize, setRememberWindowSize] = useAtom(rememberWindowSizeAtom);
    const [fontSize, setFontSize] = useAtom(fontSizeAtom);
    const [theme, setTheme] = useAtom(themeAtom);

    const { t, i18n } = useTranslation();
    const muitheme = useTheme();

    useEffect(() => {
        invoke('is_linux').then((v) => {
            setIsLinux(v);
        });
    });

    return (
        <>
            <Toaster />
            <ConfigList label={t('config.app.title')}>
                <ConfigItem label={t('config.app.autostart')}>
                    <Switch
                        checked={autoStart}
                        onChange={async (e) => {
                            setAutoStart(e.target.checked);
                            if (e.target.checked) {
                                isEnabled().then((v) => {
                                    if (!v) {
                                        enable().then((_) => {
                                            toast.success(t('config.app.autostarton'), {
                                                style: {
                                                    background: muitheme.palette.background.default,
                                                    color: muitheme.palette.text.primary,
                                                },
                                            });
                                        });
                                    }
                                });
                            } else {
                                isEnabled().then((v) => {
                                    if (v) {
                                        disable().then((_) => {
                                            toast.success(t('config.app.autostartoff'), {
                                                style: {
                                                    background: muitheme.palette.background.default,
                                                    color: muitheme.palette.text.primary,
                                                },
                                            });
                                        });
                                    }
                                });
                            }
                            await set('auto_start', e.target.checked);
                        }}
                    />
                </ConfigItem>
                <ConfigItem label={t('config.app.autocheck')}>
                    <Switch
                        checked={autoCheck}
                        onChange={async (e) => {
                            setAutoCheck(e.target.checked);
                            await set('auto_check', e.target.checked);
                        }}
                    />
                </ConfigItem>
                <ConfigItem label={t('config.app.defaultpined')}>
                    <Switch
                        checked={defaultPined}
                        onChange={async (e) => {
                            setDefaultPined(e.target.checked);
                            await set('default_pined', e.target.checked);
                        }}
                    />
                </ConfigItem>
                <ConfigItem label={t('config.app.hideinput')}>
                    <Switch
                        checked={hideSource}
                        onChange={async (e) => {
                            setHideSource(e.target.checked);
                            await set('hide_source', e.target.checked);
                        }}
                    />
                </ConfigItem>
                <ConfigItem label={t('config.app.hidelanguageselector')}>
                    <Switch
                        checked={hideLanguage}
                        onChange={async (e) => {
                            setHideLanguage(e.target.checked);
                            await set('hide_language', e.target.checked);
                        }}
                    />
                </ConfigItem>
                <ConfigItem label={t('config.app.rememberwindowsize')}>
                    <Switch
                        checked={rememberWindowSize}
                        onChange={async (e) => {
                            setRememberWindowSize(e.target.checked);
                            await set('remember_window_size', e.target.checked);
                        }}
                    />
                </ConfigItem>
                <ConfigItem label={t('config.app.applanguage')}>
                    <Select
                        size='small'
                        sx={{ width: '300px' }}
                        value={appLanguage}
                        onChange={async (e) => {
                            setAppLanguage(e.target.value);
                            await set('app_language', e.target.value);
                            i18n.changeLanguage(e.target.value);
                        }}
                    >
                        <MenuItem value='zh_cn'>
                            <span className={'fi fi-cn'} />
                            <span>简体中文</span>
                        </MenuItem>
                        <MenuItem value='zh_tw'>
                            <span className={'fi fi-cn'} />
                            <span>繁體中文</span>
                        </MenuItem>
                        <MenuItem value='en'>
                            <span className={'fi fi-gb'} />
                            <span>English</span>
                        </MenuItem>
                        <MenuItem value='ru'>
                            <span className={'fi fi-ru'} />
                            <span>Русский</span>
                        </MenuItem>
                        {/* {language.map((x) => {
                            return (
                                <MenuItem
                                    value={x.value}
                                    key={nanoid()}
                                >
                                    <span className={`fi fi-${x.code}`} />
                                    <span>{t(`language.${x.value}`)}</span>
                                </MenuItem>
                            );
                        })} */}
                    </Select>
                </ConfigItem>
                <ConfigItem label={t('config.app.proxy')}>
                    <TextField
                        // fullWidth
                        size='small'
                        value={proxy}
                        sx={{ width: '300px' }}
                        placeholder='eg:http://127.0.0.1:7890'
                        onChange={async (e) => {
                            setProxy(e.target.value);
                            await set('proxy', e.target.value);
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <Button
                                        size='small'
                                        variant='outlined'
                                        onClick={async () => {
                                            await invoke('set_proxy', { proxy });
                                        }}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        {t('common.apply')}
                                    </Button>
                                </InputAdornment>
                            ),
                        }}
                    />
                </ConfigItem>
                {isLinux ? (
                    <></>
                ) : (
                    <ConfigItem label={t('config.app.trayclick')}>
                        <Select
                            // fullWidth
                            size='small'
                            value={defaultWindow}
                            sx={{ width: '300px' }}
                            onChange={async (e) => {
                                setDefaultWindow(e.target.value);
                                await set('default_window', e.target.value);
                            }}
                        >
                            <MenuItem value='none'>None</MenuItem>
                            <MenuItem value='config'>{t('config.title')}</MenuItem>
                            <MenuItem value='persistent'>{t('translator.title')}</MenuItem>
                        </Select>
                    </ConfigItem>
                )}
                <ConfigItem label={t('config.app.theme')}>
                    <Select
                        // fullWidth
                        sx={{ width: '300px' }}
                        size='small'
                        value={theme}
                        onChange={async (e) => {
                            setTheme(e.target.value);
                            await set('theme', e.target.value);
                        }}
                    >
                        <MenuItem value='auto'>{t('config.app.system')}</MenuItem>
                        <MenuItem value='light'>{t('config.app.light')}</MenuItem>
                        <MenuItem value='dark'>{t('config.app.dark')}</MenuItem>
                    </Select>
                </ConfigItem>
                <ConfigItem label={t('config.app.defaultsize')}>
                    <Box>
                        <TextField
                            label={t('config.app.width')}
                            size='small'
                            sx={{ width: '142px' }}
                            value={windowWidth}
                            onChange={async (event) => {
                                setWindowWidth(Number(event.target.value));
                                await set('window_width', Number(event.target.value));
                            }}
                        />
                        <TextField
                            label={t('config.app.height')}
                            size='small'
                            sx={{ width: '142px', marginLeft: '16px' }}
                            value={windowHeight}
                            onChange={async (event) => {
                                setWindowHeight(Number(event.target.value));
                                await set('window_height', Number(event.target.value));
                            }}
                        />
                    </Box>
                </ConfigItem>
                <ConfigItem
                    label={t('config.app.fontsize')}
                    help={t('config.app.fontsizehelp')}
                >
                    <TextField
                        size='small'
                        value={fontSize}
                        sx={{ width: '300px' }}
                        placeholder='eg:1rem or 16px'
                        onChange={async (e) => {
                            setFontSize(e.target.value);
                            await set('font_size', e.target.value);
                        }}
                    />
                </ConfigItem>
            </ConfigList>
        </>
    );
}
