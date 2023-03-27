import { fetch } from '@tauri-apps/api/http';

export async function searchWord(word) {
    const url = "http://dict-mobile.iciba.com/interface/index.php"
    const query = {
        c: "word",
        m: "getsuggest",
        nums: '1',
        client: '6',
        is_need_mean: '1',
        word: word
    }
    const res = await fetch(url, {
        method: "GET",
        query: query,
    })
    let result = "";
    if (res.ok) {
        for (let i of res.data['message'][0]["means"]) {
            result += i['part'] + " ";
            for (let j of i['means']) {
                result += j + ", ";
            }
            result += "\n";
        }
    }
    return result;
}