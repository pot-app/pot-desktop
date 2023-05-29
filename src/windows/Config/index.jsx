import { useMediaQuery, Grid } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { appWindow } from '@tauri-apps/api/window';
import { useLocation, useRoutes } from 'react-router-dom';
import React, { useEffect, useRef } from 'react';
import { useAtom, useSetAtom, atom } from 'jotai';
import * as interfaces from '../../interfaces';
import SideBar from './components/SideBar';
import { light, dark } from '../themes';
import routes from './routes';
import { get } from '../main';
import './style.css';

export const autoStartAtom = atom(true);
export const autoCheckAtom = atom(true);
export const defaultPinedAtom = atom(true);
export const dynamicTranslateAtom = atom(false);
export const deleteNewlineAtom = atom(false);
export const openaiStreamAtom = atom(false);
export const hideSourceAtom = atom(false);
export const hideLanguageAtom = atom(false);
export const autoCopyAtom = atom(4);
export const targetLanguageAtom = atom('zh-cn');
export const secondLanguageAtom = atom('en');
export const defaultInterfaceListAtom = atom(['deepl', 'bing']);
export const rememberTargetLanguageAtom = atom(true);
export const rememberWindowSizeAtom = atom(false);
export const proxyAtom = atom('');
export const defaultWindowAtom = atom('config');
export const themeAtom = atom('auto');
export const windowWidthAtom = atom(400);
export const windowHeightAtom = atom(500);
export const ankiEnableAtom = atom(true);
export const eudicEnableAtom = atom(true);
export const eudicCategoryNameAtom = atom('');
export const eudicTokenAtom = atom('');
export const openaiServiceAtom = atom('openai');
export const interfaceConfigsAtom = atom({});
export const shortcutTranslateAtom = atom('');
export const shortcutPersistentAtom = atom('');
export const shortcutOcrAtom = atom('');
export const fontSizeAtom = atom('1rem');

export default function Config() {
    const setShortcutTranslate = useSetAtom(shortcutTranslateAtom);
    const setShortcutPersistent = useSetAtom(shortcutPersistentAtom);
    const setShortcutOcr = useSetAtom(shortcutOcrAtom);
    const setOpenaiService = useSetAtom(openaiServiceAtom);
    const setInterfaceConfigs = useSetAtom(interfaceConfigsAtom);
    const setAutoStart = useSetAtom(autoStartAtom);
    const setAutoCheck = useSetAtom(autoCheckAtom);
    const setDefaultPined = useSetAtom(defaultPinedAtom);
    const setDynamicTranslate = useSetAtom(dynamicTranslateAtom);
    const setDeleteNewline = useSetAtom(deleteNewlineAtom);
    const setOpenaiStream = useSetAtom(openaiStreamAtom);
    const setHideSource = useSetAtom(hideSourceAtom);
    const setHideLanguage = useSetAtom(hideLanguageAtom);
    const setAutoCopy = useSetAtom(autoCopyAtom);
    const setTargetLanguage = useSetAtom(targetLanguageAtom);
    const setSecondLanguage = useSetAtom(secondLanguageAtom);
    const setDefaultInterfaceList = useSetAtom(defaultInterfaceListAtom);
    const setRememberTargetLanguage = useSetAtom(rememberTargetLanguageAtom);
    const setRememberWindowSize = useSetAtom(rememberWindowSizeAtom);
    const setProxy = useSetAtom(proxyAtom);
    const setDefaultWindow = useSetAtom(defaultWindowAtom);
    const setWindowWidth = useSetAtom(windowWidthAtom);
    const setWindowHeight = useSetAtom(windowHeightAtom);
    const setAnkiEnable = useSetAtom(ankiEnableAtom);
    const setEudicEnable = useSetAtom(eudicEnableAtom);
    const setEudicCategoryName = useSetAtom(eudicCategoryNameAtom);
    const setEudicToken = useSetAtom(eudicTokenAtom);
    const setFontSize = useSetAtom(fontSizeAtom);
    const [theme, setTheme] = useAtom(themeAtom);

    const gridWrapperRef = useRef();
    const location = useLocation();

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const page = useRoutes(routes);

    useEffect(() => {
        gridWrapperRef.current.scrollTop = 0;
    }, [location]);

    useEffect(() => {
        if (appWindow.label !== 'util') {
            appWindow.show().then(() => {});
            appWindow.setFocus().then(() => {});
        }

        setShortcutTranslate(get('shortcut_translate') ?? '');
        setShortcutPersistent(get('shortcut_persistent') ?? '');
        setShortcutOcr(get('shortcut_ocr') ?? '');
        setAutoStart(get('auto_start') ?? false);
        setAutoCheck(get('auto_check') ?? true);
        setDefaultPined(get('default_pined') ?? true);
        setDynamicTranslate(get('dynamic_translate') ?? false);
        setDeleteNewline(get('delete_newline') ?? false);
        setOpenaiStream(get('openai_stream') ?? false);
        setHideSource(get('hide_source') ?? false);
        setHideLanguage(get('hide_language') ?? false);
        setAutoCopy(get('auto_copy') ?? 4);
        setTargetLanguage(get('target_language') ?? 'zh-cn');
        setSecondLanguage(get('second_language') ?? 'en');
        setDefaultInterfaceList(get('default_interface_list') ?? ['deepl', 'bing']);
        setRememberTargetLanguage(get('remember_target_language') ?? true);
        setRememberWindowSize(get('remember_window_size') ?? false);
        setProxy(get('proxy') ?? '');
        setDefaultWindow(get('default_window') ?? 'config');
        setWindowWidth(get('window_width') ?? 400);
        setWindowHeight(get('window_height') ?? 500);
        setAnkiEnable(get('anki_enable') ?? true);
        setEudicEnable(get('eudic_enable') ?? true);
        setEudicCategoryName(get('eudic_category_name') ?? 'pot');
        setEudicToken(get('eudic_token') ?? '');
        setTheme(get('theme') ?? 'auto');
        setOpenaiService(get('openai_service') ?? 'openai');
        setFontSize(get('font_size') ?? '1rem');

        let interface_configs = {};

        Object.keys(interfaces).map((i) => {
            interface_configs[i] = {
                interface_key: i,
                interface_name: interfaces[i]['info']['name'],
                needs: [],
            };
            const needs = interfaces[i]['info']['needs'];
            needs.map((n) => {
                interface_configs[i]['needs'].push({
                    needs_config_key: n['config_key'],
                    needs_display_name: n['display_name'],
                    needs_place_hold: n['place_hold'],
                    needs_config_value: get(n['config_key']) ?? '',
                });
            });
        });
        setInterfaceConfigs(interface_configs);
    }, []);

    return (
        <ThemeProvider theme={theme === 'auto' ? (prefersDarkMode ? dark : light) : theme === 'dark' ? dark : light}>
            <CssBaseline />
            <Grid
                className='content'
                container
            >
                <Grid
                    item
                    xs='auto'
                    sx={{ height: '100%' }}
                >
                    <SideBar />
                </Grid>
                <Grid
                    ref={gridWrapperRef}
                    item
                    xs
                    sx={{ height: '100%', overflow: 'auto' }}
                >
                    {page}
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
