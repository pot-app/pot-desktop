import { fetch } from '@tauri-apps/api/http';
import { get } from "../global/config"
import { searchWord } from "./dict";

export const info = {
    name: "彩云小译",
    supportLanguage: {
        "auto": "auto",
        "zh-cn": "zh",
        "en": "en",
        "ja": "ja"
    },
    needs: {
        "caiyun_token": "Token"
    }
}

export async function translate(text, from, to) {
    const { supportLanguage } = info;
    const url = "https://api.interpreter.caiyunai.com/v1/translator"
    const token = get('caiyun_token', '')
    if (token == "") {
        return '请先配置token'
    }
    if (!(to in supportLanguage) || !(from in supportLanguage)) {
        return '该接口不支持该语言'
    }
    if (text.split(' ').length == 1) {
        return await searchWord(text);
    } else {
        const body = {
            "source": [text],
            "trans_type": `${supportLanguage[from]}2${supportLanguage[to]}`,
            "request_id": "demo",
            "detect": true,
        }

        const headers = {
            "content-type": "application/json",
            "x-authorization": "token " + token,
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: {
                type: 'Text',
                payload: JSON.stringify(body)
            },
            timeout: 5
        })

        console.log(res)
        const { target } = res.data;

        return target
    }
}