import React, { useState } from 'react'
import { appWindow } from '@tauri-apps/api/window'
import {
    PushpinFilled,
    CloseCircleFilled
} from '@ant-design/icons'
import { Button } from 'antd';
import './style.css'

export default function TopBar() {
    const [pin, setPin] = useState(true)
    return (
        <div className='topbar'>
            <Button
                className='topbar-button'
                onClick={() => {
                    appWindow.setAlwaysOnTop(!pin).then(
                        _ => { setPin(!pin); }
                    )
                }}
                style={{ color: pin ? '#1677ff' : "#c0c1c5" }}
            >
                <PushpinFilled />
            </Button>
            <Button
                className='topbar-button'
                onClick={() => { appWindow.close() }}
                style={{ color: "#c0c1c5" }}
            >
                <CloseCircleFilled />
            </Button>
        </div>
    )
}
