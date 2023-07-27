import { ocrID } from '../windows/Ocr/components/TextArea';
import { invoke } from '@tauri-apps/api';
import { Command } from '@tauri-apps/api/shell';

export const info = {
    name: 'system',
    supportLanguage: {
        auto: 'chi_sim+eng+chi_tra+jpn+kor+fra+spa+rus+deu+ita+tur+por+vie+ind+tha+msa+ara+hin',
        zh_cn: 'chi_sim',
        zh_tw: 'chi_tra',
        en: 'eng',
        yue: 'chi_sim',
        ja: 'jpn',
        ko: 'kor',
        fr: 'fra',
        es: 'spa',
        ru: 'rus',
        de: 'deu',
        it: 'ita',
        tr: 'tur',
        pt: 'por',
        vi: 'vie',
        id: 'ind',
        th: 'tha',
        ms: 'msa',
        ar: 'ara',
        hi: 'hin',
    },
    needs: [],
};

export async function ocr(_, lang, setText, id) {
    const is_linux = await invoke('is_linux');
    const is_macos = await invoke('is_macos');

    if (is_linux) {
        const { supportLanguage } = info;
        const result = await invoke('system_ocr', { lang: supportLanguage[lang] });
        if (ocrID === id || id === 'translate') {
            setText(result);
        }
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
