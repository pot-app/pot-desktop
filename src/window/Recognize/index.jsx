import React, { useEffect } from 'react';
import { appWindow } from '@tauri-apps/api/window';

export default function Recognize() {
    useEffect(() => {
        appWindow.show();
    }, []);
    return <div className='bg-background/90 h-screen rounded-[10px]'>Recognize</div>;
}
