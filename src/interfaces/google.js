import { fetch } from '@tauri-apps/api/http';
import { get } from '../global/config';
import { searchWord } from "./dict";

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
        return await searchWord(text);
    } else {
        let domain = get('google_proxy', "translate.google.com");
        if (domain == '') {
            domain = "translate.google.com"
        }
        let res = await fetch(`https://${domain}/translate_a/single`, {
            method: 'GET',
            timeout: 5,
            query: {
                "client": "at",
                "sl": supportLanguage[from],
                "tl": supportLanguage[to],
                "dt": "t",
                "q": text
            }
        });
        if (res.status == 200) {
            let result = ""
            for (let r of res.data[0]) {
                result = result + r[0]
            }
            return result
        }
        else {
            return "请求过于频繁，请求失败！"
        }
    }
}