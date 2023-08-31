import { osType } from '../../../utils/env';
import { invoke } from '@tauri-apps/api';

export async function recognize(_, lang) {
    const linuxLangMap = {
        auto: 'auto',
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
        pt_br: 'por',
        vi: 'vie',
        id: 'ind',
        th: 'tha',
        ms: 'msa',
        ar: 'ara',
        hi: 'hin',
    };
    const windowsLangMap = {
        auto: 'auto',
        zh_cn: 'zh-CN',
        zh_tw: 'zh-TW',
        en: 'en-US',
        yue: 'zh-HK',
        ja: 'ja-JP',
        ko: 'ko-KR',
        fr: 'fr-FR',
        es: 'es-ES',
        ru: 'ru-RU',
        de: 'de-DE',
        it: 'it-IT',
        tr: 'tr-TR',
        pt: 'pt-PT',
        pt_br: 'pt-BR',
        vi: 'vi-VN',
        id: 'id-ID',
        th: 'th-TH',
        ms: 'ms-MY',
        ar: 'ar-SA',
        hi: 'hi-IN',
    };
    const macOSLangMap = {
        auto: 'auto',
        zh_cn: 'zh-Hans',
        zh_tw: 'zh-Hant',
        en: 'en-US',
        yue: 'zh-Hans',
        ja: 'ja-JP',
        ko: 'ko-KR',
        fr: 'fr-FR',
        es: 'es-ES',
        ru: 'ru-RU',
        de: 'de-DE',
        it: 'it-IT',
        tr: 'tr-TR',
        pt: 'pt-PT',
        pt_br: 'pt-BR',
        vi: 'vi-VN',
        id: 'id-ID',
        th: 'th-TH',
        ms: 'ms-MY',
        ar: 'ar-SA',
        hi: 'hi-IN',
    };
    switch (osType) {
        case 'Linux':
            return await invoke('system_ocr', { lang: linuxLangMap[lang] });
        case 'Darwin':
            return await invoke('system_ocr', { lang: macOSLangMap[lang] });
        case 'Windows_NT':
            return await invoke('system_ocr', { lang: windowsLangMap[lang] });
    }
}

export * from './Config';
export * from './info';
