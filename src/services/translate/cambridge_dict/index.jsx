import { fetch } from '@tauri-apps/api/http';
import { Language } from './info';

class Pronunciation {
    constructor(region, symbol, voice) {
        this.region = region;
        this.symbol = symbol;
        this.voice = voice;
    }
}

class Explanation {
    constructor(trait, explains) {
        this.trait = trait;
        this.explains = explains;
    }
}

class WordTranslateResult {
    constructor(pronunciations, explanations, sentence) {
        this.pronunciations = pronunciations;
        this.explanations = explanations;
        this.sentence = sentence;
    }
}

function tryDetectLanguage(text) {
    if (/^[A-Za-z]/.test(text)) {
        return Language.en;
    }
    return null;
}

// Recursively render a node tree into the desired string
function render(node) {
    // Plain text: keep as-is
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
    }

    // <a class="query"> … </a> → just its text
    if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName === 'A' &&
        node.classList.contains('query')
    ) {
        return node.textContent;
    }

    // <strong> … </strong> Or <span> … </span> → wrap in <b> … </b>
    // The bold type is not a highlight of the target word, but a highlight of the collocation.
    // In Cambridge Dictionary, any parts in bold type are typical collocations, and therefore worth learning.
    if (
        node.nodeType === Node.ELEMENT_NODE &&
        (node.tagName === 'STRONG' || node.tagName === 'SPAN')
    ) {
        return `<b>${node.textContent}</b>`;
    }

    // Any other element: recurse into its children
    return Array.from(node.childNodes).map(render).join('').trim();
}

// 翻译服务商：https://dictionary.cambridge.org/
export async function translate(text, from, to) {
    if (Language.auto === from) {
        from = tryDetectLanguage(text) ?? from;
    }
    // only supports English word translation
    if (from !== Language.en || to === undefined || to === from || text.split(' ').length > 1) {
        return '';
    }

    const url = `https://dictionary.cambridge.org/search/direct/?datasetsearch=${from}-${to}&q=${text}`;
    let res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'text/html;charset=UTF-8',
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
        const wordTranslateResult = dict['result'] || new WordTranslateResult([], [], []);

        if (wordTranslateResult.pronunciations.length === 0) {
            const pronunciationNodes = entryNode.querySelectorAll('.dpron-i');
            const pronunciations = [...pronunciationNodes].map((pronunciationNode) => {
                const region = pronunciationNode.querySelector('.region').innerText;
                const symbol = pronunciationNode.querySelector('.pron').innerText;
                let voice = pronunciationNode.querySelector('.daud source').src;
                voice = voice.replace(/^https?:\/\/[^/]+/, 'https://dictionary.cambridge.org');
                voice = voice.replace(/^tauri:\/\/[^/]+/, 'https://dictionary.cambridge.org');
                return new Pronunciation(region, symbol, voice);
            });
            wordTranslateResult.pronunciations.push(...pronunciations);
        }

        const wordPos = entryNode.querySelector('.posgram')?.innerText;
        const defBlockNodes = entryNode.querySelectorAll('.sense-body.dsense_b .def-block.ddef_block');
        const explanations = [...defBlockNodes].filter((defBlockNode) => {
            // If node has attribute data-wl-senseid and contains panel, skip it
            return !defBlockNode.hasAttribute('data-wl-senseid') || !defBlockNode.getAttribute('data-wl-senseid').includes('panel');
        }).map((defBlockNode) => {
            const engDef = defBlockNode.querySelector('.ddef_h .def.ddef_d.db').innerText.replace(/\s+/g, ' ').trim();

            const trait = wordPos ?? engDef.replace(/\s+/g, ' ').trim();
            const explains = [engDef, ...defBlockNode.querySelector('.def-body.ddef_b .trans.dtrans.dtrans-se.break-cj').innerText.replace(/\s+/g, ' ').trim().split(';')];
            return new Explanation(trait, explains);
        });
        wordTranslateResult.explanations.push(...explanations);

        const sentences = [...defBlockNodes]
            .filter((defBlockNode) => {
                // If exists, add the sentence
                return defBlockNode.querySelector('div.examp span.eg');
            })
            .map((defBlockNode) => {
                // Only the first sentence is added
                const result = Array.from(defBlockNode.querySelector('div.examp span.eg').childNodes).map(render).join('').trim();
                return { source: result };
            });
        wordTranslateResult.sentence.push(...sentences);

        dict['result'] = wordTranslateResult;
        return dict;
    }, {});
    for (let i of resultMap.result.pronunciations) {
        const res = await fetch(i.voice, { responseType: 3 });
        if (res.ok) {
            i.voice = res.data;
        }
    }
    return resultMap.result;
}

export * from './Config';
export * from './info';
