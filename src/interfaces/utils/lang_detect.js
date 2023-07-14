import { fetch, Body } from '@tauri-apps/api/http';
const supportLanguage = {
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

export async function detect(text) {
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
        if (result.lan) {
            if (result.lan in supportLanguage) {
                return supportLanguage[result.lan];
            }
        }
    }
    return '_';
}
