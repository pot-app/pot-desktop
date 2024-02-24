import { fetch } from '@tauri-apps/api/http';
const DISPLAY_FORMAT_DEFAULT = '发音, 快速释义, 变形';

export async function translate(text, from, to) {
    if (from == 'auto') {
        if (/^[\u4e00-\u9fff]/.test(text)) {
            from = 'zh-cn';
        } else if (/^[A-Za-z]/.test(text)) {
            from = 'en-us';
        }
    }
    if (from == to) {
        return text;
    }
    // only supports word translation
    // if (text.split(/[\s,，]/).length > 1) {
    //     return '';
    // }

    const res = await fetch(
        `https://www.bing.com/api/v6/dictionarywords/search?q=${text}&appid=371E7B2AF0F9B84EC491D731DF90A55719C7D209&mkt=zh-cn&pname=bingdict`
    );
    if (res.ok) {
        const result = res.data;
        const meaningGroups = result.value[0].meaningGroups;
        if (meaningGroups.length === 0) {
            throw `Words not yet included: ${text}`;
        }
        const formats = DISPLAY_FORMAT_DEFAULT.trim().split(/,\s*/);
        const formatGroups = meaningGroups.reduce(
            (acc, cur) => {
                const group = acc[cur.partsOfSpeech?.[0]?.description || cur.partsOfSpeech?.[0]?.name];
                if (Array.isArray(group)) {
                    group.push(cur);
                }
                return acc;
            },
            formats.reduce((acc, cur) => {
                acc[cur] = [];
                return acc;
            }, {})
        );
        let target = { pronunciations: [], explanations: [], associations: [], sentence: [] };
        for (const pronunciation of formatGroups['发音']) {
            target.pronunciations.push({
                region: pronunciation.partsOfSpeech[0].name,
                symbol: pronunciation.meanings[0].richDefinitions[0].fragments[0].text,
                voice: '',
            });
        }
        for (const explanation of formatGroups['快速释义']) {
            target.explanations.push({
                trait: explanation.partsOfSpeech[0].name,
                explains: explanation.meanings[0].richDefinitions[0].fragments.map((x) => {
                    return x.text;
                }),
            });
        }
        if (formatGroups['变形'][0]) {
            for (const association of formatGroups['变形'][0].meanings[0].richDefinitions[0].fragments) {
                target.associations.push(association.text);
            }
        }
        return target;
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

export * from './Config';
export * from './info';
