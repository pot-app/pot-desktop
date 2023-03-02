import { invoke } from '@tauri-apps/api/tauri'

export default async function translator(text) {
    let res = await invoke('fetch', {
        method: 'GET',
        url: 'https://fanyi.youdao.com/translate',
        query: {
            "doctype": "json", "type": "AUTO", "i": text
        }
    });
    let temp = JSON.parse(res);

    let res_list = temp["translateResult"];
    let target = "";
    for (let r in res_list) {
        for (let c in res_list[r]) {
            target = `${target} ${res_list[r][c]['tgt']}`;
        }
        target = `${target}\n`;
    }
    console.log(target);
    return target
}