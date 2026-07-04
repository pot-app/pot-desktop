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
    // oneshot-free API uses lowercase codes
    const langMap = {
        'ZH-HANS': 'zh-Hans',
        'ZH-HANT': 'zh-Hant',
    };
    from = langMap[from] || from.toLowerCase();
    to = langMap[to] || to.toLowerCase();

    const res = await fetch('https://oneshot-free.www.deepl.com/v1/storefront/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: Body.json({
            text: [text],
            source_lang: from,
            target_lang: to,
            language_model: 'next-gen',
            usage_type: 'Translate',
        }),
    });

    if (res.ok) {
        const result = res.data;
        if (result?.translations?.[0]?.text) {
            return result.translations[0].text.trim();
        }
        if (result?.translations?.[0]) {
            return result.translations[0].trim();
        }
        throw JSON.stringify(result);
    }

    const detail = res.data?.error?.message || JSON.stringify(res.data);
    throw `Http Request Error\nHttp Status: ${res.status}\n${detail}`;
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

export * from './Config';
export * from './info';
