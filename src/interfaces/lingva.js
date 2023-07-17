import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
    name: 'lingva',

    supportLanguage: {
        auto: 'auto',
        zh_cn: 'zh',
        zh_tw: 'zh_HANT',
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
        pt_br: 'pt',
        vi: 'vi',
        id: 'id',
        th: 'th',
        ms: 'ms',
        ar: 'ar',
        hi: 'hi',
    },
    needs: [
        {
            config_key: 'lingva_domain',
            place_hold: 'default: lingva.pot-app.com',
        },
    ],
};

export async function translate(text, from, to, setText, id) {
    const { supportLanguage } = info;

    if (!(to in supportLanguage) || !(from in supportLanguage)) {
        throw 'Unsupported Language';
    }

    let domain = get('lingva_domain') ?? '';
    if (domain === '') {
        domain = 'lingva.pot-app.com';
    }
    let plainText = text.replaceAll('/', '@@');
    let res = await fetch(
        `https://${domain}/api/v1/${supportLanguage[from]}/${supportLanguage[to]}/${encodeURIComponent(plainText)}`,
        {
            method: 'GET',
        }
    );

    if (res.ok) {
        let result = res.data;
        if (result.translation) {
            if (result.info && result.info.detectedSource) {
                if (result.info.detectedSource === supportLanguage[to]) {
                    let secondLanguage = get('second_language') ?? 'en';
                    if (secondLanguage !== to) {
                        await translate(text, from, secondLanguage, setText, id);
                        return;
                    }
                }
            }
            if (translateID.includes(id)) {
                setText(result.translation.replaceAll('@@', '/').trim());
            }
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}
