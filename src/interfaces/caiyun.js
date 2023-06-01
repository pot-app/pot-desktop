import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
    name: 'caiyun',
    supportLanguage: {
        auto: 'auto',
        zh_cn: 'zh',
        zh_tw: 'zh',
        en: 'en',
        ja: 'ja',
    },
    needs: [
        {
            config_key: 'caiyun_token',
            place_hold: '',
            display_name: 'Token',
        },
    ],
};

export async function translate(text, from, to, setText, id) {
    const { supportLanguage } = info;
    const url = 'https://api.interpreter.caiyunai.com/v1/translator';
    const token = get('caiyun_token') ?? '';
    if (token === '') {
        throw 'Please configure token';
    }
    if (!(to in supportLanguage) || !(from in supportLanguage)) {
        throw 'Unsupported Language';
    }

    const body = {
        source: [text],
        trans_type: `${supportLanguage[from]}2${supportLanguage[to]}`,
        request_id: 'demo',
        detect: true,
    };

    const headers = {
        'content-type': 'application/json',
        'x-authorization': 'token ' + token,
    };

    let res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: {
            type: 'Json',
            payload: body,
        },
    });

    if (res.ok) {
        let result = res.data;
        const { target } = result;
        if (target[0]) {
            if (target[0] === text) {
                let secondLanguage = get('second_language') ?? 'en';
                if (to !== secondLanguage) {
                    await translate(text, from, secondLanguage, setText, id);
                    return;
                }
            }

            if (translateID.includes(id)) {
                setText(target[0]);
            }
        } else {
            throw JSON.stringify(result.trim());
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}
