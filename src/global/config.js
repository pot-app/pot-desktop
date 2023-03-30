import { invoke } from '@tauri-apps/api/tauri';

let config = {};

export async function readConfig() {
    config = await invoke('get_config_str')
    return config
}

export function get(name, dft) {
    if (name in config) {
        return config[name]
    } else {
        return dft
    }
}

export async function set(k, v) {
    await invoke('set_config', { key: k, value: v });
}

export async function writeConfig() {
    await invoke('write_config');
}