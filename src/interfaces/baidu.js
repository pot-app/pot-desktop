import { fetch } from '@tauri-apps/api/http';
import { nanoid } from "nanoid"
import md5 from "md5"
import { get } from "../global/config"

const languageMap = {
    "auto": "auto",
    "zh-cn": "zh",
    "zh-tw": 'cht',
    "yue": 'yue',
    "en": "en",
    "ja": "jp",
    "ko": "kor",
    "fr": "fra",
    "es": "spa",
    "ru": "ru",
    "de": "de",
}

export default class baidu {
    async translate(text, from, to) {
        const url = "https://fanyi-api.baidu.com/api/trans/vip/translate"
        const appid = get('baidu_appid', '');
        const secret = get('baidu_secret', '');
        const salt = nanoid();
        if (appid == "" || secret == "") {
            return '请先配置appid和secret'
        }
        if (!(from in languageMap) || !(to in languageMap)) {
            return '该接口不支持该语言'
        }
        const str = appid + text + salt + secret;
        const sign = md5(str);
        const res = await fetch(url, {
            method: "GET",
            query: {
                q: text,
                from: languageMap[from],
                to: languageMap[to],
                appid: appid,
                salt: salt,
                sign: sign
            }
        })
        let target = ""
        const { trans_result } = res.data;
        for (let i in trans_result) {
            target = target + trans_result[i]['dst'] + "\n"
        }

        return target
    }
}