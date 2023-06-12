import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { ocrID } from '../windows/Ocr/components/TextArea';
import CryptoJS from 'crypto-js';

export const info = {
    name: 'iflytek',
    supportLanguage: {
        zh_cn: 'zh_cn',
        zh_tw: 'zh_tw',
        en: 'en',
    },
    needs: [
        {
            config_key: 'iflytek_ocr_appid',
            place_hold: '',
        },
        {
            config_key: 'iflytek_ocr_apisecret',
            place_hold: '',
        },
        {
            config_key: 'iflytek_ocr_apikey',
            place_hold: '',
        },
    ],
}

export async function ocr(base64, lang, setText, id) {
    const { supportLanguage } = info;
    if (!(lang in supportLanguage)) {
        throw 'Unsupported Language, iflytek universal character recognition only support Chinese and English.';
    }
    // 获取设置项
    const appid = get('iflytek_ocr_appid') ?? '';
    const apikey = get('iflytek_ocr_apikey') ?? '';
    const apisecret = get('iflytek_ocr_apisecret') ?? '';

    if (appid === '' || apikey === '' || apisecret === '') {
        throw 'Please configure your appid, apikey and apisecret';
    }

    const host = 'api.xf-yun.com';
    const today = new Date;
    const date = today.toUTCString();
    const request_line = 'POST /v1/private/sf8e6aca1 HTTP/1.1';

    let auth = iflytek_auth(apikey, apisecret, host, date, request_line);

    let request_url =
        'https://api.xf-yun.com/v1/private/sf8e6aca1?' +
        'authorization=' + auth +
        '&host=' + host +
        '&date=' + encodeURIComponent(date);

    let request_body = {
        header: {
            app_id: appid, // 在讯飞开放平台申请的appid信息
            status: 3, // 请求状态，取值为：3（一次传完）
        },
        parameter: {
            sf8e6aca1: {
                category: 'ch_en_public_cloud', // ch_en_public_cloud：中英文识别
                result: {
                    encoding: 'utf8',
                    compress: 'raw',
                    format: 'json'
                }
            }
        },
        payload: {
            sf8e6aca1_data_1: {
                image: base64
            }
        }
    }

    let res = await fetch(request_url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', },
        body: { type: 'Text', payload: JSON.stringify(request_body) }
    });

    if (!res.ok) {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }

    let data = res['data'];
    if (!data) {
        throw `Result data not found\nResult:\n${JSON.stringify(res)}`;
    }
    let res_payload = data['payload'];
    if (!res_payload) {
        throw `Result payload not found\nResult:\n${JSON.stringify(res)}`;
    }

    let text = CryptoJS.enc.Base64.parse(res_payload['result']['text']); // Base64解码
    let text_string = CryptoJS.enc.Utf8.stringify(text);
    let text_json = JSON.parse(text_string);
    let return_content = ''; // 最终结果


    let pages = text_json['pages'];
    for (let page of pages) {
        let lines = page['lines'];
        for (let line of lines) {
            let words = line['words'];
            for (let word of words) {
                return_content += word['content'] + ' ';
            }
            return_content += '\n'
        }
    }

    if (id === ocrID || id === 'translate') {
        setText(return_content);
    }
}

export function iflytek_auth(api_key, api_secret, host, date, request_line) {
    const signature_origin =
        'host: ' + host + '\n' +
        'date: ' + date + '\n' +
        request_line;
    let signature_sha = CryptoJS.HmacSHA256(signature_origin, api_secret);
    let signature = CryptoJS.enc.Base64.stringify(signature_sha);
    let authorization_origin =
        'api_key=\"' + api_key + '\", ' +
        'algorithm=\"hmac-sha256\", ' +
        'headers=\"host date request-line\", ' +
        'signature=\"' + signature + '\"';
    let authorization = window.btoa(authorization_origin);
    return authorization;
}