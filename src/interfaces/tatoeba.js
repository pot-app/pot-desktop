import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
    name: 'tatoeba',
    supportLanguage: {
        auto: '',
        zh_cn: 'cmn',
        zh_tw: 'cmn',
        yue: 'cmn',
        en: 'eng',
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
        ms: 'zsm',
        ar: 'ara',
        hi: 'hin',
        mn_cy: "mon",
        km: "khm"
    },
    needs: [],
};

export async function translate(text, from, to, setText, id) {
    const { supportLanguage } = info;
    const url = 'https://tatoeba.org/eng/api_v0/search';

    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        throw 'Unsupported Language';
    }

    let res = await fetch(url, {
        query: {
            query: text,
            from: supportLanguage[from],
            to: supportLanguage[to],
            has_audio: 'no',
            sort: 'relevance'
        },
    });
    if (res.ok) {
        let result = res.data;
        const { results } = result;
        if (results.length > 0) {
            if (results[0]['lang'] === supportLanguage[to]) {
                let secondLanguage = get('second_language') ?? 'en';
                if (secondLanguage !== to) {
                    await translate(text, from, secondLanguage, setText, id);
                    return;
                }
            }
            let target = '';
            console.log(results);
            for (let i of results) {
                target += i['text'] + '\n';
                for (let j of i['translations']) {
                    for (let k of j) {
                        target += k['text'] + '\n';
                        // for (let u of k['transcriptions']) {
                        //     target += u['text'] + '\n';
                        // }
                    }
                }
                target += '\n';
            }
            if (translateID.includes(id)) {
                setText(target);
            }
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}
