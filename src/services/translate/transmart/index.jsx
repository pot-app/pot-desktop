import { fetch, Body } from '@tauri-apps/api/http';
import { store } from '../../../utils/store';

export async function translate(text, from, to, options = {}) {
    const { config } = options;

    let transmartConfig = (await store.get('transmart')) ?? {};
    if (config !== undefined) {
        transmartConfig = config;
    }
    const user = transmartConfig['username'];
    const token = transmartConfig['token'];

    let header = {};
    if (user === '' || token === '') {
        // throw 'Please configure User and Token';
    } else {
        header['token'] = token;
        header['user'] = user;
    }

    const url = 'https://transmart.qq.com/api/imt';
    const analysis_res = await fetch(url, {
        method: 'POST',
        body: Body.json({
            header: {
                fn: 'text_analysis',
                ...header,
            },
            type: 'plain',
            text: text,
        }),
    });
    if (analysis_res.ok) {
        let analysis_result = analysis_res.data;
        if (analysis_result['language']) {
            if (analysis_result['sentence_list']) {
                let text_list = analysis_result['sentence_list'].map((text) => {
                    return text['str'];
                });
                const res = await fetch(url, {
                    method: 'POST',
                    body: Body.json({
                        header: {
                            fn: 'auto_translation',
                            ...header,
                        },
                        type: 'plain',
                        source: {
                            lang: from === 'auto' ? analysis_result['language'] : from,
                            text_list: text_list,
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
                        for (let i of result['auto_translation']) {
                            target += i;
                        }
                        return target.trim();
                    } else {
                        throw JSON.stringify(result);
                    }
                } else {
                    throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
                }
            } else {
                throw JSON.stringify(analysis_result);
            }
        } else {
            throw JSON.stringify(analysis_result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${analysis_res.status}\n${JSON.stringify(analysis_res.data)}`;
    }
}

export * from './Config';
export * from './info';
