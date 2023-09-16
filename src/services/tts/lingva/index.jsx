import { fetch } from '@tauri-apps/api/http';
import { store } from '../../../utils/store';

export async function tts(text, lang, options = {}) {
    const { config } = options;

    let lingvaConfig = (await store.get('lingva_tts')) ?? { requestPath: 'lingva.pot-app.com' };

    if (config !== undefined) {
        lingvaConfig = config;
    }

    let { requestPath } = lingvaConfig;
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
