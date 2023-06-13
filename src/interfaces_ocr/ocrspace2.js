import { fetch, Body } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { ocrID } from '../windows/Ocr/components/TextArea';

export const info = {
    name: 'ocrspace2',
    supportLanguage: {},
    needs: [
        {
            config_key: 'ocrspace2_apikey',
            place_hold: '',
        }
    ],
};

export async function ocr(base64, lang, setText, id) {
    const apikey = get('ocrspace2_apikey') ?? '';

    if (apikey === '') {
        throw 'Please configure client_id and client_secret';
    }

    const url = 'https://api.ocr.space/parse/image';

    base64 = 'data:image/png;base64,' + base64

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            apikey,
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: Body.form({
            'base64Image': base64,
            'OCREngine': '2'
        })
    }
    )
    if (res.ok) {
        let result = res.data;
        if (result['ParsedResults']) {
            let target = '';
            for (let i of result['ParsedResults']) {
                target += i['ParsedText']
            }
            if (id === ocrID || id === 'translate') {
                setText(target.trim());
            }
        } else {
            throw JSON.stringify(result)
        }
    } else {
        if (id === ocrID || id === 'translate') {
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res)}`;
        }
    }
}