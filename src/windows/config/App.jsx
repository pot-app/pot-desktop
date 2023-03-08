import React, { useState, useEffect } from 'react'
import { get, set, writeConfig } from '../../global/config'
import { Button, TextField, Select, MenuItem } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { notification } from '@tauri-apps/api'
import { nanoid } from 'nanoid'
import ConfigList from './components/ConfigList'
import ConfigItem from './components/ConfigItem'
import language from '../../global/language'
import * as interfaces from '../../interfaces'
import { light, dark } from '../themes';
import './style.css'

export default function App() {
  const [shortcutTranslate, setShortcutTranslate] = useState(get('shortcut_translate', ''));
  const [shortcutPersistent, setShortcutPersistent] = useState(get('shortcut_persistent', ''));
  const [targetLanguage, setTargetLanguage] = useState(get('target_language', 'zh'));
  const [_interface, setInterface] = useState(get('interface', 'youdao_free'));
  const [theme, setTheme] = useState(get('theme', 'light'));
  const [interfaceConfigs, setInterfaceConfigs] = useState([]);

  useEffect(() => {
    let interface_configs = [];
    Object.keys(interfaces).map(
      i => {
        const needs = interfaces[i]['info']['needs'];
        Object.keys(needs).map(
          n => {
            interface_configs.push({
              'interface_name': i,
              'interface_name_zh': interfaces[i]['info']['name'],
              'needs_name': n,
              'needs_name_zh': needs[n],
              'needs_value': get(n, '')
            })
          }
        )
      }
    )
    console.log(interface_configs)
    setInterfaceConfigs(interface_configs)
  }, [])


  function saveConfig() {
    set('shortcut_translate', shortcutTranslate);
    set('shortcut_persistent', shortcutPersistent);
    set('target_language', targetLanguage);
    set('theme', theme);
    set('interface', _interface);
    interfaceConfigs.map(
      x => {
        set(x['needs_name'], x['needs_value'])
      }
    )

    writeConfig().then(
      _ => {
        notification.sendNotification({
          title: '设置保存成功',
          body: '设置保存成功，重启应用后生效'
        })
        e => {
          notification.sendNotification({
            title: '设置保存失败',
            body: `设置保存失败:${e}`,
          })
        }
      }
    )

  }
  return (
    <ThemeProvider theme={theme == 'light' ? light : dark}>
      <CssBaseline />
      <div className='content'>
        <ConfigList label="快捷键">
          <ConfigItem label="划词翻译">
            <TextField
              fullWidth
              value={shortcutTranslate}
              onChange={(e) => { setShortcutTranslate(e.target.value) }}
            />
          </ConfigItem>
          <ConfigItem label="独立翻译窗口">
            <TextField
              fullWidth
              value={shortcutPersistent}
              onChange={(e) => { setShortcutPersistent(e.target.value) }}
            />
          </ConfigItem>
        </ConfigList>
        <ConfigList label="应用设置">
          <ConfigItem label="目标语言">
            <Select
              fullWidth
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              {
                language.map(x => {
                  return <MenuItem value={x.value} key={nanoid()}>{x.label}</MenuItem>
                })
              }
            </Select>
          </ConfigItem>
          <ConfigItem label="默认接口">
            <Select
              fullWidth
              value={_interface}
              onChange={(e) => setInterface(e.target.value)}
            >
              {
                Object.keys(interfaces).map(
                  x => {
                    return <MenuItem value={x} key={nanoid()}>{interfaces[x]['info']['name']}</MenuItem>
                  }
                )
              }
            </Select>
          </ConfigItem>
          <ConfigItem label="颜色主题">
            <Select
              fullWidth
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <MenuItem value='light'>明亮</MenuItem>
              <MenuItem value='dark'>黑暗</MenuItem>
            </Select>
          </ConfigItem>
        </ConfigList>
        <ConfigList label="接口设置">
          {
            interfaceConfigs.map(
              x => {
                return <ConfigItem label={`${x['interface_name_zh']} ${x['needs_name_zh']}`}>
                  <TextField
                    fullWidth
                    type='password'
                    defaultValue={x['needs_value']}
                    onChange={(e) => { interfaceConfigs[x['needs_name']] = e.target.value }}
                  />
                </ConfigItem>
              }
            )
          }
        </ConfigList>
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

