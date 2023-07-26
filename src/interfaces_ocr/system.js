import { ocrID } from '../windows/Ocr/components/TextArea';
import { ocr as tesseract } from './tesseract';
import { invoke } from '@tauri-apps/api';

export const info = {
    name: 'system',
    supportLanguage: {},
    needs: [],
};

export async function ocr(base64, lang, setText, id) {
    const is_linux = await invoke('is_linux');
    // Linux 没法做系统OCR，用Tesseract代替
    if (is_linux) {
        await tesseract(base64, lang, setText, id);
    } else {
        const result = await invoke('system_ocr', { lang });
        if (ocrID === id || id === 'translate') {
            setText(result);
        }
    }
}
