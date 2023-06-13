import { ocrID } from '../windows/Ocr/components/TextArea';
import { fetch } from '@tauri-apps/api/http';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import hashSHA256 from 'crypto-js/sha256';
import hex from 'crypto-js/enc-hex';
import { get } from '../windows/main';

export const info = {
    name: 'tencent',
    supportLanguage: {
        auto: 'auto',
        zh_cn: 'zh',
        zh_tw: 'zh_rare',
        yue: 'zh_rare',
        en: 'auto',
        ja: 'jap',
        ko: 'kor',
        fr: 'fre',
        es: 'spa',
        ru: 'rus',
        de: 'ger',
        it: 'ita',
        pt: 'por',
        vi: 'vie',
        th: 'tha',
        ms: 'may',
        ar: 'ara',
        hi: 'hi',
    },
    needs: [
        {
            config_key: 'tencent_ocr_secretid',
            place_hold: '',
        },
        {
            config_key: 'tencent_ocr_secretkey',
            place_hold: '',
        },
    ],
};

export async function ocr(base64, lang, setText, id) {
    const { supportLanguage } = info;

    const SecretId = get('tencent_secretid') ?? '';
    const SecretKey = get('tencent_secretkey') ?? '';

    if (SecretId === '' || SecretKey === '') {
        throw 'Please configure SecretId and SecretKey';
    }
    if (!(lang in supportLanguage)) {
        throw 'Unsupported Language';
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

    const endpoint = 'ocr.tencentcloudapi.com';
    const service = 'ocr';
    const region = 'ap-beijing';
    const action = 'GeneralBasicOCR';
    const version = '2018-11-19';
    const timestamp = Math.ceil(Date.now() / 1000);
    // const timestamp = 1551113065
    //时间处理, 获取世界时间日期
    const date = getDate(timestamp);

    // ************* 步骤 1：拼接规范请求串 *************
    const body = {
        ImageBase64: base64,
        LanguageType: supportLanguage[lang]
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

    let res = await fetch('https://' + endpoint, {
        method: 'POST',
        headers: {
            Authorization: authorization,
            'content-type': 'application/json',
            Host: endpoint,
            'X-TC-Action': action,
            'X-TC-Timestamp': timestamp.toString(),
            'X-TC-Version': version,
            'X-TC-Region': region,
        },
        body: {
            type: 'Text',
            payload: payload,
        },
    });
    if (res.ok) {
        const result = res.data;
        if (result["Response"]['TextDetections']) {
            let target = '';
            for (let i of result["Response"]['TextDetections']) {
                target += i['DetectedText'] + '\n';
            }
            if (id === ocrID || id === 'translate') {
                setText(target.trim())
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
}
