import { fetch } from '@tauri-apps/api/http';
export async function ankiConnect(action, version, params = {}) {
    let res = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        body: {
            type: 'Json',
            payload: { action, version, params },
        },
    });
    return res.data;
}
