import request from './utils/request';
import { get } from '../global/config';
import { searchWord } from "./utils/dict";

// 此接口只支持英汉互译
export const info = {
    name: "谷歌翻译(免费)",
    supportLanguage: {
        "auto": "auto",
        "zh-cn": "zh_CN",
        "zh-tw": "zh-TW",
        "ja": "ja",
        "en": "en",
        "ko": "ko",
        "fr": "fr",
        "es": "es",
        "ru": "ru",
        "de": "de"
    },
    needs: {
        "google_proxy": "谷歌翻译镜像(eg:translate.google.com)"
    }
}

export async function translate(text, from, to) {
    const { supportLanguage } = info;
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        return '该接口不支持该语言'
    }
    if (text.split(' ').length == 1) {
        let target = await searchWord(text);
        if (target !== '') {
            return target
        }
    }
    let domain = get('google_proxy', "translate.google.com");
    if (domain == '') {
        domain = "translate.google.com"
    }

    let proxy = get('proxy', '');
    let res = await request(`https://${domain}/translate_a/single`, {
        query: {
            client: "at",
            sl: supportLanguage[from],
            tl: supportLanguage[to],
            dt: "t",
            q: text,
        },
        proxy: proxy
    })

    let result = JSON.parse(res);
    let target = ""
    for (let r of result[0]) {
        target = target + r[0]
    }
    return target
}