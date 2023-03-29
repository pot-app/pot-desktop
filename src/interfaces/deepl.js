import request from './utils/request';
import { searchWord } from "./utils/dict";
import { get } from "../global/config";

// 必须向外暴露info
export const info = {
    // 接口中文名称
    name: "DeepL",
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
    needs: {}
}

export async function translate(text, from, to) {
    const { supportLanguage } = info;

    function initData(source_lang, target_lang) {
        return {
            jsonrpc: '2.0',
            method: 'LMT_handle_texts',
            params: {
                splitting: 'newlines',
                lang: {
                    source_lang_user_selected: source_lang,
                    target_lang: target_lang
                }
            }
        };
    }

    function getICount(translate_text) {
        return translate_text.split('i').length - 1;
    }

    function getRandomNumber() {
        const rand = Math.floor(Math.random() * 99999) + 100000;
        return rand * 1000;
    }

    function getTimeStamp(iCount) {
        const ts = Date.now();
        if (iCount !== 0) {
            iCount = iCount + 1;
            return ts - (ts % iCount) + iCount;
        } else {
            return ts;
        }
    }

    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        return '该接口不支持该语言'
    }
    if (text.split(' ').length == 1) {
        let target = await searchWord(text);
        if (target !== '') {
            return target
        }
    }
    const url = 'https://www2.deepl.com/jsonrpc';
    let id = getRandomNumber()
    const post_data = initData(supportLanguage[from], supportLanguage[to]);
    const translate_text = {
        text: text,
        requestAlternatives: 3
    };
    post_data.id = id;
    post_data.params.texts = [translate_text];
    post_data.params.timestamp = getTimeStamp(getICount(text));
    let post_str = JSON.stringify(post_data);
    if ((id + 5) % 29 === 0 || (id + 3) % 13 === 0) {
        post_str = post_str.replace('"method":"', '"method" : "');
    } else {
        post_str = post_str.replace('"method":"', '"method": "');
    }

    let proxy = get('proxy', '');
    let res = await request(url, {
        method: 'POST',
        body: post_str,
        headers: {
            'Content-Type': 'application/json'
        },
        proxy: proxy
    })

    let result = JSON.parse(res);
    if (result && result.result && result.result.texts) {
        return result.result.texts[0].text;
    } else {
        return JSON.stringify(result.error)
    }
}
