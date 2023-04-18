import { invoke } from '@tauri-apps/api/tauri';

export async function readConfig() {
    let config = await invoke('get_config_str')
    return config
}

export async function set(k, v) {
    await invoke('set_config', { key: k, value: v });
}

export async function writeConfig(shortcut) {
    await invoke('write_config', { shortcut: shortcut });
}