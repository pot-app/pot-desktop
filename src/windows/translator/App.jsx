import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { PushpinOutlined, CloseOutlined } from '@ant-design/icons';
export default function App() {
  const [sourceText, setSourceText] = useState("");
  useEffect(() => {
    invoke('get_selection_text').then(text => {
      if (text != "") {
        setSourceText(text);
        console.log("text:", text);
      }
    }
    )
  }, [])
  return (
    <div>
      <div className='topbar'>
        <PushpinOutlined style={{ fontSize: '20px' }} />
        <CloseOutlined style={{ fontSize: '20px' }} />
      </div>
      <div className='sourcetext'>
        {sourceText}
      </div>
      <div className='targettext'>
        {sourceText}
      </div>

    </div>
  )
}
