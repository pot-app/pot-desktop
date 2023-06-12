import { invoke } from '@tauri-apps/api/tauri';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { ocrID } from '../windows/Ocr/components/TextArea';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import hashSHA256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';

export const info = {
    name: 'iflytek_latex',
    supportLanguage: {},
    needs: [
        {
            config_key: 'iflytek_latex_appid',
            place_hold: '',
        },
        {
            config_key: 'iflytek_latex_apisecret',
            place_hold: '',
        },
        {
            config_key: 'iflytek_latex_apikey',
            place_hold: '',
        }
    ],
};

export async function ocr(imgurl, lang, setText, id) {
    const appid = get('iflytek_latex_appid') ?? '';
    const apisecret = get('iflytek_latex_apisecret') ?? '';
    const apikey = get('iflytek_latex_apikey') ?? '';

    if (appid === '' || apisecret === '' || apikey === '') {
        throw 'Please configure appid, apisecret and apikey';
    }

    const url = 'https://rest-api.xfyun.cn/v2/itr';

    let canvas = document.createElement('CANVAS');
    let ctx = canvas.getContext('2d');
    let img = new Image;
    img.src = imgurl;

    let base64 = await new Promise((resolve, reject) => {
        img.onload = () => {
            img.crossOrigin = 'anonymous';
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            let dataURL = canvas.toDataURL('image/png');
            let base64 = dataURL.replace('data:image/png;base64,', '');
            if (base64 === 'data:,') {
            } else {
                resolve(base64);
            }
        }
        img.onerror = async (e) => {
            let base64 = await invoke('get_base64');
            resolve(base64);
        };
    });
    const body = {
        "common": {
            "app_id": appid
        },
        "business": {
            "ent": "teach-photo-print",
            "aue": "raw"
        },
        "data": {
            "image": base64
        }
    }
    const host = "rest-api.xfyun.cn";
    const date = new Date().toUTCString();
    const request_line = 'POST /v2/itr HTTP/1.1';
    const digest = 'SHA-256=' + Base64.stringify(hashSHA256(JSON.stringify(body)));
    const signature_origin = `host: ${host}\ndate: ${date}\n${request_line}\ndigest: ${digest}`
    const signature_sha = hmacSHA256(signature_origin, apisecret);
    const signature = Base64.stringify(signature_sha);
    const authorization = `api_key="${apikey}", algorithm="hmac-sha256", headers="host date request-line digest", signature="${signature}"`
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json,version=1.0',
        'Host': host,
        'Date': date,
        'Digest': digest,
        'Authorization': authorization
    }
    const res = await fetch(url, {
        method: 'POST',
        headers,
        body: {
            type: 'Text',
            payload: JSON.stringify(body)
        }
    }
    )
    if (res.ok) {
        let result = res.data;
        if (result.data['region']) {
            let target = '';
            for (let i of result.data['region']) {
                target += i['recog']['content'] + '\n';
            }
            if (id === ocrID || id === 'translate') {
                target = target.replaceAll(' ifly-latex-begin ', '');
                target = target.replaceAll(' ifly-latex-end ', '');
                setText(target.trim());
            }
        } else {
            if (id === ocrID || id === 'translate') {
                throw JSON.stringify(result)
            }
        }
    } else {
        if (id === ocrID || id === 'translate') {
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
        }
    }
}