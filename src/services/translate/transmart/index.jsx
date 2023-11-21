import { fetch, Body } from '@tauri-apps/api/http';
import { store } from '../../../utils/store';

export async function translate(text, from, to, options = {}) {
    const { config } = options;

    let translateConfig = (await store.get('transmart')) ?? {};
    if (config !== undefined) {
        translateConfig = config;
    }
    const user = translateConfig['username'];
    const token = translateConfig['token'];

    let header = {};
    if (user !== '' || token !== '') {
        header['token'] = token;
        header['user'] = user;
    }

    const url = 'https://transmart.qq.com/api/imt';

    const res = await fetch(url, {
        method: 'POST',
        body: Body.json({
            header: {
                fn: 'auto_translation',
                ...header,
            },
            type: 'plain',
            source: {
                lang: from,
                text_list: [text],
            },
            target: {
                lang: to,
            },
        }),
    });
    if (res.ok) {
        const result = res.data;
        if (result['auto_translation']) {
            let target = '';
            for (let line of result['auto_translation']) {
                target += line;
                target += '\n';
            }
            return target.trim();
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

export * from './Config';
export * from './info';
