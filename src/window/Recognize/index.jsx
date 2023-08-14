import { appWindow } from '@tauri-apps/api/window';
import React, { useEffect } from 'react';

import { osType } from '../../utils/env';

export default function Recognize() {
    useEffect(() => {
        appWindow.show();
    }, []);
    return <div className={`bg-background/90 h-screen ${osType === 'Linux' && 'rounded-[10px]'}`}>Recognize</div>;
}
