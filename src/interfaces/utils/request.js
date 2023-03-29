import { invoke } from '@tauri-apps/api/tauri';

export default async function request(url, options) {
    let new_options = {};
    if ('method' in options) {
        new_options['method'] = options['method'];
    }
    if ('body' in options) {
        new_options['body'] = options['body'];
    }
    if ('proxy' in options) {
        new_options['proxy'] = options['proxy'];
    }
    if ('query' in options) {
        let temp = [];
        for (let i of Object.keys(options['query'])) {
            temp.push([i, options['query'][i]])
        }
        new_options['query'] = temp;
    }
    if ('headers' in options) {
        let temp = [];
        for (let i of Object.keys(options['headers'])) {
            temp.push([i, options['headers'][i]])
        }
        new_options['headers'] = temp;
    }
    return await invoke('http_request', {
        url: url, options: new_options
    })
}