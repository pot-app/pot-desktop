import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api/tauri';
let config = {};

export async function readConfig() {
    config = JSON.parse(await invoke('get_config'));
}

export function get(name, dft) {
    if (name in config) {
        return config[name]
    } else {
        return dft
    }
}

export function set(key, value) {
    config[key] = value;
}

export async function writeConfig() {
    await writeTextFile(
        'config.json',
        JSON.stringify(config),
        { dir: BaseDirectory.AppConfig }
    )
}