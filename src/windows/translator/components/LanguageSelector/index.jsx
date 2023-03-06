import React from 'react'
import { Select, ConfigProvider, theme } from 'antd'
import { DoubleRightOutlined } from '@ant-design/icons'
import PubSub from 'pubsub-js'
import language from '../../../../global/language'
import { get } from '../../../../global/config'
import './style.css'

export default function LanguageSelector() {
    return (
        <div className="language-selector">
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
                    style={{ width: '150px' }}
                    defaultValue='auto'
                    bordered={false}
                    options={[{ value: 'auto', label: '自动检测' }]}
                />
                <DoubleRightOutlined className='arrow-icon' />
                <Select
                    style={{ width: '150px' }}
                    defaultValue={get('target_language', 'zh-cn')}
                    bordered={false}
                    options={language}
                    onSelect={(v) => { PubSub.publish('TargetLanguage', v) }}
                />
            </ConfigProvider>
        </div>
    )
}
