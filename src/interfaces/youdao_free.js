import { fetch } from '@tauri-apps/api/http';
// 此接口只支持英汉互译

export default class youdao_free {
    async translate(text, _) {
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