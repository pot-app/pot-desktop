import { fetch, Body } from '@tauri-apps/api/http';
import { store } from '../../../utils/store';
import { http } from '@tauri-apps/api';

export async function translate(text, from, to, options = {}) {
    const { config } = options;

    let translateConfig = (await store.get('niutrans')) ?? {};
    if (config !== undefined) {
        translateConfig = config;
    }

    const { https, apikey } = translateConfig;

    const url = `${https ? 'https' : 'http'}://api.niutrans.com/NiuTransServer/translation`;

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: Body.json({
            from: from,
            to: to,
            apikey: apikey,
            src_text: text,
        }),
    });

    // 返回翻译结果
    if (res.ok) {
        let result = res.data;
        if (result && result['tgt_text']) {
            return result['tgt_text'].trim();
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

export * from './Config';
export * from './info';
