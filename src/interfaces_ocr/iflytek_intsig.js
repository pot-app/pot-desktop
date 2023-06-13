import { invoke } from '@tauri-apps/api/tauri';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { ocrID } from '../windows/Ocr/components/TextArea';
import CryptoJS from 'crypto-js';
import { iflytek_auth } from './iflytek';

export const info = {
    name: 'iflytek_intsig',
    supportLanguage: {},
    needs: [
        {
            config_key: 'iflytek_ocr_intsig_appid',
            place_hold: '',
        },
        {
            config_key: 'iflytek_ocr_intsig_apisecret',
            place_hold: '',
        },
        {
            config_key: 'iflytek_ocr_intsig_apikey',
            place_hold: '',
        },
    ],
}

export async function ocr(base64, lang, setText, id) {
    // 获取设置项
    const appid = get('iflytek_ocr_intsig_appid') ?? '';
    const apikey = get('iflytek_ocr_intsig_apikey') ?? '';
    const apisecret = get('iflytek_ocr_intsig_apisecret') ?? '';

    if (appid === '' || apikey === '' || apisecret === '') {
        throw 'Please configure your appid, apikey and apisecret';
    }

    const host = 'api.xf-yun.com';
    const today = new Date;
    const date = today.toUTCString();
    const request_line = 'POST /v1/private/hh_ocr_recognize_doc HTTP/1.1';

    let auth = iflytek_auth(apikey, apisecret, host, date, request_line);

    let request_url =
        'https://api.xf-yun.com/v1/private/hh_ocr_recognize_doc?' +
        'authorization=' + auth +
        '&host=' + host +
        '&date=' + encodeURIComponent(date);

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
                    format: 'json'
                }
            }
        },
        payload: {
            image: {
                image: base64
            }
        }
    }

    // 发送请求
    let res = await fetch(request_url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', },
        body: { type: 'Text', payload: JSON.stringify(request_body) }
    });

    // 处理结果
    if (!res.ok && (id === ocrID || id === 'translate')) {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
    let data = res['data'];
    if (!data && (id === ocrID || id === 'translate')) {
        throw `Result data not found\nResult:\n${JSON.stringify(res)}`;
    }
    let res_payload = data['payload'];
    if (!res_payload && (id === ocrID || id === 'translate')) {
        throw `Result payload not found\nResult:\n${JSON.stringify(res)}`;
    }

    let text = CryptoJS.enc.Base64.parse(res_payload['recognizeDocumentRes']['text']); // Base64解码
    let text_string = CryptoJS.enc.Utf8.stringify(text);
    let text_json = JSON.parse(text_string);
    let return_content = text_json['whole_text']; // 最终结果
    if (!return_content) { return_content = ''; }

    if (id === ocrID || id === 'translate') {
        setText(return_content);
    }
}