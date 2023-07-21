import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { nanoid } from 'nanoid';
import md5 from 'md5';

export const info = {
    name: 'baidu_field',
    // https://fanyi-api.baidu.com/product/113
    supportLanguage: {
        auto: 'auto',
        zh_cn: 'zh',
        zh_tw: 'zh',
        en: 'en',
    },
    needs: [
        {
            config_key: 'baidu_field_appid',
            place_hold: '',
        },
        {
            config_key: 'baidu_field_secret',
            place_hold: '',
        },
        {
            config_key: 'baidu_field_field',
            place_hold: 'Support Value: it, finance, machinery, senimed, novel, academic, aerospace, wiki, news, law, contract',
        },
    ],
};

export async function translate(text, from, to, setText, id) {
    const { supportLanguage } = info;
    const url = 'https://fanyi-api.baidu.com/api/trans/vip/fieldtranslate';
    const appid = get('baidu_field_appid') ?? '';
    const secret = get('baidu_field_secret') ?? '';
    const field = get('baidu_field_field') ?? '';
    const supportField = ['it', 'finance', 'machinery', 'senimed', 'novel', 'academic', 'aerospace', 'wiki', 'news', 'law', 'contract'];

    const salt = nanoid();
    if (appid === '' || secret === '') {
        throw 'Please configure appid and secret';
    }
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        throw 'Unsupported Language';
    }
    if (!supportField.includes(field)) {
        throw 'Unsupported Field';
    }

    const str = appid + text + salt + field + secret;
    const sign = md5(str);

    let res = await fetch(url, {
        query: {
            q: text,
            from: supportLanguage[from],
            to: supportLanguage[to],
            appid: appid,
            salt: salt,
            sign: sign,
            domain: field,
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
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}
