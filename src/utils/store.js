import { Store } from 'tauri-plugin-store-api';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { watch } from 'tauri-plugin-fs-watch-api';
import { invoke } from '@tauri-apps/api';
import { isTauri } from './runtime';
import { defaultTranslationSystemPrompt, defaultTranslationUserPrompt } from '../services/translate/prompt';

const defaultRequestArguments = JSON.stringify({
    temperature: 0.1,
    top_p: 0.99,
    frequency_penalty: 0,
    presence_penalty: 0,
});

const memoryStore = new Map();

const webDefaults = {
    translate_service_list: import.meta.env.API_KEY ? ['openai'] : ['bing'],
    openai: {
        service: 'openai',
        requestPath: import.meta.env.BASEURL || 'https://api.openai.com/v1/chat/completions',
        model: import.meta.env.MODEL || 'gpt-3.5-turbo',
        apiKey: import.meta.env.API_KEY || '',
        stream: false,
        promptList: [
            { role: 'system', content: defaultTranslationSystemPrompt },
            { role: 'user', content: defaultTranslationUserPrompt },
        ],
        requestArguments: defaultRequestArguments,
    },
    translate_source_language: 'auto',
    translate_target_language: 'zh_cn',
    dynamic_translate: true,
};

const browserStore = {
    async load() {},
    async save() {},
    async get(key) {
        if (memoryStore.has(key)) {
            return memoryStore.get(key);
        }
        return key in webDefaults ? webDefaults[key] : null;
    },
    async set(key, value) {
        memoryStore.set(key, value);
    },
    async has(key) {
        return memoryStore.has(key);
    },
    async delete(key) {
        memoryStore.delete(key);
    },
};

export let store = isTauri() ? new Store() : browserStore;

export async function initStore() {
    if (!isTauri()) {
        store = browserStore;
        return;
    }

    const appConfigDirPath = await appConfigDir();
    const appConfigPath = await join(appConfigDirPath, 'config.json');
    store = new Store(appConfigPath);
    const _ = await watch(appConfigPath, async () => {
        await store.load();
        await invoke('reload_store');
    });
}
