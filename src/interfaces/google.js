import request from './utils/request';
import { get } from '../windows/main';

// 此接口只支持英汉互译
export const info = {
    name: '谷歌翻译(免费)',
    supportLanguage: {
        auto: 'auto',
        'zh-cn': 'zh-CN',
        'zh-tw': 'zh-TW',
        ja: 'ja',
        en: 'en',
        ko: 'ko',
        fr: 'fr',
        es: 'es',
        ru: 'ru',
        de: 'de',
    },
    needs: [
        {
            config_key: 'google_proxy',
            place_hold: 'eg: translate.google.com',
            display_name: '镜像站地址',
        },
    ],
};

export async function translate(text, from, to) {
    const { supportLanguage } = info;
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        return '该接口不支持该语言';
    }

    let domain = get('google_proxy') ?? 'translate.google.com';
    if (domain == '') {
        domain = 'translate.google.com';
    }

    let proxy = get('proxy') ?? '';
    let res = await request(
        `https://${domain}/translate_a/single?dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t`,
        {
            headers: {
                'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36`,
            },
            query: {
                client: 'gtx',
                sl: supportLanguage[from],
                tl: supportLanguage[to],
                hl: supportLanguage[to],
                ie: 'UTF-8',
                oe: 'UTF-8',
                otf: '1',
                ssel: '0',
                tsel: '0',
                kc: '7',
                q: text,
            },
            proxy: proxy,
        }
    );

    let result = JSON.parse(res);
    let target = '';
    if (result[2]) {
        if (result[2] == supportLanguage[to]) {
            let secondLanguage = get('second_language') ?? 'en';
            if (secondLanguage != to) {
                return translate(text, from, secondLanguage);
            }
        }
    }
    // 词典模式
    if (result[1]) {
        for (let i of result[1]) {
            // 词性
            target = target + '【词性】' + i[0] + '\n【释义】';
            for (let r of i[1]) {
                target = target + r + ', ';
            }
            target = target + '\n【联想】\n';
            for (let r of i[2]) {
                target = target + '  ' + r[0] + ':  ';
                for (let j of r[1]) {
                    target = target + j + ', ';
                }
                target += '\n';
            }
            target += '\n';
        }
        return target;
    }
    // 翻译模式
    for (let r of result[0]) {
        if (r[0]) {
            target = target + r[0];
        }
    }
    return target;
}
