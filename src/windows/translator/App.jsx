import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'

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
    <div>{sourceText}</div>
  )
}
