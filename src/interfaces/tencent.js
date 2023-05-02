import request from './utils/request';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import hashSHA256 from 'crypto-js/sha256';
import hex from 'crypto-js/enc-hex';
import { get } from '../windows/main';

// 必须向外暴露info
export const info = {
    // 接口中文名称
    name: '腾讯翻译君',
    // 接口支持语言及映射
    supportLanguage: {
        auto: 'auto',
        'zh-cn': 'zh',
        'zh-tw': 'zh-TW',
        en: 'en',
        ja: 'ja',
        ko: 'ko',
        fr: 'fr',
        es: 'es',
        ru: 'ru',
        de: 'de',
    },
    // 接口需要配置项
    needs: [
        {
            config_key: 'tencent_secretid',
            place_hold: '',
            display_name: '密钥ID',
        },
        {
            config_key: 'tencent_secretkey',
            place_hold: '',
            display_name: '密钥值',
        },
    ],
};
//必须向外暴露translate
export async function translate(text, from, to) {
    // 获取语言映射
    const { supportLanguage } = info;
    // 获取设置项
    const SecretId = get('tencent_secretid') ?? '';
    const SecretKey = get('tencent_secretkey') ?? '';

    if (SecretId == '' || SecretKey == '') {
        return '请先配置SecretId和SecretKey';
    }
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        return '该接口不支持该语言';
    }

    function sha256(message, secret = '') {
        return hmacSHA256(message, secret);
    }

    function getHash(message) {
        return hashSHA256(message).toString();
    }

    function getDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const year = date.getUTCFullYear();
        const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
        const day = ('0' + date.getUTCDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }

    const endpoint = 'tmt.tencentcloudapi.com';
    const service = 'tmt';
    const region = 'ap-beijing';
    const action = 'TextTranslate';
    const version = '2018-03-21';
    const timestamp = Math.ceil(Date.now() / 1000);
    // const timestamp = 1551113065
    //时间处理, 获取世界时间日期
    const date = getDate(timestamp);

    // ************* 步骤 1：拼接规范请求串 *************
    const body = {
        SourceText: text,
        Source: supportLanguage[from],
        Target: supportLanguage[to],
        ProjectId: 0,
    };
    const payload = JSON.stringify(body);
    // const payload = "{\"Limit\": 1, \"Filters\": [{\"Values\": [\"\\u672a\\u547d\\u540d\"], \"Name\": \"instance-name\"}]}"

    const hashedRequestPayload = getHash(payload);
    const httpRequestMethod = 'POST';
    const canonicalUri = '/';
    const canonicalQueryString = '';
    const canonicalHeaders = 'content-type:application/json\n' + 'host:' + endpoint + '\n';
    // + "x-tc-action:" + action.toLowerCase() + "\n"
    const signedHeaders = 'content-type;host';

    const canonicalRequest =
        httpRequestMethod +
        '\n' +
        canonicalUri +
        '\n' +
        canonicalQueryString +
        '\n' +
        canonicalHeaders +
        '\n' +
        signedHeaders +
        '\n' +
        hashedRequestPayload;

    // ************* 步骤 2：拼接待签名字符串 *************
    const algorithm = 'TC3-HMAC-SHA256';
    const hashedCanonicalRequest = getHash(canonicalRequest);
    const credentialScope = date + '/' + service + '/' + 'tc3_request';
    const stringToSign = algorithm + '\n' + timestamp + '\n' + credentialScope + '\n' + hashedCanonicalRequest;

    // ************* 步骤 3：计算签名 *************
    const kDate = sha256(date, 'TC3' + SecretKey);
    const kService = sha256(service, kDate);
    const kSigning = sha256('tc3_request', kService);
    const signature = hex.stringify(sha256(stringToSign, kSigning));

    // ************* 步骤 4：拼接 Authorization *************
    const authorization =
        algorithm +
        ' ' +
        'Credential=' +
        SecretId +
        '/' +
        credentialScope +
        ', ' +
        'SignedHeaders=' +
        signedHeaders +
        ', ' +
        'Signature=' +
        signature;

    let res = await request('https://' + endpoint, {
        method: 'POST',
        body: payload,
        headers: {
            Authorization: authorization,
            'Content-Type': 'application/json',
            Host: endpoint,
            'X-TC-Action': action,
            'X-TC-Timestamp': timestamp.toString(),
            'X-TC-Version': version,
            'X-TC-Region': region,
        },
    });

    let result = JSON.parse(res);

    let { Response } = result;
    if (Response['TargetText'] && Response['Source']) {
        if (Response['Source'] == supportLanguage[to]) {
            let secondLanguage = get('second_language') ?? 'en';
            if (secondLanguage != to) {
                return translate(text, from, secondLanguage);
            }
        }
        return Response['TargetText'];
    } else {
        return res;
    }
}
