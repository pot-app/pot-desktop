import HmacSHA1 from 'crypto-js/hmac-sha1';
import base64 from 'crypto-js/enc-base64';
import { get } from '../windows/main';
// 不能走代理，所以用axios
import axios from 'axios';

// 必须向外暴露info
export const info = {
    // 接口中文名称
    name: '阿里翻译',
    // 接口支持语言及映射
    supportLanguage: {
        auto: 'auto',
        'zh-cn': 'zh',
        'zh-tw': 'zh-tw',
        yue: 'yue',
        ja: 'ja',
        en: 'en',
        ko: 'ko',
        fr: 'fr',
        es: 'es',
        ru: 'ru',
        de: 'de',
    },
    needs: [
        {
            config_key: 'alibaba_accesskey_id',
            place_hold: '',
            display_name: 'AccessKey ID',
        },
        {
            config_key: 'alibaba_accesskey_secret',
            place_hold: '',
            display_name: 'AccessKey Secret',
        },
    ],
};
//必须向外暴露translate
export async function translate(text, from, to, setText) {
    // 获取语言映射
    const { supportLanguage } = info;
    // 获取设置项
    const accesskey_id = get('alibaba_accesskey_id') ?? '';
    const accesskey_secret = get('alibaba_accesskey_secret') ?? '';

    function getRandomNumber() {
        const rand = Math.floor(Math.random() * 99999) + 100000;
        return rand * 1000;
    }
    if (accesskey_id == '' || accesskey_secret == '') {
        throw '请先配置AccessKey ID和AccessKey Secret';
    }
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        throw '该接口不支持该语言';
    }

    let today = new Date();
    let timestamp = today.toISOString().replaceAll(/\.[0-9]*/g, '');
    let endpoint = 'http://mt.cn-hangzhou.aliyuncs.com/';
    let url_path = 'api/translate/web/general';

    let query = `AccessKeyId=${accesskey_id}&Action=TranslateGeneral&Format=JSON&FormatType=text&Scene=general&SignatureMethod=HMAC-SHA1&SignatureNonce=${getRandomNumber()}&SignatureVersion=1.0&SourceLanguage=${supportLanguage[from]}&SourceText=${encodeURIComponent(text)}&TargetLanguage=${supportLanguage[to]}&Timestamp=${encodeURIComponent(timestamp)}&Version=2018-10-12`;

    let CanonicalizedQueryString = endpoint + url_path + '?' + query;

    let stringToSign = 'GET' + '&' + encodeURIComponent('/') + '&' + encodeURIComponent(query);

    stringToSign = stringToSign.replaceAll("!", "%2521");
    stringToSign = stringToSign.replaceAll("'", "%2527");
    stringToSign = stringToSign.replaceAll("(", "%2528");
    stringToSign = stringToSign.replaceAll(")", "%2529");
    stringToSign = stringToSign.replaceAll("*", "%252A");
    stringToSign = stringToSign.replaceAll("+", "%252B");
    stringToSign = stringToSign.replaceAll(",", "%252C");

    let signature = base64.stringify(HmacSHA1(stringToSign, accesskey_secret + '&'));

    CanonicalizedQueryString = CanonicalizedQueryString + '&Signature=' + encodeURIComponent(signature);

    let res = await axios.get(CanonicalizedQueryString);
    if (res.status == 200) {
        let result = res.data;
        if (result['Code'] == '200') {
            if (result['Data']['Translated'] == text) {
                let secondLanguage = get('second_language') ?? 'en';
                if (to != secondLanguage) {
                    await translate(text, from, secondLanguage, setText);
                    return
                }
            }
            setText(result['Data']['Translated']);
        } else {
            throw JSON.stringify(result)
        }
    } else {
        throw 'http请求出错\n' + JSON.stringify(res);
    }
}
