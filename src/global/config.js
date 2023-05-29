import { invoke } from '@tauri-apps/api/tauri';

export async function readConfig() {
    return await invoke('get_config_str');
}

export async function set(k, v) {
    await invoke('set_config', { key: k, value: v });
}

export async function writeConfig() {
    await invoke('write_config');
}
