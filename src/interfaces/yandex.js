import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch, Body } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
    name: 'yandex',
    supportLanguage: {
        auto: 'auto',
        zh_cn: 'zh',
        zh_tw: 'zh',
        en: 'en',
        ja: 'ja',
        ko: 'ko',
        fr: 'fr',
        es: 'es',
        ru: 'ru',
        de: 'de',
        it: 'it',
        tr: 'tr',
        pt: 'pt',
        vi: 'vi',
        id: 'id',
        th: 'th',
        ms: 'ms',
        ar: 'ar',
        hi: 'hi',
    },
    needs: [],
};
export async function translate(text, from, to, setText, id) {
    // 获取语言映射
    const { supportLanguage } = info;
    // 检查语言支持
    if (!(to in supportLanguage) || !(from in supportLanguage)) {
        throw 'Unsupported Language';
    }
    let lang = await detectLanguage(text);
    if (supportLanguage[to] === lang) {
        to = supportLanguage[get('second_language') ?? 'en'];
    } else {
        to = supportLanguage[to];
    }
    if (from === 'auto') {
        from = lang;
    } else {
        from = supportLanguage[from];
    }
    const url = 'https://translate.yandex.net/api/v1/tr.json/translate';
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        query: {
            id: `${generateSid()}-0-0`,
            srv: 'android',
        },
        body: Body.form({
            source_lang: from,
            target_lang: to,
            text,
        }),
    });
    if (res.ok) {
        const result = res.data;
        if (result.text) {
            if (translateID.includes(id)) {
                setText(result.text[0]);
            }
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

async function detectLanguage(text) {
    if (!text) {
        return '_';
    }
    if (Array.isArray(text)) {
        text = text.join('\n');
    }
    const res = await fetch('https://translate.yandex.net/api/v1/tr.json/detect', {
        query: {
            srv: 'android',
            text,
            sid: generateSid(),
        },
    });
    if (res.ok) {
        return res.data.lang;
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

function generateSid() {
    return crypto.randomUUID().replaceAll('-', '');
}
