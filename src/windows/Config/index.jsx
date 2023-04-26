import { useMediaQuery, Grid } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { appWindow } from '@tauri-apps/api/window';
import { useRoutes } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useAtom, useSetAtom, atom } from 'jotai';
import * as interfaces from '../../interfaces';
import SideBar from './components/SideBar';
import { light, dark } from '../themes';
import routes from './routes';
import { get } from '../main';
import './style.css';

export const autoStartAtom = atom(true);
export const autoCheckAtom = atom(true);
export const dynamicTranslateAtom = atom(false);
export const autoCopyAtom = atom(4);
export const targetLanguageAtom = atom('zh-cn');
export const defaultInterfaceAtom = atom('deepl');
export const proxyAtom = atom('');
export const themeAtom = atom('auto');
export const windowWidthAtom = atom(400);
export const windowHeightAtom = atom(500);
export const ankiEnableAtom = atom(true);
export const interfaceConfigsAtom = atom({});
export const shortcutTranslateAtom = atom('');
export const shortcutPersistentAtom = atom('');
export const shortcutOcrAtom = atom('');

export default function Config() {
  const setShortcutTranslate = useSetAtom(shortcutTranslateAtom);
  const setShortcutPersistent = useSetAtom(shortcutPersistentAtom);
  const setShortcutOcr = useSetAtom(shortcutOcrAtom);
  const setInterfaceConfigs = useSetAtom(interfaceConfigsAtom);
  const setAutoStart = useSetAtom(autoStartAtom);
  const setAutoCheck = useSetAtom(autoCheckAtom);
  const setDynamicTranslate = useSetAtom(dynamicTranslateAtom);
  const setAutoCopy = useSetAtom(autoCopyAtom);
  const setTargetLanguage = useSetAtom(targetLanguageAtom);
  const setDefaultInterface = useSetAtom(defaultInterfaceAtom);
  const setProxy = useSetAtom(proxyAtom);
  const setWindowWidth = useSetAtom(windowWidthAtom);
  const setWindowHeight = useSetAtom(windowHeightAtom);
  const setAnkiEnable = useSetAtom(ankiEnableAtom);
  const [theme, setTheme] = useAtom(themeAtom);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const page = useRoutes(routes);

  useEffect(() => {
    if (appWindow.label != 'util') {
      appWindow.show();
      appWindow.setFocus();
    }

    setShortcutTranslate(get('shortcut_translate') ?? '');
    setShortcutPersistent(get('shortcut_persistent') ?? '');
    setShortcutOcr(get('shortcut_ocr') ?? '');
    setAutoStart(get('auto_start') ?? false);
    setAutoCheck(get('auto_check') ?? false);
    setDynamicTranslate(get('dynamic_translate') ?? false);
    setAutoCopy(get('auto_copy') ?? 4);
    setTargetLanguage(get('target_language') ?? 'zh-cn');
    setDefaultInterface(get('interface') ?? 'deepl');
    setProxy(get('proxy') ?? '');
    setWindowWidth(get('window_width') ?? 400);
    setWindowHeight(get('window_height') ?? 500);
    setAnkiEnable(get('anki_enable') ?? true);
    setTheme(get('theme') ?? 'auto');
    let interface_configs = {};

    Object.keys(interfaces).map(
      i => {
        interface_configs[i] = {
          'enable': get(`${i}_enable`) ?? true,
          'interface_key': i,
          'interface_name': interfaces[i]['info']['name'],
          'needs': []
        }
        const needs = interfaces[i]['info']['needs'];
        needs.map(
          n => {
            interface_configs[i]['needs'].push({
              'needs_config_key': n['config_key'],
              'needs_display_name': n['display_name'],
              'needs_place_hold': n['place_hold'],
              'needs_config_value': get(n['config_key']) ?? ''
            })
          }
        )
      }
    )
    setInterfaceConfigs(interface_configs);
  }, [])

  return (
    <ThemeProvider theme={theme == 'auto' ? (prefersDarkMode ? dark : light) : (theme == 'dark' ? dark : light)}>
      <CssBaseline />
      <Grid className="content" container>
        <Grid item xs='auto' sx={{ height: "100%" }}>
          <SideBar />
        </Grid>
        <Grid item xs sx={{ height: "100%", overflow: 'auto' }}>
          {page}
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

