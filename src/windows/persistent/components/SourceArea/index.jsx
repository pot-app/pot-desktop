import React, { useState, useEffect } from 'react'
import { CopyOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
const { TextArea } = Input;
import PubSub from 'pubsub-js';
import { writeText } from '@tauri-apps/api/clipboard';
import './style.css'

export default function SourceArea() {
    const [sourceText, setSourceText] = useState('');

    function changeSource(e) {
        setSourceText(e.target.value);
    }
    function reTranslate() {
        PubSub.publish('SourceText', sourceText);
    }

    function copy(who) {
        writeText(who).then(
            _ => { console.log('success') }
        )
    }
    return (
        <div className='sourcearea'>
            <TextArea
                className='textarea'
                value={sourceText}
                rows={4}
                bordered={false}
                onChange={changeSource}
                onPressEnter={reTranslate}
            />
            <Button className='control-button' onClick={() => { copy(sourceText) }}>
                <CopyOutlined />
            </Button>
        </div>
    )
}
