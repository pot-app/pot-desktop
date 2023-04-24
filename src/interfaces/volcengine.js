import request from './utils/request';
import CryptoJS from 'crypto-js';
import { get } from '../windows/main';
import { searchWord } from "./utils/dict";

// 必须向外暴露info
export const info = {
    // 接口中文名称
    name: "火山翻译",

    // 接口支持语言及映射
    //https://www.volcengine.com/docs/4640/35107
    supportLanguage: {
        "auto": "auto",
        "zh-cn": "zh",
        "zh-tw": "zh-Hant",
        "ja": "ja",
        "en": "en",
        "ko": "ko",
        "fr": "fr",
        "es": "es",
        "ru": "ru",
        "de": "de"
    },
    // 接口需要配置项
    needs: [{
        'config_key': 'volcengine_id',
        'place_hold': '',
        'display_name': 'Access Id'
    }, {
        'config_key': 'volcengine_secret',
        'place_hold': '',
        'display_name': 'Access Key'
    }]
}
//必须向外暴露translate
export async function translate(text, from, to) {

    // 获取语言映射
    const { supportLanguage } = info;
    // 获取设置项
    const appid = get('volcengine_id') ?? ''; // https://console.volcengine.com/iam/keymanage/
    const secret = get('volcengine_secret') ?? '';

    if (appid == "" || secret == "") {
        return '请先配置Access Id和Access Key'
    }
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        return '该接口不支持该语言'
    }
    if (text.split(' ').length == 1) {
        let target = await searchWord(text);
        if (target !== '') {
            return target
        }
    }

    const serviceVersion = "2020-06-01";
    const schema = "https";
    const host = "open.volcengineapi.com";
    const path = "/";
    const method = "POST";

    let credentials = {
        "ak": appid,
        "sk": secret,
        "service": "translate",
        "region": "cn-north-1",
        "session_token": ""
    };
    let body = {
        "TargetLanguage": supportLanguage[to],
        "TextList": [text],
    };
    let bodyStr = JSON.stringify(body) // 传入的body是字符串化的json
    let body_hash = CryptoJS.SHA256(bodyStr).toString(CryptoJS.enc.Hex);

    let today = new Date();
    let format_date = today.toISOString().replaceAll("-", "").replaceAll(":", "").replaceAll(/\.[0-9]*/g, "");

    var md = { /* meta data */
        "algorithm": "HMAC-SHA256",
        "credential_scope": "",
        "signed_headers": "",
        "date": format_date.slice(0, 8),
        "region": credentials["region"],
        "service": credentials["service"]
    };
    md["credential_scope"] = md["date"] + "/" + md["region"] + "/" + md["service"] + "/request";

    var headers = { /* request headers, sorted */
        "Authorization": "",
        "Content-Type": "application/json",
        "Host": host,
        "X-Content-Sha256": body_hash,
        "X-Date": format_date
    };

    // 签名
    var signed_headers = { // key is lower case and sorted
        "content-type": "application/json",
        "host": host,
        "x-content-sha256": body_hash,
        "x-date": format_date
    };

    var signed_str = "";
    var md_signed_headers = "";
    var signedHeaderKeys = Object.keys(signed_headers);
    for (var i = 0; i < signedHeaderKeys.length; i += 1) {
        signed_str += signedHeaderKeys[i] + ":" + signed_headers[signedHeaderKeys[i]] + "\n";
        md_signed_headers += signedHeaderKeys[i] + ";";
    }
    md["signed_headers"] = md_signed_headers.slice(0, -1);

    let norm_uri = path;
    let norm_query = "Action=TranslateText&Version=" + serviceVersion;
    let canoncial_request = method + "\n" + norm_uri + "\n" + norm_query + "\n" + signed_str + "\n" + md["signed_headers"] + "\n" + body_hash;
    let hashed_canon_req = CryptoJS.SHA256(canoncial_request).toString(CryptoJS.enc.Hex);

    let kdate = CryptoJS.HmacSHA256(md["date"], secret);
    let kregion = CryptoJS.HmacSHA256(md["region"], kdate);
    let kservice = CryptoJS.HmacSHA256(md["service"], kregion);
    let signing_key = CryptoJS.HmacSHA256("request", kservice);

    let signing_str = md["algorithm"] + "\n" + format_date + "\n" + md["credential_scope"] + "\n" + hashed_canon_req;
    let sign = CryptoJS.HmacSHA256(signing_str, signing_key).toString(CryptoJS.enc.Hex);
    headers["Authorization"] = md["algorithm"] + " Credential=" + appid + "/" + md["credential_scope"] + ", SignedHeaders=" + md["signed_headers"] + ", Signature=" + sign;

    // 发送请求
    let url = schema + "://" + host + path + "?" + "Action=TranslateText&Version=" + serviceVersion;

    let res = await request(url, {
        method: method,
        body: bodyStr,
        headers: headers
    })

    let result = JSON.parse(res);
    // 整理翻译结果并返回
    var data = result;
    var translations = "";
    var translationList = []; // 返回的结果是个数组
    var errorOccered = false;

    if (data.hasOwnProperty("TranslationList")) {
        translationList = data["TranslationList"];
    } else { errorOccered = true; }

    if (translationList != null && translationList.length > 0) {
        var cur = 0, last = 0;
        for (cur; cur < translationList.length; cur += 1) {
            if (cur > last) {
                translations += "\n";
            }
            let curTranslation = translationList[cur];
            if (curTranslation.hasOwnProperty("Translation")) {
                translations += curTranslation["Translation"];
            } else { errorOccered = true; }
            last = cur;
        }
    }

    if (!errorOccered) {
        return translations;
    } else {
        return JSON.stringify(res);
    }
}