import Tesseract from 'tesseract.js';
import { Language } from './info';

export async function recognize(base64, language) {
    const {
        data: { text },
    } = await Tesseract.recognize('data:image/png;base64,' + base64, language, {
        workerPath: '/worker.min.js',
        corePath: '/tesseract-core-simd-lstm.wasm.js',
        langPath: 'https://tessdata.pot-app.com',
    });
    if (language === Language.zh_cn || language === Language.zh_tw) {
        return text.replaceAll(' ', '').trim();
    } else {
        return text.trim();
    }
}

export * from './Config';
export * from './info';
