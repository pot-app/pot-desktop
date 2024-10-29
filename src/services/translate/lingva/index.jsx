import { fetch, Body } from '@tauri-apps/api/http';

export async function translate(text, from, to) {
    let plain_text = text.replaceAll('/', '@@');
    let encode_text = encodeURIComponent(plain_text);
    const res = await fetch(`https://lingva.pot-app.com/api/v1/${from}/${to}/${encode_text}`, {
        method: 'GET',
    });

    if (res.ok) {
        let result = res.data;
        const { translation } = result;
        if (translation) {
            return translation.replaceAll('@@', '/');
        } else {
            throw JSON.stringify(result.trim());
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

export * from './Config';
export * from './info';
