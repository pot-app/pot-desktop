import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
    name: '彩云小译',
    supportLanguage: {
        auto: 'auto',
        'zh-cn': 'zh',
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

export async function translate(text, from, to, setText) {
    const { supportLanguage } = info;
    const url = 'https://api.interpreter.caiyunai.com/v1/translator';
    const token = get('caiyun_token') ?? '';
    if (token == '') {
        throw '请先配置token';
    }
    if (!(to in supportLanguage) || !(from in supportLanguage)) {
        throw '该接口不支持该语言';
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
        if (target) {
            if (target == text) {
                let secondLanguage = get('second_language') ?? 'en';
                if (to != secondLanguage) {
                    await translate(text, from, secondLanguage, setText);
                    return;
                }
            }
            setText(target);
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw 'http请求出错\n' + JSON.stringify(res);
    }
}
