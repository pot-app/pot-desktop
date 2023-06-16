import { useMediaQuery, Grid, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { appWindow } from '@tauri-apps/api/window';
import { useLocation, useRoutes } from 'react-router-dom';
import * as ocrs from '../../interfaces_ocr';
import React, { useEffect, useRef } from 'react';
import { useAtom, useSetAtom, atom } from 'jotai';
import { useTranslation } from 'react-i18next';
import * as interfaces from '../../interfaces';
import SideBar from './components/SideBar';
import TopBar from './components/TopBar';
import { light, dark } from '../themes';
import routes from './routes';
import { get } from '../main';
import './style.css';

export const autoStartAtom = atom(true);
export const autoCheckAtom = atom(true);
export const defaultPinedAtom = atom(true);
export const dynamicTranslateAtom = atom(false);
export const incrementalTranslationAtom = atom(false);
export const deleteNewlineAtom = atom(false);
export const openaiStreamAtom = atom(false);
export const hideSourceAtom = atom(false);
export const hideLanguageAtom = atom(false);
export const autoCopyAtom = atom(4);
export const appLanguageAtom = atom('zh_cn');
export const targetLanguageAtom = atom('zh_cn');
export const secondLanguageAtom = atom('en');
export const defaultInterfaceListAtom = atom(['deepl', 'bing']);
export const rememberTargetLanguageAtom = atom(true);
export const rememberWindowSizeAtom = atom(false);
export const proxyAtom = atom('');
export const defaultWindowAtom = atom('config');
export const themeAtom = atom('auto');
export const windowWidthAtom = atom(400);
export const windowHeightAtom = atom(500);
export const ankiEnableAtom = atom(false);
export const eudicEnableAtom = atom(false);
export const eudicCategoryNameAtom = atom('');
export const eudicTokenAtom = atom('');
export const openaiServiceAtom = atom('openai');
export const interfaceConfigsAtom = atom({});
export const ocrInterfaceConfigsAtom = atom({});
export const shortcutTranslateAtom = atom('');
export const shortcutPersistentAtom = atom('');
export const shortcutScreenshotAtom = atom('');
export const shortcutScreenshotTranslateAtom = atom('');
export const fontSizeAtom = atom('1rem');
export const ocrInterfaceAtom = atom('tesseract');
export const screenshotTranslateInterfaceAtom = atom('tesseract');
export const ocrLanguageAtom = atom('en');
export const ocrCopyAtom = atom(false);

export default function Config() {
    const setShortcutTranslate = useSetAtom(shortcutTranslateAtom);
    const setShortcutPersistent = useSetAtom(shortcutPersistentAtom);
    const setShortcutScreenshot = useSetAtom(shortcutScreenshotAtom);
    const setShortcutScreenshotTranslate = useSetAtom(shortcutScreenshotTranslateAtom);
    const setOpenaiService = useSetAtom(openaiServiceAtom);
    const setInterfaceConfigs = useSetAtom(interfaceConfigsAtom);
    const setOcrInterfaceConfigs = useSetAtom(ocrInterfaceConfigsAtom);
    const setAutoStart = useSetAtom(autoStartAtom);
    const setAutoCheck = useSetAtom(autoCheckAtom);
    const setDefaultPined = useSetAtom(defaultPinedAtom);
    const setDynamicTranslate = useSetAtom(dynamicTranslateAtom);
    const setIncrementalTranslation = useSetAtom(incrementalTranslationAtom);
    const setDeleteNewline = useSetAtom(deleteNewlineAtom);
    const setOpenaiStream = useSetAtom(openaiStreamAtom);
    const setHideSource = useSetAtom(hideSourceAtom);
    const setHideLanguage = useSetAtom(hideLanguageAtom);
    const setAutoCopy = useSetAtom(autoCopyAtom);
    const setAppLanguage = useSetAtom(appLanguageAtom);
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
    const setOcrInterface = useSetAtom(ocrInterfaceAtom);
    const setScreenshotTranslateInterface = useSetAtom(screenshotTranslateInterfaceAtom);
    const setOcrLanguage = useSetAtom(ocrLanguageAtom);
    const setOcrCopy = useSetAtom(ocrCopyAtom);
    const [theme, setTheme] = useAtom(themeAtom);

    const { i18n } = useTranslation();

    const boxWrapperRef = useRef();
    const location = useLocation();

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const page = useRoutes(routes);

    useEffect(() => {
        boxWrapperRef.current.scrollTop = 0;
    }, [location]);

    useEffect(() => {
        if (appWindow.label !== 'util') {
            void appWindow.show();
            void appWindow.setFocus();
        }

        setShortcutTranslate(get('shortcut_translate') ?? '');
        setShortcutPersistent(get('shortcut_persistent') ?? '');
        setShortcutScreenshot(get('shortcut_screenshot') ?? '');
        setShortcutScreenshotTranslate(get('shortcut_screenshot_translate') ?? '');
        setAutoStart(get('auto_start') ?? false);
        setAutoCheck(get('auto_check') ?? true);
        setDefaultPined(get('default_pined') ?? true);
        setDynamicTranslate(get('dynamic_translate') ?? false);
        setIncrementalTranslation(get('incremental_translation') ?? false);
        setDeleteNewline(get('delete_newline') ?? false);
        setOpenaiStream(get('openai_stream') ?? false);
        setHideSource(get('hide_source') ?? false);
        setHideLanguage(get('hide_language') ?? false);
        setAutoCopy(get('auto_copy') ?? 4);
        setAppLanguage(get('app_language') ?? 'zh_cn');
        setTargetLanguage(get('target_language') ?? 'zh_cn');
        setSecondLanguage(get('second_language') ?? 'en');
        setDefaultInterfaceList(get('default_interface_list') ?? ['deepl', 'bing']);
        setRememberTargetLanguage(get('remember_target_language') ?? true);
        setRememberWindowSize(get('remember_window_size') ?? false);
        setProxy(get('proxy') ?? '');
        setDefaultWindow(get('default_window') ?? 'config');
        setWindowWidth(get('window_width') ?? 400);
        setWindowHeight(get('window_height') ?? 500);
        setAnkiEnable(get('anki_enable') ?? false);
        setEudicEnable(get('eudic_enable') ?? false);
        setEudicCategoryName(get('eudic_category_name') ?? 'pot');
        setEudicToken(get('eudic_token') ?? '');
        setTheme(get('theme') ?? 'auto');
        setOpenaiService(get('openai_service') ?? 'openai');
        setFontSize(get('font_size') ?? '1rem');
        setOcrInterface(get('ocr_interface') ?? 'tesseract');
        setScreenshotTranslateInterface(get('screenshot_translate_interface') ?? 'tesseract');
        setOcrLanguage(get('ocr_language') ?? 'en');
        setOcrCopy(get('ocr_copy') ?? false);

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
                    needs_place_hold: n['place_hold'],
                    needs_config_value: get(n['config_key']) ?? '',
                });
            });
        });
        setInterfaceConfigs(interface_configs);

        let ocr_interface_configs = {};

        Object.keys(ocrs).map((i) => {
            ocr_interface_configs[i] = {
                interface_key: i,
                interface_name: ocrs[i]['info']['name'],
                needs: [],
            };
            const needs = ocrs[i]['info']['needs'];
            needs.map((n) => {
                ocr_interface_configs[i]['needs'].push({
                    needs_config_key: n['config_key'],
                    needs_place_hold: n['place_hold'],
                    needs_config_value: get(n['config_key']) ?? '',
                });
            });
        });
        setOcrInterfaceConfigs(ocr_interface_configs);

        i18n.changeLanguage(get('app_language') ?? 'zh_cn');
    }, []);

    return (
        <ThemeProvider theme={theme === 'auto' ? (prefersDarkMode ? dark : light) : theme === 'dark' ? dark : light}>
            <CssBaseline />
            <div
                data-tauri-drag-region='true'
                className='titlebar'
            />
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
                    item
                    xs
                    sx={{ height: '100%' }}
                >
                    <TopBar />
                    <Box
                        ref={boxWrapperRef}
                        sx={{ height: '100%', overflow: 'auto' }}
                    >
                        {page}
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
