import { fetch } from '@tauri-apps/api/http';
import { get } from "../global/config"
import { searchWord } from "./dict";
import { nanoid } from "nanoid"
import md5 from "md5"

export const info = {
    name: "百度翻译",
    supportLanguage: {
        "auto": "auto",
        "zh-cn": "zh",
        "zh-tw": "cht",
        "yue": "yue",
        "en": "en",
        "ja": "jp",
        "ko": "kor",
        "fr": "fra",
        "es": "spa",
        "ru": "ru",
        "de": "de"
    },
    needs: {
        "baidu_appid": "AppId",
        "baidu_secret": "密钥"
    }
}

export async function translate(text, from, to) {
    const { supportLanguage } = info;
    const url = "https://fanyi-api.baidu.com/api/trans/vip/translate"
    const appid = get('baidu_appid', '');
    const secret = get('baidu_secret', '');
    const salt = nanoid();
    if (appid == "" || secret == "") {
        return '请先配置appid和secret'
    }
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        return '该接口不支持该语言'
    }
    if (text.split(' ').length == 1) {
        return await searchWord(text);
    } else {
        const str = appid + text + salt + secret;
        const sign = md5(str);
        const res = await fetch(url, {
            method: "GET",
            query: {
                q: text,
                from: supportLanguage[from],
                to: supportLanguage[to],
                appid: appid,
                salt: salt,
                sign: sign
            },
            timeout: 5
        })
        let target = ""
        const { trans_result } = res.data;
        for (let i in trans_result) {
            target = target + trans_result[i]['dst'] + "\n"
        }

        return target
    }

}
