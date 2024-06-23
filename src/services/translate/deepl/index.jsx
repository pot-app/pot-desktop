import { fetch, Body } from '@tauri-apps/api/http';

export async function translate(text, from, to, options = {}) {
    const { config } = options;

    const serviceType = config['type'];
    if (serviceType === 'free') {
        return translate_by_free(text, from, to);
    } else if (serviceType === 'api') {
        return translate_by_key(text, from, to, config.authKey);
    } else if (serviceType === 'deeplx') {
        return translate_by_deeplx(text, from, to, config.customUrl);
    } else {
        return translate_by_free(text, from, to);
    }
}

async function translate_by_free(text, from, to) {
    const url = 'https://www2.deepl.com/jsonrpc';
    const rand = getRandomNumber();
    const body = {
        jsonrpc: '2.0',
        method: 'LMT_handle_texts',
        params: {
            splitting: 'newlines',
            lang: {
                source_lang_user_selected: from !== 'auto' ? from.slice(0, 2) : 'auto',
                target_lang: to.slice(0, 2),
            },
            texts: [{ text, requestAlternatives: 3 }],
            timestamp: getTimeStamp(getICount(text)),
        },
        id: rand,
    };

    let body_str = JSON.stringify(body);

    if ((rand + 5) % 29 === 0 || (rand + 3) % 13 === 0) {
        body_str = body_str.replace('"method":"', '"method" : "');
    } else {
        body_str = body_str.replace('"method":"', '"method": "');
    }

    let res = await fetch(url, {
        method: 'POST',
        body: Body.text(body_str),
        headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
        let result = res.data;
        if (result && result.result && result.result.texts) {
            return result.result.texts[0].text.trim();
        } else {
            throw JSON.stringify(result);
        }
    } else {
        if (res.data.error) {
            throw `Status Code: ${res.status}\n${res.data.error.message}`;
        } else {
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
        }
    }
}
async function translate_by_deeplx(text, from, to, url) {
    let res = await fetch(url, {
        method: 'POST',
        body: Body.json({
            source_lang: from,
            target_lang: to,
            text: text,
        }),
    });

    if (res.ok) {
        const result = res.data;
        if (result['data']) {
            return result['data'];
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

async function translate_by_key(text, from, to, key) {
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `DeepL-Auth-Key ${key}`,
    };
    let body = {
        text: [text],
        target_lang: to,
    };
    if (from !== 'auto') {
        body['source_lang'] = from;
    }
    let url;
    if (key.endsWith(':fx')) {
        url = 'https://api-free.deepl.com/v2/translate';
    } else if (key.endsWith(':dp')) {
        url = 'https://api.deepl-pro.com/v2/translate';
    } else {
        url = 'https://api.deepl.com/v2/translate';
    }
    let res = await fetch(url, {
        method: 'POST',
        body: Body.json(body),
        headers: headers,
    });

    if (res.ok) {
        const result = res.data;
        if ((result.translations, result.translations[0])) {
            return result.translations[0].text.trim();
        } else {
            throw JSON.stringify(result);
        }
    } else {
        if (res.data.error) {
            throw `Status Code: ${res.status}\n${res.data.error.message}`;
        } else {
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
        }
    }
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

function getICount(translate_text) {
    return translate_text.split('i').length - 1;
}

function getRandomNumber() {
    const rand = Math.floor(Math.random() * 99999) + 100000;
    return rand * 1000;
}

export * from './Config';
export * from './info';
