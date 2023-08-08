import React, { useEffect, useState } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';

export default function Translate() {
    const [text, setText] = useState('');
    listen('new_text', (event) => {
        setText(event.payload.trim());
    });
    useEffect(() => {
        invoke('get_text').then((v) => {
            if (v === '[INPUT_TRANSLATE]') {
            } else if (v === '[IMAGE_TRANSLATE]') {
                // image translate
            } else {
                setText(v.trim());
            }
        });
        if (appWindow.label === 'translate') {
            appWindow.show();
        }
    }, []);
    return (
        <div>
            <button>translate</button>
            {text}
        </div>
    );
}
