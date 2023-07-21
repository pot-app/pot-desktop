import { readBinaryFile, BaseDirectory } from '@tauri-apps/api/fs';
import { ocrID } from '../windows/Ocr/components/TextArea';
import { fetch, Body } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { nanoid } from 'nanoid';
import md5 from 'md5';

export const info = {
    name: 'baidu_img',
    supportLanguage: {
        auto: 'zh',
        zh_cn: 'zh',
        zh_tw: 'cht',
        yue: 'yue',
        en: 'en',
        ja: 'jp',
        ko: 'kor',
        fr: 'fra',
        es: 'spa',
        ru: 'ru',
        de: 'de',
        it: 'it',
        tr: 'tr',
        pt: 'pt',
        pt_br: 'pot',
        vi: 'vie',
        id: 'id',
        th: 'th',
        ms: 'may',
        ar: 'ar',
        hi: 'hi',
    },
    needs: [
        {
            config_key: 'baidu_img_ocr_appid',
            place_hold: '',
        },
        {
            config_key: 'baidu_img_ocr_secret',
            place_hold: '',
        },
    ],
};

export async function ocr(base64, lang, setText, id) {
    const { supportLanguage } = info;
    const url = 'https://fanyi-api.baidu.com/api/trans/sdk/picture';
    const appid = get('baidu_img_ocr_appid') ?? '';
    const secret = get('baidu_img_ocr_secret') ?? '';
    const salt = nanoid();
    if (appid === '' || secret === '') {
        throw 'Please configure appid and secret';
    }
    if (!(lang in supportLanguage)) {
        throw 'Unsupported Language';
    }

    let file = await readBinaryFile('pot_screenshot_cut.png', { dir: BaseDirectory.AppCache });
    const str = appid + md5(file) + salt + 'APICUIDmac' + secret;
    const sign = md5(str);

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: Body.form({
            image: {
                file: file,
                mime: 'image/png',
                fileName: 'pot_screenshot_cut.png'
            },
            from: 'auto',
            to: supportLanguage[lang],
            appid: appid,
            salt: salt,
            cuid: 'APICUID',
            mac: 'mac',
            version: '3',
            sign: sign
        })
    });

    if (res.ok) {
        let result = res.data;
        if (result['data'] && result['data']['sumSrc'] && result['data']['sumDst']) {
            if (id === ocrID || id === 'translate') {
                if (lang === 'auto') {
                    setText(result['data']['sumSrc'].trim());
                } else {
                    setText(result['data']['sumDst'].trim());
                }
            }
        } else {
            if (id === ocrID || id === 'translate') {
                throw JSON.stringify(result);
            }
        }
    } else {
        if (id === ocrID || id === 'translate') {
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
        }
    }
}
