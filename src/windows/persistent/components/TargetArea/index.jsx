import React, { useState, useEffect } from 'react'
import { Button, Input, Spin, Select, ConfigProvider, theme } from 'antd';
const { TextArea } = Input;
import PubSub from 'pubsub-js';
import { CopyOutlined } from '@ant-design/icons';
import { writeText } from '@tauri-apps/api/clipboard';
import { getTranslator } from '../../translators';
import { get } from '../../../../global/config';
import './style.css'

const interface_map = [
    { value: 'youdao_free', label: '有道翻译(免费)' },
    { value: 'chatgpt', label: 'ChatGPT' },
]

export default function TargetArea() {
    const [translateInterface, setTranslateInterface] = useState(get('interface', 'youdao_free'));
    const [loading, setLoading] = useState(false);
    const [sourceText, setSourceText] = useState("");
    const [targetText, setTargetText] = useState("");

    PubSub.subscribe('SourceText', (_, v) => {
        setSourceText(v)
    })

    useEffect(() => {
        if (sourceText != "") {
            translate(sourceText);
        }
    }, [sourceText, translateInterface])

    function translate(text) {
        setTargetText('');
        setLoading(true);
        //翻译
        let translator = getTranslator(translateInterface);
        translator.translate(text).then(
            v => {
                setTargetText(v);
                setLoading(false);
            },
            e => {
                setTargetText(e);
                setLoading(false);
            }
        )
    }

    function copy(who) {
        writeText(who).then(
            _ => { console.log('success') }
        )
    }

    return (
        <div className='targetarea'>
            <div>
                <ConfigProvider
                    theme={{
                        algorithm: theme.darkAlgorithm,
                        token: {
                            colorPrimaryBg: '#1677ff',
                            colorText: '#c0c1c5'
                        }
                    }}
                >
                    <Select
                        className='interface-selector'
                        defaultValue={translateInterface}
                        bordered={false}
                        options={interface_map}
                        onSelect={(v) => {
                            setTranslateInterface(v);
                        }}
                    />
                </ConfigProvider>
                {
                    loading ? <Spin /> : <></>
                }
            </div>
            <div className="overflow-textarea">
                <TextArea
                    className='textarea'
                    value={targetText}
                    autoSize
                    bordered={false}
                />
            </div>
            <Button className='control-button' onClick={() => { copy(targetText) }}>
                <CopyOutlined />
            </Button>
        </div>
    )
}
