import { invoke } from '@tauri-apps/api/tauri';
import { fetch, Body } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { ocrID } from '../windows/Ocr/components/TextArea';

export const info = {
    name: 'baidu_accurate',
    supportLanguage: {
        auto: 'auto_detect',
        zh_cn: 'CHN_ENG',
        zh_tw: 'CHN_ENG',
        en: 'ENG',
        yue: 'CHN_ENG',
        ja: 'JAP',
        ko: 'KOR',
        fr: 'FRE',
        es: 'SPA',
        ru: 'RUS',
        de: 'GER',
        it: 'ITA',
        tr: 'TUR',
        pt: 'POR',
        vi: 'VIE',
        id: 'IND',
        th: 'THA',
        ms: 'MAL',
        ar: 'ARA',
        hi: 'HIN',
    },
    needs: [
        {
            config_key: 'baidu_accurate_ocr_client_id',
            place_hold: '',
        },
        {
            config_key: 'baidu_accurate_ocr_client_secret',
            place_hold: '',
        },
    ],
};

export async function ocr(base64, lang, setText, id) {
    const { supportLanguage } = info;
    if (!(lang in supportLanguage)) {
        throw 'Unsupported Language';
    }
    const client_id = get('baidu_accurate_ocr_client_id') ?? '';
    const client_secret = get('baidu_accurate_ocr_client_secret') ?? '';
    if (client_id === '' || client_secret === '') {
        throw 'Please configure client_id and client_secret';
    }

    const url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic';
    const token_url = "https://aip.baidubce.com/oauth/2.0/token"

    const token_res = await fetch(token_url, {
        method: 'POST', query: {
            grant_type: 'client_credentials',
            client_id,
            client_secret
        },
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    if (token_res.ok) {
        if (token_res.data.access_token) {
            let token = token_res.data.access_token;

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                query: {
                    access_token: token
                },
                body: Body.form({
                    'language_type': supportLanguage[lang],
                    'detect_direction': 'false',
                    'image': base64
                }),
            }
            )
            if (res.ok) {
                let result = res.data;
                if (result['words_result']) {
                    let target = '';
                    for (let i of result['words_result']) {
                        target += i['words'] + '\n';
                        if (id === ocrID || id === 'translate') {
                            setText(target.trim());
                        }
                    }
                } else {
                    if (id === ocrID || id === 'translate') {
                        throw JSON.stringify(result);
                    }
                }
            } else {
                if (id === ocrID || id === 'translate') {
                    throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res)}`;
                }
            }
        } else {
            if (id === ocrID || id === 'translate') {
                throw 'Get Access Token Failed!'
            }
        }
    } else {
        if (id === ocrID || id === 'translate') {
            throw `Http Request Error\nHttp Status: ${token_res.status}\n${JSON.stringify(token_res.data)}`;
        }
    }
}