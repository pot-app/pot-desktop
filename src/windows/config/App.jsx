import React, { useState } from 'react'
import { get, set, writeConfig } from '../../global/config'
import { Button, Input, ConfigProvider, theme, Select } from 'antd'
import { notification } from '@tauri-apps/api'
import ConfigList from './components/ConfigList'
import ConfigItem from './components/ConfigItem'
import language from '../../global/language'
import interfaces from '../../interfaces'
import './style.css'

export default function App() {
  const [shortcutTranslate, setShortcutTranslate] = useState(get('shortcut_translate', ''));
  const [shortcutPersistent, setShortcutPersistent] = useState(get('shortcut_persistent', ''));
  const [targetLanguage, setTargetLanguage] = useState(get('target_language', 'zh'));
  const [_interface, setInterface] = useState(get('interface', 'youdao_free'));
  const [openaiApikey, setOpenaiApikey] = useState(get('openai_apikey', ''));
  const [openaiDomain, setOpenaiDomain] = useState(get('openai_domain', 'api.openai.com'));

  function saveConfig() {
    set('shortcut_translate', shortcutTranslate);
    set('shortcut_persistent', shortcutPersistent);
    set('target_language', targetLanguage);
    set('interface', _interface);
    set('openai_apikey', openaiApikey);
    set('openai_domain', openaiDomain);

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
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm
      }}
    >
      <div className='content'>
        <ConfigList label="快捷键">
          <ConfigItem label="划词翻译">
            <Input
              value={shortcutTranslate}
              onChange={(e) => { setShortcutTranslate(e.target.value) }}
            />
          </ConfigItem>
          <ConfigItem label="独立翻译窗口">
            <Input
              value={shortcutPersistent}
              onChange={(e) => { setShortcutPersistent(e.target.value) }}
            />
          </ConfigItem>
        </ConfigList>
        <ConfigList label="翻译设置">
          <ConfigItem label="目标语言">
            <Select
              options={language}
              value={targetLanguage}
              style={{ width: '100%' }}
              onSelect={(v) => setTargetLanguage(v)}
            />
          </ConfigItem>
          <ConfigItem label="默认接口">
            <Select
              options={interfaces}
              value={_interface}
              style={{ width: '100%' }}
              onSelect={(v) => setInterface(v)}
            />
          </ConfigItem>
        </ConfigList>
        <ConfigList label="接口设置">
          <ConfigItem label="OpenAI 自定义域名">
            <Input
              value={openaiDomain}
              onChange={(e) => { setOpenaiDomain(e.target.value) }}
            />
          </ConfigItem>
          <ConfigItem label="OpenAI ApiKey">
            <Input
              value={openaiApikey}
              type='password'
              onChange={(e) => { setOpenaiApikey(e.target.value) }}
            />
          </ConfigItem>
        </ConfigList>
      </div>
      <div className='foot'>
        <Button
          type='primary'
          size='large'
          onClick={saveConfig}
        >
          保存设置
        </Button>
      </div>
    </ConfigProvider>
  )
}

