import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { get, set, writeConfig } from '../../global/config'
import { Button, TextField, Select, MenuItem, useMediaQuery, Box, FormControlLabel, Checkbox } from '@mui/material'
import { enable, isEnabled, disable } from "tauri-plugin-autostart-api";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { notification, app } from '@tauri-apps/api'
import { nanoid } from 'nanoid'
import ConfigList from './components/ConfigList'
import ConfigItem from './components/ConfigItem'
import language from '../../global/language'
import * as interfaces from '../../interfaces'
import { light, dark } from '../themes';
import './style.css'

export default function App() {
  const [version, setVersion] = useState();
  const [tauriVersion, setTauriVersion] = useState();
  const [shortcutTranslate, setShortcutTranslate] = useState(get('shortcut_translate', 'CommandOrControl+D'));
  const [shortcutPersistent, setShortcutPersistent] = useState(get('shortcut_persistent', 'CommandOrControl+Shift+D'));
  const [autoStart, setAutoStart] = useState(get('auto_start', true));
  const [autoCheck, setAutoCheck] = useState(get('auto_check', true));
  const [targetLanguage, setTargetLanguage] = useState(get('target_language', 'zh-cn'));
  const [_interface, setInterface] = useState(get('interface', 'youdao_free'));
  const [windowWidth, setWindowWidth] = useState(get('window_width', 400));
  const [windowHeight, setWindowHeight] = useState(get('window_height', 500));
  const [theme, setTheme] = useState(get('theme', 'auto'));
  const [interfaceConfigs, setInterfaceConfigs] = useState([]);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
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
    setInterfaceConfigs(interface_configs)
    app.getVersion().then(v => { setVersion(v) })
    app.getTauriVersion().then(v => { setTauriVersion(v) })
  }, [])


  async function saveConfig() {
    await set('shortcut_translate', shortcutTranslate);
    await set('shortcut_persistent', shortcutPersistent);
    await set('auto_start', autoStart);
    await set('auto_check', autoCheck);
    await set('target_language', targetLanguage);
    await set('theme', theme);
    await set('window_width', windowWidth);
    await set('window_height', windowHeight);
    await set('interface', _interface);
    interfaceConfigs.map(
      async x => {
        await set(x['needs_name'], x['needs_value'])
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

  function checkUpdate() {
    axios.get('https://api.github.com/repos/Pylogmon/pot/releases/latest').then(
      res => {
        let remoteVersion = res.data['tag_name'];
        if (remoteVersion == version) {
          notification.sendNotification({
            title: '已经是最新版本了'
          })
        } else {
          notification.sendNotification({
            title: '新版本可用',
            body: `最新版本为：${remoteVersion}`,
          })
        }
      },
      err => {
        notification.sendNotification({
          title: '检查失败，请检查网络',
          body: `${err}`
        })
      }
    )
  }
  return (
    <ThemeProvider theme={theme == 'auto' ? (prefersDarkMode ? dark : light) : (theme == 'dark' ? dark : light)}>
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
          <ConfigItem>
            <FormControlLabel
              control={
                <Checkbox checked={autoStart} onChange={(e) => { setAutoStart(e.target.checked) }} />
              }
              label="开机自启" />
            <FormControlLabel
              control={
                <Checkbox checked={autoCheck} onChange={(e) => { setAutoCheck(e.target.checked) }} />
              }
              label="启动时检查更新" />
          </ConfigItem>
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
              <MenuItem value='auto'>跟随系统</MenuItem>
              <MenuItem value='light'>明亮</MenuItem>
              <MenuItem value='dark'>黑暗</MenuItem>
            </Select>
          </ConfigItem>
          <ConfigItem label="翻译窗口默认大小">
            <Box
              sx={{
                display: 'flex',
                justifyContent: "space-between"
              }}
            >
              <TextField
                label="宽"
                sx={{ width: "calc(50% - 8px)" }}
                value={windowWidth}
                onChange={(event) => {
                  setWindowWidth(Number(event.target.value));
                }}
              />
              <TextField
                label="高"
                sx={{ width: "calc(50% - 8px)" }}
                value={windowHeight}
                onChange={(event) => {
                  setWindowHeight(Number(event.target.value));
                }}
              />
            </Box>
          </ConfigItem>
        </ConfigList>
        <ConfigList label="接口设置">
          {
            interfaceConfigs.map(
              x => {
                return <ConfigItem key={nanoid()} label={`${x['interface_name_zh']} ${x['needs_name_zh']}`}>
                  <TextField
                    fullWidth
                    defaultValue={x['needs_value']}
                    onChange={(e) => {
                      let configs = interfaceConfigs;
                      for (let i in configs) {
                        if (configs[i]['needs_name'] == x['needs_name']) {
                          configs[i]['needs_value'] = e.target.value
                          break;
                        }
                      }
                      setInterfaceConfigs(configs)
                    }}
                  />
                </ConfigItem>
              }
            )
          }
        </ConfigList>
        <ConfigList label="应用信息">
          <ConfigItem label="应用版本">
            {`pot: ${version} tauri:${tauriVersion}   `}
            <Button onClick={checkUpdate}>检查更新</Button>
            <a href='https://github.com/Pylogmon/pot/releases' target="_blank"><Button>前往下载</Button></a>
          </ConfigItem>
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

