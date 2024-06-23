import { fetch, Body } from '@tauri-apps/api/http';

export async function translate(text, from, to, options = {}) {
    const { config } = options;

    const { https, apikey } = config;

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
