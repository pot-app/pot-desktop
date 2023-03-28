import { invoke } from '@tauri-apps/api';
import { get } from "../global/config";

export async function searchWord(word) {
    const url = "http://dict-mobile.iciba.com/interface/index.php"

    let proxy = get('proxy', '');
    let res = await invoke('http_request', {
        url: url, options: {
            query: [
                ['c', "word"],
                ['m', "getsuggest"],
                ['nums', '1'],
                ['client', '6'],
                ['is_need_mean', '1'],
                ['word', word]
            ],
            proxy: proxy
        }
    })
    let result = JSON.parse(res);
    let target = "";
    for (let i of result['message'][0]["means"]) {
        target += i['part'] + " ";
        for (let j of i['means']) {
            target += j + ", ";
        }
        target += "\n";
    }

    return target;
}