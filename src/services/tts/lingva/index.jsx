import { fetch } from '@tauri-apps/api/http';

export async function tts(text, lang, options = {}) {
    const { config } = options;

    let { requestPath } = config;
    if (!requestPath.startsWith('http')) {
        requestPath = 'https://' + requestPath;
    }
    const res = await fetch(`${requestPath}/api/v1/audio/${lang}/${encodeURIComponent(text)}`);

    if (res.ok) {
        return res.data['audio'];
    }
}

export * from './Config';
export * from './info';
