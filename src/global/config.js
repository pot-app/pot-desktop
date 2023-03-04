import { invoke } from '@tauri-apps/api/tauri';

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

export function writeConfig() {
    invoke('write_config', { configStr: JSON.stringify(config) }).then(
        _ => { }
    )
}