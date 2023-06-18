import { translateID } from '../windows/Translator/components/TargetArea';
import { Body, fetch } from '@tauri-apps/api/http';

// 翻译服务商：https://www.mojidict.com/search
export const info = {
    name: 'moji_dict',
    needs: [],
};

const URL = 'https://api.mojidict.com/parse/functions/union-api';
const TYPE_WORD = {
    key: 'word',
    code: 102
};
export async function translate(text, from, to, setText, id) {
    // 该接口只支持查询单词且目标语言为日语, 这里为了避免查询过程中频繁展示报错内容所以直接不返回内容
    if (text.split(' ').length > 1 || to !== 'ja') {
        return;
    }

    let res = await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'User-Agent': 'pot translate',
        },
        body: Body.json({
            "functions": [
                {
                    "name": "search-all",
                    "params": {
                        "text": text,
                        "types": [TYPE_WORD.code]
                    }
                }
            ],
            "_ClientVersion": "js3.4.1",
            "_ApplicationId": "E62VyFVLMiW7kvbtVq3p",
            "g_os": "PCWeb",
            "g_ver": "v4.6.4.20230615",
            "_InstallationId": "1f7dbb56-9030-4f32-9645-0df69f86c591"
        })
    });

    if (res.ok && res.data.result.code == 200) {
        const explains = res.data.result.results['search-all'].result[TYPE_WORD.key].searchResult
        const explainTexts = explains.map(e => `${e.title}\n${e.excerpt}`);
        if (translateID.includes(id)) {
            setText([...explainTexts].join('\n\n'));
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}
