import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';

// 翻译服务商：https://dictionary.cambridge.org/
export const info = {
    name: 'cambridge_dict',
    supportLanguage: {
        auto: '',
        en: 'english',
        zh_cn: 'chinese-simplified',
        zh_tw: 'chinese-traditional',
    },
    needs: [],
};

const spacesReg = /\s+/g
export async function translate(text, from, to, setText, id) {
    const { supportLanguage } = info;
    // start with a letter as english
    if (supportLanguage[from] === supportLanguage['auto'] && /^[A-Za-z].*$/.test(text)) {
        from = 'en';
    }
    // do not process non-English or sentences
    if (supportLanguage[from] !== supportLanguage['en'] || text.split(' ').length > 1) {
        return;
    }
    // auto -> en
    if (supportLanguage[from] === supportLanguage[to]) {
        setText(text);
        return;
    }
    if (!(to in supportLanguage)) {
        throw 'Unsupported Language';
    }

    const url = `https://dictionary.cambridge.org/search/direct/?datasetsearch=${supportLanguage[from]}-${supportLanguage[to]}&q=${text}`;
    let res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'User-Agent': 'pot translate',
        },
        responseType: 2,
    });

    if (res.ok) {
        let result = res.data;
        const doc = new DOMParser().parseFromString(result, 'text/html');
        const entryNodes = doc.querySelectorAll('.pr.entry-body__el');
        if (entryNodes.length === 0) {
            throw `Words not yet included: ${text}`;
        }
        const phoneticNodes = entryNodes[0].querySelectorAll('.dpron-i');
        const explainTexts = [...entryNodes].flatMap(n => {
            const wordText = n.querySelector('.hw.dhw').innerText;
            // IM != I'm
            if (text.toLocaleLowerCase() !== wordText.toLocaleLowerCase()) {
                return [];
            }
            // part of speech or explanation
            const subText = (t => t ? `${t}.` : false)(n.querySelector('.posgram')?.innerText) || (t => t ? `[${t}]` : '')(n.querySelector('.sense-body.dsense_b .ddef_h>.def.ddef_d.db')?.innerText);
            const senseNodes = n.querySelectorAll('.sense-body.dsense_b .def-body.ddef_b>.trans.dtrans.dtrans-se.break-cj');
            return [...senseNodes].map(n => `${subText} ${n.innerText}`);
        });
        const phoneticText = [...phoneticNodes].map(n => n.innerText
            .replace("Your browser doesn't support HTML5 audio", "")
            .replaceAll(spacesReg, ' ')
            .replace('us', 'US:')
            .replace('uk', 'UK:')
        ).join('   ');
        if (translateID.includes(id)) {
            setText([phoneticText, ...explainTexts].join('\n'));
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}
