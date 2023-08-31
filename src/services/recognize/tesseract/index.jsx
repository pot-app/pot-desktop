import { info } from 'tauri-plugin-log-api';
import Tesseract from 'tesseract.js';

export async function recognize(base64, language) {
    const {
        data: { text },
    } = await Tesseract.recognize('data:image/png;base64,' + base64, language, {
        workerPath: '/worker.min.js',
        corePath: '/tesseract-core.wasm.js',
        langPath: 'https://pub-f6afb74f13c64cd89561b4714dca1c27.r2.dev',
        logger: (m) => {
            info(m);
        },
    });
    return text.trim();
}

export * from './Config';
export * from './info';
