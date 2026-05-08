import { fetch, Body } from '@tauri-apps/api/http';

export async function translate(text, from, to, options = {}) {
    const { config } = options;

    const { https, apikey, is_campus } = config;

    const url = is_campus 
        ? `https://trans.neu.edu.cn/niutrans/textTranslation?apikey=${apikey}`
        : `${https ? 'https' : 'http'}://api.niutrans.com/NiuTransServer/translation`;

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: Body.json({
            from: from,
            to: to,
            apikey: apikey, // 内部版如果不需要body里的apikey会自动忽略，公网版需要
            src_text: text,
        }),
    });

    // 返回翻译结果
    if (res.ok) {
        let result = res.data;
        if (is_campus) {
            if (result.code === 200 && result.data && result.data.length > 0) {
                return result.data.map(d => 
                    d.sentences.map(s => s.data).join('')
                ).join('\n').trim();
            } else {
                throw JSON.stringify(result);
            }
        }
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
