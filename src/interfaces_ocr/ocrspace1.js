import { invoke } from '@tauri-apps/api/tauri';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { ocrID } from '../windows/Ocr/components/TextArea';

export const info = {
    name: 'ocrspace1',
    supportLanguage: {
        zh_cn: 'chs',
        zh_tw: 'cht',
        en: 'eng',
        ja: 'jpn',
        ko: 'kor',
        fr: 'fre',
        es: 'spa',
        ru: 'rus',
        de: 'ger',
        it: 'ita',
        tr: 'tur',
        pt: 'por',
        ar: 'ara',
    },
    needs: [
        {
            config_key: 'ocrspace1_apikey',
            place_hold: '',
        }
    ],
};

export async function ocr(imgurl, lang, setText, id) {
    const { supportLanguage } = info;
    if (!(lang in supportLanguage)) {
        throw 'Unsupported Language';
    }
    const apikey = get('ocrspace1_apikey') ?? '';

    if (apikey === '') {
        throw 'Please configure client_id and client_secret';
    }

    const url = 'https://api.ocr.space/parse/image';


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
            let base64 = canvas.toDataURL('image/png');
            if (base64 === 'data:,') {
            } else {
                resolve(base64);
            }
        }
        img.onerror = async (e) => {
            let base64 = await invoke('get_base64');
            resolve('data:image/png;base64,' + base64);
        };
    });
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            apikey,
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: {
            type: 'Text',
            payload: `base64Image=${encodeURIComponent(base64)}&language=${supportLanguage[lang]}&OCREngine=1`
        }
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
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
        }
    }
}