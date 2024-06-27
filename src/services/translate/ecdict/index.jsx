import { fetch, Body } from '@tauri-apps/api/http';

export async function translate(text, _from, _to) {
    const res = await fetch(`https://pot-app.com/api/dict`, {
        method: 'POST',
        body: Body.json({ text }),
    });

    if (res.ok) {
        let result = res.data;
        return result;
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

export * from './Config';
export * from './info';
