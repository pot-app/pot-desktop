import React, { useState, useEffect } from 'react'
import { appWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/tauri'
import { PushpinFilled, CloseCircleFilled, CopyOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { Input } from 'antd';
const { TextArea } = Input;
import { writeText } from '@tauri-apps/api/clipboard';
import youdao_free from '../../interfaces/youdao_free';

export default function App() {
  const [config, setConfig] = useState({});
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  function copy(who) {
    writeText(who).then(
      _ => { }
    );
  }

  useEffect(() => {
    // 获取配置
    invoke('get_config').then(
      v => {
        console.log("a");
        setConfig(JSON.parse(v));
        console.log("b");
      }
    )
    // 获取选中文本
    invoke('get_selection_text').then(text => {
      if (text != "") {
        setSourceText(text);
        youdao_free(text).then(
          v => setTargetText(v)
        )
      }
    }
    )
  }, [])
  return (
    <div>
      <div className='topbar'>
        <Button className='topbar-button'>
          <PushpinFilled />
        </Button>
        <Button className='topbar-button' onClick={() => { appWindow.close() }}>
          <CloseCircleFilled />
        </Button>
      </div>
      <div className='sourcetext'>
        <TextArea className='textarea' value={sourceText} rows={4} bordered={false} />
        <Button className='control-button' onClick={() => { copy(sourceText) }}>
          <CopyOutlined />
        </Button>
      </div>
      <div className="language-selector">
        <DoubleRightOutlined className='control-button' />
      </div>
      <div className='targettext'>
        <div style={{ "overflow": "auto", height: 'calc(100% - 33px)' }}>
          <TextArea className='textarea' value={targetText} autoSize bordered={false} />
        </div>
        <Button className='control-button' onClick={() => { copy(targetText) }}>
          <CopyOutlined />
        </Button>
      </div>

    </div>
  )
}
