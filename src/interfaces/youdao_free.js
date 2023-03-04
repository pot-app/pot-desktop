import { fetch } from '@tauri-apps/api/http';

export default class youdao_free {
    async translate(text) {
        let res = await fetch('https://fanyi.youdao.com/translate', {
            method: 'GET',
            timeout: 30,
            query: {
                "doctype": "json",
                "type": "AUTO",
                "i": text
            }
        });

        //let temp = JSON.parse(res);

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