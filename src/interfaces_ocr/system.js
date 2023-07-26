import { ocrID } from '../windows/Ocr/components/TextArea';
import { ocr as tesseract } from './tesseract';
import { invoke } from '@tauri-apps/api';
import { Command } from '@tauri-apps/api/shell';

export const info = {
    name: 'system',
    supportLanguage: {},
    needs: [],
};

export async function ocr(base64, lang, setText, id) {
    const is_linux = await invoke('is_linux');
    const is_macos = await invoke('is_macos');
    // Linux 没法做系统OCR，用Tesseract代替
    if (is_linux) {
        await tesseract(base64, lang, setText, id);
    } else if (is_macos) {
        const img_path = await invoke('system_ocr');
        const command = Command.sidecar('sidecar/ocr', img_path);
        const output = await command.execute();
        if (!output.code) {
            if (ocrID === id || id === 'translate') {
                setText(output.stdout);
            }
        } else {
            throw output.stderr;
        }
    } else {
        const result = await invoke('system_ocr');
        if (ocrID === id || id === 'translate') {
            setText(result);
        }
    }
}
