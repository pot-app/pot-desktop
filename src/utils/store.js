import { Store } from 'tauri-plugin-store-api';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { watch } from 'tauri-plugin-fs-watch-api';
import { invoke } from '@tauri-apps/api';

/** Initialized by initStore() before React renders. @see main.jsx */
export let store = null;

export async function initStore() {
    if (store) return; // idempotent
    const configDir = await appConfigDir();
    const configPath = await join(configDir, 'config.json');
    store = new Store(configPath);
    await store.load().catch(() => {});
    watch(configPath, async () => {
        await store.load();
        await invoke('reload_store');
    }).catch(() => {});
}
