import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';

// 翻译服务商：https://dictionary.cambridge.org/
export const info = {
    name: 'cambridge_dict',
    supportLanguage: {
        auto: 'english',
        zh_cn: 'chinese-simplified',
        zh_tw: 'chinese-traditional',
        en: 'english',
    },
    needs: [],
};

const spacesReg = /\s+/g
export async function translate(text, from, to, setText, id) {
    const { supportLanguage } = info;
    // 该接口只支持查询: 英文, 单词, 这里为了避免查询过程中频繁展示报错内容所以直接不返回内容
    if (supportLanguage['en'] !== supportLanguage[from] || text.split(' ').length > 1) {
        return;
    }
    if (!(to in supportLanguage)) {
        throw 'Unsupported Language';
    }

    const url = `https://dictionary.cambridge.org/dictionary/${supportLanguage[from]}-${supportLanguage[to]}/${text}`;
    let res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'User-Agent': 'pot translate',
        },
        responseType: 2,
    });

    // 当未收录该单词时会被重定向到首页
    if (url != res.url) {
        throw `Words not yet included: ${text}`;
    } else if (res.ok) {
        let result = res.data;
        const doc = new DOMParser().parseFromString(result, 'text/html');
        const entryNodes = doc.querySelectorAll('.pr.entry-body__el');
        const phoneticNodes = entryNodes[0].querySelectorAll('.dpron-i');
        const explainTexts = [...entryNodes].flatMap(n => {
            const posgramText = n.querySelector('.posgram').innerText;
            const senseNodes = n.querySelectorAll('.sense-body.dsense_b>.def-block.ddef_block>.def-body.ddef_b>.trans.dtrans.dtrans-se.break-cj');
            return [...senseNodes].map(n => `${posgramText}. ${n.innerText}`);
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
