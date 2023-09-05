import { fetch } from '@tauri-apps/api/http';
import { store } from '../../../utils/store';
import CryptoJS from 'crypto-js';
import { nanoid } from 'nanoid';

export async function translate(text, from, to, options = {}) {
    const { config } = options;

    let translateConfig = (await store.get('youdao')) ?? {};
    if (config !== undefined) {
        translateConfig = config;
    }

    const { appkey, key } = translateConfig;

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
            // 后续在此处实现词典功能
            if (result['translation']) {
                let target = '';
                for (let i of result['translation']) {
                    target += i + '\n';
                }
                return target.trim();
            } else {
                throw JSON.stringify(result);
            }
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
