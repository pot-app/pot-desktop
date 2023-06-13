import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { nanoid } from 'nanoid';
import md5 from 'md5';

export const info = {
    name: 'baidu',
    supportLanguage: {
        auto: 'auto',
        zh_cn: 'zh',
        zh_tw: 'cht',
        yue: 'yue',
        en: 'en',
        ja: 'jp',
        ko: 'kor',
        fr: 'fra',
        es: 'spa',
        ru: 'ru',
        de: 'de',
        it: 'it',
        tr: 'tr',
        pt: 'pt',
        vi: 'vie',
        id: 'id',
        th: 'th',
        ms: 'may',
        ar: 'ar',
        hi: 'hi',
    },
    needs: [
        {
            config_key: 'baidu_appid',
            place_hold: '',
        },
        {
            config_key: 'baidu_secret',
            place_hold: '',
        },
    ],
};

export async function translate(text, from, to, setText, id) {
    const { supportLanguage } = info;
    const url = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
    const appid = get('baidu_appid') ?? '';
    const secret = get('baidu_secret') ?? '';
    const salt = nanoid();
    if (appid === '' || secret === '') {
        throw 'Please configure appid and secret';
    }
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        throw 'Unsupported Language';
    }

    const str = appid + text + salt + secret;
    const sign = md5(str);

    let res = await fetch(url, {
        query: {
            q: text,
            from: supportLanguage[from],
            to: supportLanguage[to],
            appid: appid,
            salt: salt,
            sign: sign,
        },
    });
    if (res.ok) {
        let result = res.data;
        let target = '';
        if (result['from']) {
            let sourceLanguage = result['from'];
            if (sourceLanguage === supportLanguage[to]) {
                let secondLanguage = get('second_language') ?? 'en';
                if (secondLanguage !== to) {
                    await translate(text, from, secondLanguage, setText, id);
                    return;
                }
            }
            const { trans_result } = result;
            for (let i in trans_result) {
                target = target + trans_result[i]['dst'] + '\n';
            }
            if (translateID.includes(id)) {
                setText(target.trim());
            }
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res)}`;
    }
}
