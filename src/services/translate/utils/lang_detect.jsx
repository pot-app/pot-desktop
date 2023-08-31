import { fetch, Body } from '@tauri-apps/api/http';
import { invoke } from '@tauri-apps/api';

export async function baidu_detect(text) {
    const lang_map = {
        zh: 'zh_cn',
        cht: 'zh_tw',
        yue: 'yue',
        en: 'en',
        jp: 'ja',
        kor: 'ko',
        fra: 'fr',
        spa: 'es',
        ru: 'ru',
        de: 'de',
        it: 'it',
        tr: 'tr',
        pt: 'pt',
        vie: 'vi',
        id: 'id',
        th: 'th',
        may: 'ms',
        ar: 'ar',
        hi: 'hi',
    };
    let res = await fetch('https://fanyi.baidu.com/langdetect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: Body.form({
            query: text,
        }),
    });
    if (res.ok) {
        let result = res.data;
        if (result.lan && result.lan in lang_map) {
            return lang_map[result.lan];
        }
    }
    return '';
}

export async function google_detect(text) {
    const lang_map = {
        'zh-CN': 'zh_cn',
        'zh-TW': 'zh_Ttw',
        ja: 'ja',
        en: 'en',
        ko: 'ko',
        fr: 'fr',
        es: 'es',
        ru: 'ru',
        de: 'de',
        it: 'it',
        tr: 'tr',
        pt: 'pt_pt',
        vi: 'vi',
        id: 'id',
        th: 'th',
        ms: 'ms',
        ar: 'ar',
        hi: 'hi',
        mn: 'mn_cy',
        km: 'km',
    };
    let res = await fetch(
        `https://translate.google.com/translate_a/single?dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t`,
        {
            method: 'GET',
            headers: { 'content-type': 'application/json' },
            query: {
                client: 'gtx',
                sl: 'auto',
                tl: 'zh-CN',
                hl: 'zh-CN',
                ie: 'UTF-8',
                oe: 'UTF-8',
                otf: '1',
                ssel: '0',
                tsel: '0',
                kc: '7',
                q: text,
            },
        }
    );
    if (res.ok) {
        const result = res.data;
        if (result[2] && result[2] in lang_map) {
            return result[2];
        }
    }
    return '';
}

export async function local_detect(text) {
    return await invoke('lang_detect', { text: text });
}
