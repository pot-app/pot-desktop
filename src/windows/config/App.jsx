import React, { useState } from 'react'
import { get, set, writeConfig } from '../../global/config'
import { Button, TextField, Select, MenuItem } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { notification } from '@tauri-apps/api'
import { nanoid } from 'nanoid'
import ConfigList from './components/ConfigList'
import ConfigItem from './components/ConfigItem'
import language from '../../global/language'
import interfaces from '../../interfaces'
import { light, dark } from '../themes';
import './style.css'

export default function App() {
  const [shortcutTranslate, setShortcutTranslate] = useState(get('shortcut_translate', ''));
  const [shortcutPersistent, setShortcutPersistent] = useState(get('shortcut_persistent', ''));
  const [targetLanguage, setTargetLanguage] = useState(get('target_language', 'zh'));
  const [_interface, setInterface] = useState(get('interface', 'youdao_free'));
  const [openaiApikey, setOpenaiApikey] = useState(get('openai_apikey', ''));
  const [openaiDomain, setOpenaiDomain] = useState(get('openai_domain', 'api.openai.com'));
  const [caiyunToken, setCaiyunToken] = useState(get('caiyun_token', ''));
  const [baiduAppid, setBaiduAppid] = useState(get('baidu_appid', ''));
  const [baiduSecret, setBaiduSecret] = useState(get('baidu_secret', ''));
  const [theme, setTheme] = useState(get('theme', 'light'));

  function saveConfig() {
    set('shortcut_translate', shortcutTranslate);
    set('shortcut_persistent', shortcutPersistent);
    set('target_language', targetLanguage);
    set('theme', theme);
    set('interface', _interface);
    set('openai_apikey', openaiApikey);
    set('openai_domain', openaiDomain);
    set('caiyun_token', caiyunToken);
    set('baidu_appid', baiduAppid);
    set('baidu_secret', baiduSecret);

    writeConfig().then(
      _ => {
        notification.sendNotification({
          title: '设置保存成功',
          body: '设置保存成功，重启应用后生效'
        })
        e => {
          notification.sendNotification({
            title: '设置保存失败',
            body: `设置保存失败:重启应用后生效${e}`,
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
                interfaces.map(x => {
                  return <MenuItem value={x.value} key={nanoid()}>{x.label}</MenuItem>
                })
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
          <ConfigItem label="OpenAI 自定义域名">
            <TextField
              fullWidth
              value={openaiDomain}
              onChange={(e) => { setOpenaiDomain(e.target.value) }}
            />
          </ConfigItem>
          <ConfigItem label="OpenAI ApiKey">
            <TextField
              fullWidth
              value={openaiApikey}
              type='password'
              onChange={(e) => { setOpenaiApikey(e.target.value) }}
            />
          </ConfigItem>
          <ConfigItem label="彩云小译token">
            <TextField
              fullWidth
              value={caiyunToken}
              type='password'
              onChange={(e) => { setCaiyunToken(e.target.value) }}
            />
          </ConfigItem>
          <ConfigItem label="百度翻译Appid">
            <TextField
              fullWidth
              value={baiduAppid}
              onChange={(e) => { setBaiduAppid(e.target.value) }}
            />
          </ConfigItem>
          <ConfigItem label="百度翻译密钥">
            <TextField
              fullWidth
              value={baiduSecret}
              type='password'
              onChange={(e) => { setBaiduSecret(e.target.value) }}
            />
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

