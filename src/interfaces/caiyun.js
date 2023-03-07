import axios from "axios"
import { get } from "../global/config"

const languageMap = {
    "zh-cn": "zh",
    "en": "en",
    "ja": "ja",
}

export default class youdao_free {
    async translate(text, lang) {
        const url = "http://api.interpreter.caiyunai.com/v1/translator"
        const token = get('caiyun_token', '')
        if (token == "") {
            return '请先配置token'
        }
        if (!(lang in languageMap)) {
            return '该接口不支持该语言'
        }

        const body = {
            "source": [text],
            "trans_type": `auto2${languageMap[lang]}`,
            "request_id": "demo",
            "detect": true,
        }

        const headers = {
            "content-type": "application/json",
            "x-authorization": "token " + token,
        }
        const res = await axios.post(url, body, {
            headers: headers,
            timeout: 30000,
        })
        const { target } = res.data;

        return target
    }
}