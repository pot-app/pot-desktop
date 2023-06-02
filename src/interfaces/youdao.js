import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import CryptoJS from 'crypto-js';
import { nanoid } from 'nanoid';

export const info = {
    name: 'youdao',
    supportLanguage: {
        auto: 'auto',
        zh_cn: 'zh-CHS',
        zh_tw: 'zh-CHT',
        yue: 'yue',
        en: 'en',
        ja: 'jp',
        ko: 'kor',
        fr: 'fra',
        es: 'spa',
        ru: 'ru',
        de: 'de',
        it: 'it',
        tr: 'tr',
        pt: 'pt',
        vi: 'vie',
        id: 'id',
        th: 'th',
        ms: 'may',
        ar: 'ar',
        hi: 'hi',
    },
    needs: [
        {
            config_key: 'youdao_appkey',
            place_hold: '',
            display_name: '',
        },
        {
            config_key: 'youdao_key',
            place_hold: '',
            display_name: '',
        },
    ],
};

export async function translate(text, from, to, setText, id) {
    const { supportLanguage } = info;

    const appKey = get('youdao_appkey') ?? '';
    const key = get('youdao_key') ?? '';

    if (appKey === '' || key === '') {
        throw 'Please configure appKey and key';
    }
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        throw 'Unsupported Language';
    }

    const url = 'https://openapi.youdao.com/api';
    const curtime = String(Math.round(new Date().getTime() / 1000));
    const salt = nanoid();
    const str1 = appKey + truncate(text) + salt + curtime + key;
    const sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);

    let res = await fetch(url, {
        method: 'GET',
        query: {
            q: text,
            from: supportLanguage[from],
            to: supportLanguage[to],
            appKey: appKey,
            salt: salt,
            sign: sign,
            signType: 'v3',
            curtime: curtime
        }
    });
    if (res.ok) {
        let result = res.data;

        if (result['isWord']) {
            // 后续在此处实现词典功能
            if (result['translation']) {
                let target = '';
                for (let i of result['translation']) {
                    if (translateID.includes(id)) {
                        target += i + '\n';
                        setText(target);
                    }
                }
            } else {
                throw JSON.stringify(result);
            }
        } else {
            if (result['translation']) {
                let target = '';
                for (let i of result['translation']) {
                    if (translateID.includes(id)) {
                        target += i + '\n';
                        setText(target);
                    }
                }
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