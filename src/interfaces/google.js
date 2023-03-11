import { fetch } from '@tauri-apps/api/http';
import { get } from '../global/config';

// 此接口只支持英汉互译
export const info = {
    name: "谷歌翻译(免费)",
    supportLanguage: {
        "zh-cn": "zh_CN",
        "en": "en"
    },
    needs: {
        "google_proxy": "谷歌翻译镜像地址（http(s)://translate.xxx.xxx）"
    }
}

export async function translate(text, from, to) {
    const { supportLanguage } = info;
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        return '该接口只支持中英互译'
    }

    const domain = get('google_proxy', "https://translate.google.com");
    
    let res = await fetch(`${domain}/translate_a/single`, {
        method: 'GET',
        timeout: 5,
        query: {
            "client": "at",
            "sl": from,
            "tl": to,
            "dt":"t",
            "q":text
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
