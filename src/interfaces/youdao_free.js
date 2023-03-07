import { fetch } from '@tauri-apps/api/http';
// 此接口只支持英汉互译
const languageMap = {
    "auto": "AUTO",
    "zh-cn": "zh_CN",
    "en": "en"
}
export default class youdao_free {
    async translate(text, from, to) {
        if (!(from in languageMap) || !(to in languageMap)) {
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
}