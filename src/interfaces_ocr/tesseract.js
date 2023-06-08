import Tesseract from 'tesseract.js';
import { ocrID } from '../windows/Ocr/components/TextArea';

// 必须向外暴露info
export const info = {
    // 接口中文名称
    name: 'tesseract',
    // 接口支持语言及映射
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

export async function ocr(imgurl, lang, setText, id) {
    console.log("start");
    const { supportLanguage } = info;
    if (!(lang in supportLanguage)) {
        throw 'Unsupported Language';
    }
    const { data: { text } } = await Tesseract.recognize(imgurl, supportLanguage[lang], {
        // langPath: '',
        workerPath: 'https://cdn.bootcdn.net/ajax/libs/tesseract.js/4.0.3/worker.min.js',
        logger: m => {
            if (id === ocrID) {
                setText(`Status: ${m.status}\nProgress:${m.progress}`)
            }
        }
    })
    if (id === ocrID) {
        setText(text);
    }
}