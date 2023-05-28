import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

// 必须向外暴露info
export const info = {
    // 接口中文名称
    name: 'DeepL',
    // 接口支持语言及映射
    supportLanguage: {
        auto: 'auto',
        'zh-tw': 'ZH',
        'zh-cn': 'ZH',
        de: 'DE',
        en: 'EN',
        es: 'ES',
        fr: 'FR',
        ja: 'JA',
        ru: 'RU',
        it: 'IT',
        tr: 'TR',
        pt: 'PT',
        id: 'ID',
    },
    // 接口需要配置项
    needs: [
        {
            config_key: 'deepl_key',
            place_hold: '没有请留空，使用自己的Key可以避免频繁请求导致的返回错误问题',
            display_name: 'Auth Key',
        },
    ],
};

export async function translate(text, from, to, setText, id) {
    const key = get('deepl_key') ?? '';

    if (key != '') {
        await translate_by_key(text, from, to, setText, id, key);
        return;
    }

    const { supportLanguage } = info;

    function initData(source_lang, target_lang) {
        return {
            jsonrpc: '2.0',
            method: 'LMT_handle_texts',
            params: {
                splitting: 'newlines',
                lang: {
                    source_lang_user_selected: source_lang,
                    target_lang: target_lang,
                },
            },
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
        throw '该接口不支持该语言';
    }

    const url = 'https://www2.deepl.com/jsonrpc';
    let rand = getRandomNumber();
    const post_data = initData(supportLanguage[from], supportLanguage[to]);
    const translate_text = {
        text: text,
        requestAlternatives: 3,
    };
    post_data[id] = rand;
    post_data.params.texts = [translate_text];
    post_data.params.timestamp = getTimeStamp(getICount(text));
    let post_str = JSON.stringify(post_data);
    if ((rand + 5) % 29 === 0 || (rand + 3) % 13 === 0) {
        post_str = post_str.replace('"method":"', '"method" : "');
    } else {
        post_str = post_str.replace('"method":"', '"method": "');
    }

    let res = await fetch(url, {
        method: 'POST',
        body: {
            type: 'Text',
            payload: post_str,
        },
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (res.ok) {
        let result = res.data;
        if (result && result.result && result.result.texts && result.result.lang) {
            if (result.result.lang == supportLanguage[to]) {
                let secondLanguage = get('second_language') ?? 'en';
                if (secondLanguage != to) {
                    await translate(text, from, secondLanguage, setText, id);
                    return;
                }
            }
            if (translateID.includes(id)) {
                setText(result.result.texts[0].text.trim());
            }
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http请求错误\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

async function translate_by_key(text, from, to, setText, id, key) {
    const { supportLanguage } = info;

    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        throw '该接口不支持该语言';
    }
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `DeepL-Auth-Key ${key}`
    }
    let body = {
        'text': [text],
        'target_lang': supportLanguage[to]
    }
    if (from != 'auto') {
        body['source_lang'] = supportLanguage[from];
    }
    let res = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        body: {
            type: 'Json',
            payload: body,
        },
        headers: headers
    });
    if (res.ok) {
        const result = res.data;
        if (result.translations, result.translations[0]) {
            if (result.translations[0]['detected_source_language'] == supportLanguage[to]) {
                let secondLanguage = get('second_language') ?? 'en';
                if (secondLanguage != to) {
                    await translate_by_key(text, from, secondLanguage, setText, id, key);
                    return;
                }
            }
            if (translateID.includes(id)) {
                setText(result.translations[0].text.trim());
            }
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http请求错误\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}