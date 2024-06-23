import { readBinaryFile, BaseDirectory } from '@tauri-apps/api/fs';
import { fetch, Body } from '@tauri-apps/api/http';

export async function recognize(base64, language, options = {}) {
    const { config } = options;

    const { token } = config;

    const url = 'https://server.simpletex.cn/api/latex_ocr/v2';

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
    if (res.ok) {
        let result = res.data;
        if (result['res'] && result['res']['latex']) {
            return result['res']['latex'].trim();
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

export * from './Config';
export * from './info';
