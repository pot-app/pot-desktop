import { enable, isEnabled, disable } from "tauri-plugin-autostart-api";
import { Button, useMediaQuery } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { notification } from '@tauri-apps/api'
import { useAtomValue } from 'jotai';
import React from 'react'
import { set, writeConfig } from '../../global/config'
import ShortCutConfig from './components/ShortCutConfig';
import InterfaceConfig from './components/InterfaceConfig';
import AppConfig from './components/AppConfig';
import AppInfo from './components/AppInfo';
import { interfaceConfigsAtom } from './components/InterfaceConfig';
import {
  shortcutTranslateAtom,
  shortcutPersistentAtom,
  shortcutOcrAtom
} from './components/ShortCutConfig';
import {
  themeAtom,
  autoStartAtom,
  autoCheckAtom,
  autoCopyAtom,
  targetLanguageAtom,
  defaultInterfaceAtom,
  proxyAtom,
  windowWidthAtom,
  windowHeightAtom
} from './components/AppConfig';
import { light, dark } from '../themes';
import './style.css'

export default function App() {
  const interfaceConfigs = useAtomValue(interfaceConfigsAtom);
  const shortcutTranslate = useAtomValue(shortcutTranslateAtom);
  const shortcutPersistent = useAtomValue(shortcutPersistentAtom);
  const shortcutOcr = useAtomValue(shortcutOcrAtom);
  const autoStart = useAtomValue(autoStartAtom);
  const autoCheck = useAtomValue(autoCheckAtom);
  const autoCopy = useAtomValue(autoCopyAtom);
  const targetLanguage = useAtomValue(targetLanguageAtom);
  const defaultInterface = useAtomValue(defaultInterfaceAtom);
  const proxy = useAtomValue(proxyAtom);
  const windowWidth = useAtomValue(windowWidthAtom);
  const windowHeight = useAtomValue(windowHeightAtom);
  const theme = useAtomValue(themeAtom);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  async function saveConfig() {
    await set('shortcut_translate', shortcutTranslate);
    await set('shortcut_persistent', shortcutPersistent);
    await set('shortcut_ocr', shortcutOcr);
    await set('auto_start', autoStart);
    await set('auto_check', autoCheck);
    await set('auto_copy', autoCopy);
    await set('target_language', targetLanguage);
    await set('theme', theme);
    await set('window_width', windowWidth);
    await set('window_height', windowHeight);
    await set('interface', defaultInterface);
    await set('proxy', proxy);
    Object.keys(interfaceConfigs).map(
      async x => {
        await set(`${x}_enable`, interfaceConfigs[x]['enable']);
        interfaceConfigs[x]['needs'].map(
          async y => {
            await set(y['needs_config_key'], y['needs_config_value'])
          })
      }
    )
    if (autoStart) {
      isEnabled().then(v => {
        if (!v) {
          enable().then(_ => {
            notification.sendNotification({
              title: '设置开机启动',
              body: '已设置为开机启动'
            })
          })
        }
      })
    } else {
      isEnabled().then(v => {
        if (v) {
          disable().then(_ => {
            notification.sendNotification({
              title: '取消开机启动',
              body: '已取消开机启动'
            })
          })
        }
      })
    }
    writeConfig().then(
      _ => {
        notification.sendNotification({
          title: '设置保存成功',
          body: '设置保存成功'
        })
      },
      e => {
        notification.sendNotification({
          title: '设置保存失败',
          body: `设置保存失败:${e}`,
        })
      }
    )
  }

  return (
    <ThemeProvider theme={theme == 'auto' ? (prefersDarkMode ? dark : light) : (theme == 'dark' ? dark : light)}>
      <CssBaseline />
      <div className='content'>
        <ShortCutConfig />
        <AppConfig />
        <InterfaceConfig />
        <AppInfo />
      </div>
      <div className='foot'>
        <Button
          variant='contained'
          size='large'
          onClick={saveConfig}
        >
          保存设置
        </Button>
      </div>
    </ThemeProvider>
  )
}

