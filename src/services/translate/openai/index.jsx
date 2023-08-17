import { fetch, Body } from '@tauri-apps/api/http';
import { store } from '../../../utils/store';

export async function translate(text, from, to, config = null) {
    let openaiConfig = await store.get('openai');
    if (config !== null) {
        openaiConfig = config;
    }

    return '';
}

export * from './Config';
export * from './info';
