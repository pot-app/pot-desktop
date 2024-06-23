import { fetch } from '@tauri-apps/api/http';
import CryptoJS from 'crypto-js';
import { nanoid } from 'nanoid';

export async function translate(text, from, to, options = {}) {
    text = text.trim();
    const { config } = options;

    const { appkey, key } = config;

    const url = 'https://openapi.youdao.com/api';
    const curtime = String(Math.round(new Date().getTime() / 1000));
    const salt = nanoid();
    const str1 = appkey + truncate(text) + salt + curtime + key;
    const sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);

    let res = await fetch(url, {
        method: 'GET',
        query: {
            q: text,
            from: from,
            to: to,
            appKey: appkey,
            salt: salt,
            sign: sign,
            signType: 'v3',
            curtime: curtime,
        },
    });
    if (res.ok) {
        let result = res.data;
        if (result['isWord']) {
            let target = { pronunciations: [], explanations: [], associations: [], sentence: [] };
            let basic = result['basic'];

            if (basic['uk-phonetic']) {
                let speech = await fetch(basic['uk-speech'], { method: 'GET', responseType: 3 });
                target['pronunciations'].push({
                    region: 'UK',
                    symbol: basic['uk-phonetic'],
                    voice: speech.ok ? speech.data : '',
                });
            }
            if (basic['us-phonetic']) {
                let speech = await fetch(basic['us-speech'], { method: 'GET', responseType: 3 });
                target['pronunciations'].push({
                    region: 'US',
                    symbol: basic['us-phonetic'],
                    voice: speech.ok ? speech.data : '',
                });
            }
            if (basic['phonetic'] && target['pronunciations'].length === 0) {
                target['pronunciations'].push({
                    region: '',
                    symbol: basic['phonetic'],
                    voice: '',
                });
            }
            for (let i of basic['explains']) {
                let trait = '';
                if (i.split(' ')[0].endsWith('.')) {
                    trait = i.split(' ')[0];
                }
                let explains = i.replace(trait, '').trim();
                target['explanations'].push({ trait, explains: explains.split('；') });
            }
            if (basic['wfs']) {
                for (let wf of basic['wfs']) {
                    target['associations'].push(wf.wf.name + ' ' + wf.wf.value);
                }
            }
            if (basic['exam_type']) {
                target['associations'].push(
                    basic['exam_type'].reduce((a, b) => {
                        return a + ' ' + b;
                    })
                );
            }
            return target;
        } else {
            if (result['translation']) {
                let target = '';
                for (let i of result['translation']) {
                    target += i + '\n';
                }
                return target.trim();
            } else {
                throw JSON.stringify(result);
            }
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

function truncate(q) {
    var len = q.length;
    if (len <= 20) return q;
    return q.substring(0, 10) + len + q.substring(len - 10, len);
}

export * from './Config';
export * from './info';
