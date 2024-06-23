import { fetch, Body } from '@tauri-apps/api/http';

export async function recognize(base64, language, options = {}) {
    const { config } = options;

    const { client_id, client_secret } = config;

    const url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic';
    const token_url = 'https://aip.baidubce.com/oauth/2.0/token';

    const token_res = await fetch(token_url, {
        method: 'POST',
        query: {
            grant_type: 'client_credentials',
            client_id,
            client_secret,
        },
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    });
    if (token_res.ok) {
        if (token_res.data.access_token) {
            let token = token_res.data.access_token;

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                query: {
                    access_token: token,
                },
                body: Body.form({
                    language_type: language,
                    detect_direction: 'false',
                    image: base64,
                }),
            });
            if (res.ok) {
                let result = res.data;
                if (result['words_result']) {
                    let target = '';
                    for (let i of result['words_result']) {
                        target += i['words'] + '\n';
                    }
                    return target.trim();
                } else {
                    throw JSON.stringify(result);
                }
            } else {
                throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
            }
        } else {
            throw 'Get Access Token Failed!';
        }
    } else {
        throw `Http Request Error\nHttp Status: ${token_res.status}\n${JSON.stringify(token_res.data)}`;
    }
}

export * from './Config';
export * from './info';
