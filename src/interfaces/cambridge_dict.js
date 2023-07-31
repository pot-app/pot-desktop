import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

class Pronunciation {
    region;
    symbol;
    voice;
    constructor(region, symbol, voice) {
        this.region = region;
        this.symbol = symbol;
        this.voice = voice;
    }
}

class Explanation {
    trait;
    description;
    constructor(trait, description) {
        this.trait = trait;
        this.description = description;
    }
}

class WordTranslateResult {
    word;
    pronunciations;
    explanations;
    constructor(word, pronunciations, explanations) {
        this.word = word;
        this.pronunciations = pronunciations;
        this.explanations = explanations;
    }
}

// 翻译服务商：https://dictionary.cambridge.org/
class CambridgeDictWordTranslator {
    name = 'cambridge_dict';
    needs = [];
    #supportLanguageMap = {
        en: 'english',
        zh_cn: 'chinese-simplified',
        zh_tw: 'chinese-traditional',
    };
    static autoLanguage = 'auto';
    static spacesReg = /\s+/g;

    tryDetectLanguage(text) {
        if (/^[A-Za-z]/.test(text)) {
            return this.#supportLanguageMap.en;
        }
        return null;
    }

    async translate(text, from, to, secondLanguageSupplier) {
        const fromLanguage = (v => {
            if (CambridgeDictWordTranslator.autoLanguage === v) {
                return this.tryDetectLanguage(text) ?? this.#supportLanguageMap[v];
            }
            return this.#supportLanguageMap[v];
        })(from);
        const toLanguage = (v => {
            const toLanguage = this.#supportLanguageMap[v];
            if (fromLanguage === toLanguage) {
                return this.#supportLanguageMap[secondLanguageSupplier()];
            }
            return toLanguage;
        })(to);

        // only supports English word translation
        if (fromLanguage !== this.#supportLanguageMap.en || toLanguage === undefined || toLanguage === fromLanguage || text.split(' ').length > 1) {
            return [];
        }

        const url = `https://dictionary.cambridge.org/search/direct/?datasetsearch=${fromLanguage}-${toLanguage}&q=${text}`;
        let res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/html;charset=UTF-8',
                'User-Agent': 'pot translate',
            },
            responseType: 2,
        });

        if (!res.ok) {
            throw new Error(`Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`);
        }
        const doc = new DOMParser().parseFromString(res.data, 'text/html');
        const entryNodes = doc.querySelectorAll('.pr.entry-body__el');
        if (entryNodes.length === 0) {
            throw new Error(`Words not yet included: ${text}`);
        }

        const resultMap = [...entryNodes].reduce((dict, entryNode) => {
            const word = entryNode.querySelector('.hw.dhw').innerText;
            const wordTranslateResult = dict[word] || new WordTranslateResult(word, [], []);

            if (wordTranslateResult.pronunciations.length === 0) {
                const pronunciationNodes = entryNode.querySelectorAll('.dpron-i');
                const pronunciations = [...pronunciationNodes].map(pronunciationNode => {
                    const region = pronunciationNode.querySelector('.region').innerText;
                    const symbol = pronunciationNode.querySelector('.pron').innerText;
                    const voice = pronunciationNode.querySelector('.daud source').src;
                    return new Pronunciation(region, symbol, voice);
                });
                wordTranslateResult.pronunciations.push(...pronunciations);
            }

            const wordPos = entryNode.querySelector('.posgram')?.innerText;
            const defBlockNodes = entryNode.querySelectorAll('.sense-body.dsense_b .def-block.ddef_block');
            const explanations = [...defBlockNodes].map(defBlockNode => {
                const trait = wordPos ?? defBlockNode.querySelector('.ddef_h .def.ddef_d.db').innerText.replace(CambridgeDictWordTranslator.spacesReg, ' ').trim();
                const description = defBlockNode.querySelector('.def-body.ddef_b .trans.dtrans.dtrans-se.break-cj').innerText;
                return new Explanation(trait, description);
            });
            wordTranslateResult.explanations.push(...explanations);
            
            dict[word] = wordTranslateResult;
            return dict;
        }, {});

        return Object.values(resultMap);
    }
}

const INSTANCE = new CambridgeDictWordTranslator();
export const info = {
    name: INSTANCE.name,
    needs: INSTANCE.needs,
}
export async function translate(text, from, to, setText, id) {
    const results = await INSTANCE.translate(text, from, to, () => get('second_language') ?? 'en');
    const content = results.map(result => {
        const pronunciationText = result.pronunciations.map(pronunciation => `${pronunciation.region}. ${pronunciation.symbol}`).join("\t");
        const lines = [];
        lines.push(`${result.word}: ${pronunciationText}`);
        lines.push(...result.explanations.map(explanation => `${explanation.trait}. ${explanation.description}`));
        return lines.join("\n");
    }).join("\n\n");
    if (translateID.includes(id)) {
        setText(content);
    }
}
