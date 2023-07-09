import { readBinaryFile, BaseDirectory } from '@tauri-apps/api/fs';
import { fetch, Body } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { ocrID } from '../windows/Ocr/components/TextArea';

export const info = {
    name: 'simplelatex',
    supportLanguage: {},
    needs: [
        {
            config_key: 'simplelatex_token',
            place_hold: '',
        },
    ],
};

export async function ocr(base64, lang, setText, id) {
    const token = get('simplelatex_token') ?? '';

    if (token === '') {
        throw 'Please configure token';
    }

    const url = 'https://server.simpletex.cn/api/latex_ocr/v1';

    let file = await readBinaryFile('pot_screenshot_cut.png', { dir: BaseDirectory.AppCache });

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            token,
            'content-type': 'multipart/form-data',
        },
        body: Body.form({
            file: {
                file: file,
                fileName: 'pot_screenshot_cut.png',
            },
        }),
    });
    if (res) {
        let result = res.data;
        if (result['res']['latex']) {
            if (id === ocrID || id === 'translate') {
                setText(result['res']['latex'].trim());
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
