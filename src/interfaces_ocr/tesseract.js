import { ocrID } from '../windows/Ocr/components/TextArea';
import Tesseract from 'tesseract.js';

// 必须向外暴露info
export const info = {
    // 接口中文名称
    name: 'tesseract',
    // 接口支持语言及映射
    supportLanguage: {
        auto: 'eng',
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

export async function ocr(base64, lang, setText, id) {
    const { supportLanguage } = info;
    if (!(lang in supportLanguage)) {
        throw 'Unsupported Language';
    }

    const {
        data: { text },
    } = await Tesseract.recognize('data:image/png;base64,' + base64, supportLanguage[lang], {
        workerPath: '/worker.min.js',
        corePath: '/tesseract-core.wasm.js',
        langPath: 'https://pub-f6afb74f13c64cd89561b4714dca1c27.r2.dev',
        logger: (m) => {
            if (id === ocrID || id === 'translate') {
                setText(`Status: ${m.status}\nProgress:${m.progress}`);
            }
        },
    });
    if (id === ocrID || id === 'translate') {
        setText(text.trim());
    }
}
