import { fetch } from '@tauri-apps/api/http';
import { get } from "../global/config"

// 必须向外暴露info
export const info = {
    // 接口中文名称
    name: "DeepLX",
    // 接口支持语言及映射
    supportLanguage: {
        "auto": "auto",
        "zh-tw": "ZH",
        "zh-cn": "ZH",
        "de": "DE",
        "en": "EN",
        "es": "ES",
        "fr": "FR",
        "ja": "JA",
        "ru": "RU",
    },
    // 接口需要配置项
    needs: {
        "deeplx_url": "DeepLX请求地址"
    }
}
//必须向外暴露translate
export async function translate(text, from, to) {
    // 获取语言映射
    const { supportLanguage } = info;
    // 获取设置项
    const url = get('deeplx_url', '');
    if (url == "") {
        return '请先配置请求地址'
    }
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        return '该接口不支持该语言'
    }
    const res = await fetch(`http://${url}/translate`, {
        method: 'POST',
        body: {
            type: 'Json',
            payload: {
                source_lang: supportLanguage[from],
                target_lang: supportLanguage[to],
                text: text
            }
        }
    })
    if (res.ok) {
        return res.data['data']
    } else {
        return res.status
    }

}

