import { fetch, Body } from '@tauri-apps/api/http';

export async function translate(text, from, to) {
    const url = 'https://translate.yandex.net/api/v1/tr.json/translate';
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        query: {
            id: `${generateSid()}-0-0`,
            srv: 'android',
        },
        body: Body.form({
            source_lang: from,
            target_lang: to,
            text,
        }),
    });
    if (res.ok) {
        const result = res.data;
        if (result.text) {
            return result.text[0];
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

function generateSid() {
    return crypto.randomUUID().replaceAll('-', '');
}

export * from './Config';
export * from './info';
