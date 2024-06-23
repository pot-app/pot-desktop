import { fetch, Body } from '@tauri-apps/api/http';
import CryptoJS from 'crypto-js';

export async function recognize(base64, language, options = {}) {
    const { config } = options;

    const { appid, secret } = config;

    let text = await multi_lang_ocr(base64, appid, secret);

    return text.trim();
}

async function multi_lang_ocr(img_base64, appid, secret) {
    let res = await query(img_base64, 'MultiLanguageOCR', '2022-08-31', appid, secret);
    if (res.ok) {
        let result = res.data;
        if (result['data']) {
            let data = result['data'];
            var texts = '';
            for (let text of data['ocr_infos']) {
                texts += text['text'] + '\n';
            }
            return texts;
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

async function query(img_base64, action, serviceVersion, appid, secret) {
    const schema = 'https';
    const host = 'visual.volcengineapi.com';
    const contentType = 'application/x-www-form-urlencoded';
    const method = 'POST';
    const path = '/';

    // Body 及其参数
    const approximate_pixel = 0; // 文本行高度差距为approximate_pixel时近似为同一行,未选时默认为"0"
    const mode = 'default'; // 文字识别模式:"default"-默认模式、"text_block"-文本块模式
    const filter_thresh = 80; // 置信分数低于filter_thresh的文本行将被过滤掉, 默认为"80", 最大为"100"
    let body = `image_base64=${encodeURIComponent(
        img_base64
    )}&approximate_pixel=${approximate_pixel}&mode=${mode}&filter_thresh=${filter_thresh}`;
    let body_hash = CryptoJS.SHA256(body).toString(CryptoJS.enc.Hex);

    // Header X-Date
    let today = new Date();
    let xDate = today
        .toISOString()
        .replaceAll('-', '')
        .replaceAll(':', '')
        .replaceAll(/\.[0-9]*/g, '');

    // Header Authorization
    let credentials = {
        ak: appid,
        sk: secret,
        service: 'cv',
        region: 'cn-north-1',
        session_token: '',
    };
    const md = {
        /* meta data */ algorithm: 'HMAC-SHA256',
        credential_scope: '',
        signed_headers: '',
        date: xDate.slice(0, 8),
        region: credentials['region'],
        service: credentials['service'],
    };
    md['credential_scope'] = md['date'] + '/' + md['region'] + '/' + md['service'] + '/request';

    const headers = {
        /* request headers, sorted */ Authorization: '',
        'Content-Type': contentType,
        Host: host,
        'X-Content-Sha256': body_hash,
        'X-Date': xDate,
    };

    // 签名
    const signed_headers = {
        // key is lower case and sorted
        'content-type': contentType,
        host: host,
        'x-content-sha256': body_hash,
        'x-date': xDate,
    };
    let signed_str = '';
    let md_signed_headers = '';
    const signedHeaderKeys = Object.keys(signed_headers);
    for (let i = 0; i < signedHeaderKeys.length; i += 1) {
        signed_str += signedHeaderKeys[i] + ':' + signed_headers[signedHeaderKeys[i]] + '\n';
        md_signed_headers += signedHeaderKeys[i] + ';';
    }
    md['signed_headers'] = md_signed_headers.slice(0, -1);

    let norm_uri = path;
    let norm_query = 'Action=' + action + '&Version=' + serviceVersion;
    let canoncial_request =
        method +
        '\n' +
        norm_uri +
        '\n' +
        norm_query +
        '\n' +
        signed_str +
        '\n' +
        md['signed_headers'] +
        '\n' +
        body_hash;
    let hashed_canon_req = CryptoJS.SHA256(canoncial_request).toString(CryptoJS.enc.Hex);

    let kdate = CryptoJS.HmacSHA256(md['date'], secret);
    let kregion = CryptoJS.HmacSHA256(md['region'], kdate);
    let kservice = CryptoJS.HmacSHA256(md['service'], kregion);
    let signing_key = CryptoJS.HmacSHA256('request', kservice);

    let signing_str = md['algorithm'] + '\n' + xDate + '\n' + md['credential_scope'] + '\n' + hashed_canon_req;
    let sign = CryptoJS.HmacSHA256(signing_str, signing_key).toString(CryptoJS.enc.Hex);
    headers['Authorization'] =
        md['algorithm'] +
        ' Credential=' +
        appid +
        '/' +
        md['credential_scope'] +
        ', SignedHeaders=' +
        md['signed_headers'] +
        ', Signature=' +
        sign;

    // 发送请求
    let url = schema + '://' + host + path + '?' + norm_query;
    let res = await fetch(url, {
        method: method,
        headers: headers,
        body: Body.text(body),
    });
    return res;
}

export * from './Config';
export * from './info';
