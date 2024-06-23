import { fetch } from '@tauri-apps/api/http';
import CryptoJS from 'crypto-js';

export async function translate(text, from, to, options = {}) {
    const { config } = options;

    const { appid, secret } = config;

    const serviceVersion = '2020-06-01';
    const schema = 'https';
    const host = 'open.volcengineapi.com';
    const path = '/';
    const method = 'POST';

    let credentials = {
        ak: appid,
        sk: secret,
        service: 'translate',
        region: 'cn-north-1',
        session_token: '',
    };
    let body = {
        TargetLanguage: to,
        TextList: [text],
    };
    let bodyStr = JSON.stringify(body); // 传入的body是字符串化的json
    let body_hash = CryptoJS.SHA256(bodyStr).toString(CryptoJS.enc.Hex);

    let today = new Date();
    let format_date = today
        .toISOString()
        .replaceAll('-', '')
        .replaceAll(':', '')
        .replaceAll(/\.[0-9]*/g, '');

    const md = {
        /* meta data */ algorithm: 'HMAC-SHA256',
        credential_scope: '',
        signed_headers: '',
        date: format_date.slice(0, 8),
        region: credentials['region'],
        service: credentials['service'],
    };
    md['credential_scope'] = md['date'] + '/' + md['region'] + '/' + md['service'] + '/request';

    const headers = {
        /* request headers, sorted */ Authorization: '',
        'Content-Type': 'application/json',
        Host: host,
        'X-Content-Sha256': body_hash,
        'X-Date': format_date,
    };

    // 签名
    const signed_headers = {
        // key is lower case and sorted
        'content-type': 'application/json',
        host: host,
        'x-content-sha256': body_hash,
        'x-date': format_date,
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
    let norm_query = 'Action=TranslateText&Version=' + serviceVersion;
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

    let signing_str = md['algorithm'] + '\n' + format_date + '\n' + md['credential_scope'] + '\n' + hashed_canon_req;
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
    let url = schema + '://' + host + path + '?' + 'Action=TranslateText&Version=' + serviceVersion;

    let res = await fetch(url, {
        method: method,
        headers: headers,
        body: { type: 'Text', payload: bodyStr },
    });

    if (res.ok) {
        let result = res.data;
        // 整理翻译结果并返回
        let translations = '';
        let { TranslationList } = result;
        if (TranslationList) {
            let cur = 0,
                last = 0;
            for (cur; cur < TranslationList.length; cur += 1) {
                if (cur > last) {
                    translations += '\n';
                }
                let curTranslation = TranslationList[cur];
                if (curTranslation['Translation']) {
                    translations += curTranslation['Translation'];
                }
                last = cur;
            }
            return translations.trim();
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

export * from './Config';
export * from './info';
