import { appWindow } from '@tauri-apps/api/window'
import {
    PushpinFilled,
    CloseCircleFilled
} from '@ant-design/icons'
import { Button } from 'antd';
import React from 'react'
import './style.css'

export default function TopBar() {
    return (
        <div className='topbar'>
            <Button className='topbar-button'>
                <PushpinFilled />
            </Button>
            <Button className='topbar-button' onClick={() => { appWindow.close() }}>
                <CloseCircleFilled />
            </Button>
        </div>
    )
}
