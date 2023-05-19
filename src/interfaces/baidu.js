import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { nanoid } from 'nanoid';
import md5 from 'md5';

export const info = {
    name: '百度翻译',
    supportLanguage: {
        auto: 'auto',
        'zh-cn': 'zh',
        'zh-tw': 'cht',
        yue: 'yue',
        en: 'en',
        ja: 'jp',
        ko: 'kor',
        fr: 'fra',
        es: 'spa',
        ru: 'ru',
        de: 'de',
    },
    needs: [
        {
            config_key: 'baidu_appid',
            place_hold: '',
            display_name: 'AppID',
        },
        {
            config_key: 'baidu_secret',
            place_hold: '',
            display_name: '密钥',
        },
    ],
};

export async function translate(text, from, to, setText, id) {
    const { supportLanguage } = info;
    const url = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
    const appid = get('baidu_appid') ?? '';
    const secret = get('baidu_secret') ?? '';
    const salt = nanoid();
    if (appid == '' || secret == '') {
        throw '请先配置appid和secret';
    }
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        throw '该接口不支持该语言';
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
            if (sourceLanguage == supportLanguage[to]) {
                let secondLanguage = get('second_language') ?? 'en';
                if (secondLanguage != to) {
                    await translate(text, from, secondLanguage, setText, id);
                    return;
                }
            }
            const { trans_result } = result;
            for (let i in trans_result) {
                target = target + trans_result[i]['dst'] + '\n';
            }
            if (translateID.includes(id)) {
                setText(target);
            }
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw 'http请求出错\n' + JSON.stringify(res);
    }
}
