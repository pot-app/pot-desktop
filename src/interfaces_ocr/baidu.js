import { fetch, Body } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { ocrID } from '../windows/Ocr/components/TextArea';
import { invoke } from '@tauri-apps/api/tauri';

export const info = {
    name: 'baidu',
    supportLanguage: {
        zh_cn: 'CHN_ENG',
        zh_tw: 'CHN_ENG',
        en: 'ENG',
        yue: 'CHN_ENG',
        ja: 'JAP',
        ko: 'KOR',
        fr: 'FRE',
        es: 'SPA',
        ru: 'RUS',
        de: 'GER',
        it: 'ITA',
        pt: 'POR',
    },
    needs: [
        {
            config_key: 'baidu_ocr_client_id',
            place_hold: '',
        },
        {
            config_key: 'baidu_ocr_client_secret',
            place_hold: '',
        },
    ],
};

export async function ocr(imgurl, lang, setText, id) {
    const { supportLanguage } = info;
    if (!(lang in supportLanguage)) {
        throw 'Unsupported Language';
    }
    const client_id = get('baidu_ocr_client_id') ?? '';
    const client_secret = get('baidu_ocr_client_secret') ?? '';
    if (client_id === '' || client_secret === '') {
        throw 'Please configure client_id and client_secret';
    }

    const url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic';
    const token_url = "https://aip.baidubce.com/oauth/2.0/token"

    const token_res = await fetch(token_url, {
        method: 'POST', query: {
            grant_type: 'client_credentials',
            client_id,
            client_secret
        },
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    if (token_res.ok) {
        if (token_res.data.access_token) {
            let token = token_res.data.access_token;

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

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                query: {
                    access_token: token
                },
                body: Body.form({
                    'language_type': supportLanguage[lang],
                    'detect_direction': 'false',
                    'image': base64
                }),
            }
            )
            if (res.ok) {
                let result = res.data;
                if (result['words_result']) {
                    let target = '';
                    for (let i of result['words_result']) {
                        target += i['words'] + '\n';
                        if (id === ocrID || id === 'translate') {
                            setText(target.trim());
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
        } else {
            if (id === ocrID || id === 'translate') {
                throw 'Get Access Token Failed!'
            }
        }
    } else {
        if (id === ocrID || id === 'translate') {
            throw `Http Request Error\nHttp Status: ${token_res.status}\n${JSON.stringify(token_res.data)}`;
        }
    }
}