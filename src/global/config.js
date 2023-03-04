import { invoke } from '@tauri-apps/api/tauri';
import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';

let config = {};

export function readConfig() {
    invoke('get_config').then(v => {
        config = JSON.parse(v);
    })

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