import { fetch } from '@tauri-apps/api/http';
// 此接口只支持英汉互译
export const info = {
    name: "有道翻译(免费)",
    supportLanguage: {
        "auto": "AUTO",
        "zh-cn": "zh_CN",
        "en": "en"
    },
    needs: {}
}

export async function translate(text, from, to) {
    const { supportLanguage } = info;
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        return '该接口只支持中英互译'
    }
    let res = await fetch('https://fanyi.youdao.com/translate', {
        method: 'GET',
        timeout: 30,
        query: {
            "doctype": "json",
            "type": "AUTO",
            "i": text
        }
    });

    let res_list = res.data["translateResult"];
    let target = "";
    for (let r in res_list) {
        for (let c in res_list[r]) {
            target = `${target} ${res_list[r][c]['tgt']}`;
        }
        target = `${target}\n`;
    }

    return target
}
