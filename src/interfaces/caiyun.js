import request from './utils/request';
import { get } from '../windows/main';
import { searchWord } from './utils/dict';

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

export async function translate(text, from, to) {
    const { supportLanguage } = info;
    const url = 'https://api.interpreter.caiyunai.com/v1/translator';
    const token = get('caiyun_token') ?? '';
    if (token == '') {
        return '请先配置token';
    }
    if (!(to in supportLanguage) || !(from in supportLanguage)) {
        return '该接口不支持该语言';
    }
    if (text.split(' ').length == 1) {
        let target = await searchWord(text);
        if (target !== '') {
            return target;
        }
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

    let res = await request(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers,
    });

    let result = JSON.parse(res);
    const { target } = result;

    return target;
}
