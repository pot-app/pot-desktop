import { fetch } from '@tauri-apps/api/http';
import CryptoJS from 'crypto-js';
import { iflytek_auth } from '../iflytek';

export async function recognize(base64, language, options = {}) {
    const { config } = options;

    const { appid, apisecret, apikey } = config;

    const host = 'api.xf-yun.com';
    const today = new Date();
    const date = today.toUTCString();
    const request_line = 'POST /v1/private/hh_ocr_recognize_doc HTTP/1.1';

    let auth = iflytek_auth(apikey, apisecret, host, date, request_line);

    let request_url =
        'https://api.xf-yun.com/v1/private/hh_ocr_recognize_doc?' +
        'authorization=' +
        auth +
        '&host=' +
        host +
        '&date=' +
        encodeURIComponent(date);

    let request_body = {
        header: {
            app_id: appid, // 在讯飞开放平台申请的appid信息
            status: 3, // 请求状态，取值为：3（一次传完）
        },
        parameter: {
            hh_ocr_recognize_doc: {
                recognizeDocumentRes: {
                    encoding: 'utf8',
                    compress: 'raw',
                    format: 'json',
                },
            },
        },
        payload: {
            image: {
                image: base64,
            },
        },
    };

    // 发送请求
    let res = await fetch(request_url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: { type: 'Text', payload: JSON.stringify(request_body) },
    });

    // 处理结果
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

    let text = CryptoJS.enc.Base64.parse(res_payload['recognizeDocumentRes']['text']); // Base64解码
    let text_string = CryptoJS.enc.Utf8.stringify(text);
    let text_json = JSON.parse(text_string);
    let return_content = text_json['whole_text']; // 最终结果
    if (!return_content) {
        return_content = '';
    }
    return return_content.trim();
}

export * from './Config';
export * from './info';
